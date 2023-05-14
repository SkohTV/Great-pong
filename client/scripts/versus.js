// SAVE
const queryParams = new URLSearchParams(window.location.search);
const gameID = queryParams.get('id');
document.querySelector('#gameID>p').textContent = `GameID = ${gameID}`;
// SAVE


const numberPlayers = 2;

let gameState = 0;
let globalGamestate = 1;
let playerX = [];

let keyboardCtrlInterval = []
let moveBallInterval = undefined;

let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']
let starterPlayer = 1;



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
		setInterval(keyboardControlGlobal, 5);

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
		socket.on(`ballStuckNotAdmin-rep-${gameID}`, () => ballStuck(0))
		socket.on(`plsStartGame-rep-${gameID}`, startGame)

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
			displayScore(res)
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
				if (playerID === starterPlayer && globalGamestate && !gameState && !(document.activeElement.tagName === 'TEXTAREA' || document.activeElement.nodeName === 'TEXTAREA')){
					if (isAdmin){ startGame(); }
					else { socket.emit('plsStartGame-ask', {id: gameID}); }
				} break ;
		}
	})
}


function startGame(){
	start();
	gameState = 1;
	socket.emit('gameStarted-ask', {id: gameID});
}


function stopGame(x){
	socket.emit('stopGame-ask', {id: gameID, player: x});
	gameState = 0;
	clearInterval(moveBallInterval);
	displayScore(x)
}


function displayScore(x){
	let scoreP1 = document.querySelector(`.score.p1>p`);
	let scoreP2 = document.querySelector(`.score.p2>p`);

	starterPlayer = (x^1) + 1 // x^1 -> bitwise XOR operation, convert 0 to 1 and 1 to 0
	console.log(starterPlayer)
	if (starterPlayer === playerID){ document.getElementById('msg').style.display = 'block'; }

	if (!x){ scoreP1.textContent = parseInt(scoreP1.textContent) + 1 ; } // if player 1
	else { scoreP2.textContent = parseInt(scoreP2.textContent) + 1 ; } // else player 2

	// Love list destructuring
	[scoreP1, scoreP2] = [scoreP1.textContent, scoreP2.textContent]
	if ((scoreP1 < 5 && scoreP2 < 5) || (Math.abs(scoreP1-scoreP2) < 2)){
		if (isAdmin){ moveBallInterval = setInterval(() => ballStuck(x), 5); } // Set an interval to stuck ball to a player
		else { socket.emit('ballStuckNotAdmin-ask', {id: gameID}); } // Asks for the admin to do it
		return;
	} // If condition isn't meet, no victory script
	// Get item for change
	document.getElementById('msg').style.display = 'block';
	const msg = document.querySelector('#msg>p');

	if (scoreP1>scoreP2){ // p1 win
		msg.textContent = 'Player 1 has won !';
		msg.style.color = '#' + gameConfig.playerColor[0];
	} else {
		msg.textContent = 'Player 2 has won !';
		msg.style.color = '#' + gameConfig.playerColor[1];
	} // p2 win
	globalGamestate = 0;
}