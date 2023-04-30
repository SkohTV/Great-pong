// SAVE
const queryParams = new URLSearchParams(window.location.search);
const gameID = queryParams.get('id');
document.querySelector('#gameID>p').textContent = `GameID = ${gameID}`;
// SAVE


const numberPlayers = 2;

let gameState = 0;
let playerX = [];

let keyboardCtrlInterval = []
let moveBallInterval = undefined;

let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']



displayLoader(); // To make the map look cool on load

loadOnceCSS();
remapKeys();



// MULTIPLAYER ZONE
const socket = io();

let playerID = undefined;
let isAdmin = undefined;

socket.emit('newPlayer-versus-ask', gameID);

socket.on('newPlayer-versus-rep', data => {
	if (playerID === undefined){
		playerID = data;
		isAdmin = (playerID === 1 ? true : false);

		if (playerID > numberPlayers) { window.location.replace('/') }
		else { hideParams() }
		if (isAdmin) { setInterval(keyboardControlGlobal, 5) }

		document.querySelector('#playerID>p').textContent = `You are player ${playerID}`;
		firstLoadCommunicate();
		setInterval(communication, 5);
		keyboardCtrlInterval = setInterval(() => keyboardControlPlayer(playerID - 1), 5)
	}
});


function communication(){
	if (isAdmin){
		let data = {
			gameState: gameState,
			playerX: playerX,
			gameConfig: gameConfig,
			ball: ball,
		}
		let package = {id: gameID, data: data}
		socket.emit(`message-game-admin`, package)
	} else {
		let data = [playerID-1, playerX[playerID-1].yPos]
		let package = {id: gameID, data: data}
		socket.emit(`message-game-player`, package)
	}
}


function firstLoadCommunicate(){
	if (isAdmin){

		socket.on(`message-rep-admin-${gameID}`, res => {
			playerX[res[0]].yPos = res[1]
			loadInstantCSS();
		})

		socket.on(`askupdateCSS-rep-admin-${gameID}`, shareCSS)

		// Update gameConfig params
		document.getElementById('update').addEventListener('click', shareCSS)
	}

	else {

		socket.on(`message-rep-player-${gameID}`, res => {
			gameState = res.gameState;
			ball = res.ball;
			const tmpPlayerX = playerX;
			playerX.forEach( (x, i) => {
				if (i != playerID - 1){
					x.yPos = res.playerX[i].yPos;
				}
			})
			loadInstantCSS();
		})

		socket.on(`update-rep-player-${gameID}`, res => {
			gameConfig = res[0];
			arenaItem.style.width = res[1]
			displayLoader();
		})

		socket.on(`gameStarted-rep-${gameID}`, res => document.getElementById('controls').style.display = 'none')

		socket.on(`stopGame-rep-${gameID}`, res => {
			let score = document.querySelector(`.score.p${res+1}>p`);
			score.textContent = parseInt(score.textContent) + 1;
		})

		socket.emit(`askupdateCSS-ask-player`, {id: gameID});
	}
}


function shareCSS(){
	gameConfig = parseYaml();
	displayLoader();
	package = {id: gameID, pack: [gameConfig, arenaItem.style.width]};
	socket.emit(`update-game-admin`, package);
}


function hideParams(){
	if (!isAdmin) {
		document.getElementById('custom').style.display = 'none';
		document.getElementById('msg').style.display = 'none';
	}

	document.querySelectorAll('.ctrl').forEach( (x,i) => {
		if (i+1 != playerID) { x.style.display = 'none' }
	})
}


function keyboardControlGlobal(){
	keyPressed.forEach(key => {
		switch (key){
			case 'Space':
				if (!gameState){
					start();
					gameState = 1;
					socket.emit('gameStarted-ask', {id: gameID});
				} break ;
		}
	})
}


function stopGame(x){
	clearInterval(moveBallInterval);
	let score = document.querySelector(`.score.p${x+1}>p`);
	score.textContent = parseInt(score.textContent) + 1;
	socket.emit('stopGame-ask', {id: gameID, player: x});
	gameState = 0;
	document.getElementById('msg').style.display = 'block';
}