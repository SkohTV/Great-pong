// To get the gameID from the URL
const queryParams = new URLSearchParams(window.location.search);
const gameID = queryParams.get('id');
document.querySelector('#gameID>p').textContent = `GameID = ${gameID}`;


// Init of global variables
const numberPlayers = 2;

let gameState = 0;
let globalGamestate = 1;
let playerX = [];

let keyboardCtrlInterval = []
let moveBallInterval = undefined;

let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']
let starterPlayer = 1;


// Load all initialised values
gameConfig = parseYaml();
displayLoader(); 
loadOnceCSS();
remapKeys();



//
//* LINKING WITH SERVER AND 2nd PLAYER
//



const socket = io(); // Idk, but it's needed

// Could be changed, since scrapped idea more than 2 players, but too much refactor
// We need to keep track of :
let playerID = undefined; // Player number (1 or 2)
let isAdmin = undefined; // If the player is player 1

// Ask the server if we can join the game
socket.emit('newPlayer-versus-ask', gameID);

// When answer received, we get OUR playerID
socket.on('newPlayer-versus-rep', data => {
	if (playerID === undefined){
		playerID = data;
		isAdmin = (playerID === 1 ? true : false);

		// If more than 3 players, we redirect to the homepage
		if (playerID > numberPlayers) { window.location.replace('/') }
		
		// Else, we JUST HIDE THE PARAMS
		// Both user could access it, but they are useless if not shown (lucky that I implemented them this way)
		else { hideParams() }

		// Both players can start the game, BUT we have an additionnal condition
		setInterval(keyboardControlGlobal, 5);

		// Display the player number, and init communications
		document.querySelector('#playerID>p').textContent = `You are player ${playerID}`;
		firstLoadCommunicate(); // Only once communication
		setInterval(communication, 5); // Reccuring communication
		keyboardCtrlInterval = setInterval(() => keyboardControlPlayer(playerID - 1), 5) // Set our interval for OUR controls
	}
});


// Reccuring communication, every 5ms
function communication(){
	// If admin, we send ALL data to other player
	if (isAdmin){
		let data = {
			gameState: gameState,
			playerX: playerX,
			gameConfig: gameConfig,
			ball: ball,
		}
		let package = {id: gameID, data: data}
		socket.emit(`message-game-admin`, package)
	}
	
	// If player, we send our location to admin
	else {
		let data = [playerID-1, playerX[playerID-1].yPos]
		let package = {id: gameID, data: data}
		socket.emit(`message-game-player`, package)
	}
}


// Only run once at the beginning
function firstLoadCommunicate(){
	if (isAdmin){

		// When receive player position, update it
		socket.on(`message-rep-admin-${gameID}`, res => {
			playerX[res[0]].yPos = res[1]
			loadInstantCSS();
		})

		socket.on(`askupdateCSS-rep-admin-${gameID}`, shareCSS) // When p2 ask for (full) CSS update, we send it
		socket.on(`ballStuckNotAdmin-rep-${gameID}`, () => ballStuck(0)) // When p2 say that ball is stuck, we call the function
		socket.on(`plsStartGame-rep-${gameID}`, startGame) // When p2 ask to start the game, we start it

		// When click on update, we ALSO send the CSS to p2
		document.getElementById('update').addEventListener('click', shareCSS)
	}

	else {

		// When receive admin (ball, player...) positions, update them
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

		// When receive CSS from admin, then update our own
		socket.on(`update-rep-player-${gameID}`, res => {
			gameConfig = res[0];
			arenaItem.style.width = res[1]
			displayLoader();
		})

		socket.on(`gameStarted-rep-${gameID}`, res => document.getElementById('controls').style.display = 'none') // When admin start the game, we hide the controls
		socket.on(`stopGame-rep-${gameID}`, res => { displayScore(res) }) // When admin stop the game, we display the score
		socket.emit(`askupdateCSS-ask-player`, {id: gameID}); // When we join, we ask for the CSS
	}
}


// FOR ADMIN ONLY
// Send OUR css to p2
function shareCSS(){
	gameConfig = parseYaml();
	displayLoader(); // Also need to load it, because it's bind to the update button
	package = {id: gameID, pack: [gameConfig, arenaItem.style.width]};
	socket.emit(`update-game-admin`, package);
}


// Depending on admin or not, we hide different things
function hideParams(){
	// If admin, we hide both elements
	if (!isAdmin) {
		document.getElementById('custom').style.display = 'none';
		document.getElementById('msg').style.display = 'none';
	}

	// In both case, we hide the controls
	document.querySelectorAll('.ctrl').forEach( (x,i) => {
		if (i+1 != playerID) { x.style.display = 'none' }
	})
}


// BOTH PLAYERS have access to this, but added case to check for allowed or not
function keyboardControlGlobal(){
	keyPressed.forEach(key => {
		switch (key){
			case 'Space':
				// globalGamestate : is the game NOT finished ?
				// gameState : is the game currently playing ?
				// TEXTAREA : is the user typing in the config box ?
				//
				// starterPlayer : the player that can start the game (so only one player can start it)
				if (playerID === starterPlayer && globalGamestate && !gameState && !(document.activeElement.tagName === 'TEXTAREA' || document.activeElement.nodeName === 'TEXTAREA')){
					if (isAdmin){ startGame(); } // If admin, we start the game
					else { socket.emit('plsStartGame-ask', {id: gameID}); } // Else, we KINDLY ASK for the admin to start it
				} break ;
		}
	})
}


// ADMIN ONLY
// Either when start game, or ASKED to start the game
function startGame(){
	start();
	gameState = 1;
	socket.emit('gameStarted-ask', {id: gameID}); // And we tell p2 that we started the game
}


// ADMIN ONLY
// We stop the game and send tell it to p2
function stopGame(x){
	// Send a message to p2 to say that we stopped the game
	socket.emit('stopGame-ask', {id: gameID, player: x});

	// Stop the game
	gameState = 0;
	clearInterval(moveBallInterval);
	displayScore(x) // Long function, look below
}


// BOTH PLAYERS have access to this
// Display the score, stuck ball, and change the player that can start the game
// Also check if game is finished or not
function displayScore(x){
	// Set scores
	let scoreP1 = document.querySelector(`.score.p1>p`);
	let scoreP2 = document.querySelector(`.score.p2>p`);

	// Set who can start the game
	starterPlayer = (x^1) + 1 // x^1 -> bitwise XOR operation, convert 0 to 1 and 1 to 0
	if (starterPlayer === playerID){ document.getElementById('msg').style.display = 'block'; }

	// Change the score
	if (!x){ scoreP1.textContent = parseInt(scoreP1.textContent) + 1 ; } // if player 1
	else { scoreP2.textContent = parseInt(scoreP2.textContent) + 1 ; } // else player 2

	// If game NOT finished, early return
	// Else, skip and continue
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
	} else { // p2 win
		msg.textContent = 'Player 2 has won !';
		msg.style.color = '#' + gameConfig.playerColor[1];
	} 
	globalGamestate = 0;
}