let gameID = 9;
let gameState = 0;
let moveBallInterval = undefined;
let keyboardCtrlInterval = undefined;
let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']

loadOnceCSS();
remapKeys();
playerX = undefined;

setInterval(keyboardControl, 5);

function start(){
	playerX = playerFactory(2, defaultCtrl)
	initGlobals();
	loadOnceCSS();
	moveBallInterval = setInterval(moveBall, 20);
	document.getElementById('infos').style.display = 'none';
}


function displayLoader(){
	playerX = playerFactory(2, defaultCtrl)
	gameConfig = parseYaml();
	initGlobals();
	playerX = playerFactory(2, defaultCtrl)
	loadOnceCSS();
	loadInstantCSS();
}

displayLoader(); // To make the map look cool on load