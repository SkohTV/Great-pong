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

setInterval(keyboardControlGlobal, 5)

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

		// Update gameConfig params
		document.getElementById('update').addEventListener('click', () => {
			gameConfig = parseYaml();
			displayLoader();
			package = {id: gameID, gameConfig: gameConfig};
			socket.emit(`update-game-admin`, package);
		})
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
			console.log(res);
			gameConfig = res;
			displayLoader();
		})
	}
}