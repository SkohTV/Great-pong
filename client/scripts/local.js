const numberPlayers = 2;

let gameState = 0;
let globalGamestate = 1;
let playerX = [];

let keyboardCtrlInterval = []
let moveBallInterval = undefined;


setInterval(keyboardControlGlobal, 5)

let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']


keyboardCtrlInterval = [setInterval(() => keyboardControlPlayer(0), 5), setInterval(() => keyboardControlPlayer(1), 5)]


window.onload = () => {
	// Update gameConfig params
	document.getElementById('update').addEventListener('click', () => { gameConfig = parseYaml() ; displayLoader() ; })
}


gameConfig = parseYaml();
displayLoader(); // To make the map look cool on load

loadOnceCSS();
remapKeys();

function keyboardControlGlobal(){
	keyPressed.forEach(key => {
		switch (key){
			case 'Space':
				if (globalGamestate && !gameState && !(document.activeElement.tagName === 'TEXTAREA' || document.activeElement.nodeName === 'TEXTAREA')){
					start();
					gameState = 1;
				} break;
		}
	})
}


function stopGame(x){
	gameState = 0;
	clearInterval(moveBallInterval);
	document.getElementById('msg').style.display = 'block';

	let scoreP1 = document.querySelector(`.score.p1>p`);
	let scoreP2 = document.querySelector(`.score.p2>p`);

	if (!x){ scoreP1.textContent = parseInt(scoreP1.textContent) + 1 ; } // if player 1
	else { scoreP2.textContent = parseInt(scoreP2.textContent) + 1 ; } // else player 2

	// Love list destructuring
	[scoreP1, scoreP2] = [scoreP1.textContent, scoreP2.textContent]
	if ((scoreP1 < 5 && scoreP2 < 5) || (Math.abs(scoreP1-scoreP2) < 2)){
		moveBallInterval = setInterval(() => ballStuck(x), 5); // Set an interval to stuck ball to a player
		return;
	} // If condition isn't meet, no victory script

	// Get item for change
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