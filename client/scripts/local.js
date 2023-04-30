const numberPlayers = 2;

let gameState = 0;
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
				if (!gameState){ start() ; gameState = 1 ; } break ;
		}
	})
}


function stopGame(x){
	clearInterval(moveBallInterval);
	let score = document.querySelector(`.score.p${x+1}>p`);
	score.textContent = parseInt(score.textContent) + 1;
	gameState = 0;
	document.getElementById('msg').style.display = 'block';
}