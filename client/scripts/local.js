// Init of global variables
const numberPlayers = 2;

let gameState = 0;
let globalGamestate = 1;
let playerX = [];

let keyboardCtrlInterval = []
let moveBallInterval = undefined;


// Start the 'Space' Key listener (to start the game)
setInterval(keyboardControlGlobal, 5)


// Init of keyboard control for BOTH players (we keep inside array to stop it later)
let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']
keyboardCtrlInterval = [setInterval(() => keyboardControlPlayer(0), 5), setInterval(() => keyboardControlPlayer(1), 5)]


// Update gameConfig params when on click
window.onload = () => {
	document.getElementById('update').addEventListener('click', () => { gameConfig = parseYaml() ; displayLoader() ; })
}


// Load all initialised values
gameConfig = parseYaml();
displayLoader(); 
loadOnceCSS();
remapKeys();




// Handle start the game inputs
function keyboardControlGlobal(){
	keyPressed.forEach(key => {
		switch (key){
			case 'Space':
				// globalGamestate : is the game NOT finished ?
				// gameState : is the game currently playing ?
				// TEXTAREA : is the user typing in the config box ?
				if (globalGamestate && !gameState && !(document.activeElement.tagName === 'TEXTAREA' || document.activeElement.nodeName === 'TEXTAREA')){
					start();
					gameState = 1;
				} break;
		}
	})
}


// Called when stopping the game
function stopGame(x){
	// Stop the game
	gameState = 0;
	clearInterval(moveBallInterval);
	document.getElementById('msg').style.display = 'block';

	// Set scores
	let scoreP1 = document.querySelector(`.score.p1>p`);
	let scoreP2 = document.querySelector(`.score.p2>p`);
	if (!x){ scoreP1.textContent = parseInt(scoreP1.textContent) + 1 ; } // if player 1
	else { scoreP2.textContent = parseInt(scoreP2.textContent) + 1 ; } // else player 2

	// If game NOT finished, early return
	// Else, skip and continue
	[scoreP1, scoreP2] = [scoreP1.textContent, scoreP2.textContent]
	if ((scoreP1 < 5 && scoreP2 < 5) || (Math.abs(scoreP1-scoreP2) < 2)){
		moveBallInterval = setInterval(() => ballStuck(x), 5); // Set an interval to stick ball to a player
		return;
	}

	// Get item to display winner text
	const msg = document.querySelector('#msg>p');

	if (scoreP1>scoreP2){ // p1 win
		msg.textContent = 'Player 1 has won !';
		msg.style.color = '#' + gameConfig.playerColor[0];
	} else { // p2 win
		msg.textContent = 'Player 2 has won !';
		msg.style.color = '#' + gameConfig.playerColor[1];
	} globalGamestate = 0; // Game is finished
}