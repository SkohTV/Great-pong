let gameID = 9;
let gameState = 0;

let moveBallInterval = undefined;

let defaultCtrl = ['KeyR', 'KeyF', 'KeyO', 'KeyL']
let keyboardCtrlInterval = setInterval(keyboardControl, 5);


loadOnceCSS();
remapKeys();
playerX = undefined;


function start(){
	clearInterval(keyboardCtrlInterval)
	keyboardCtrlInterval = setInterval(keyboardControl, 5);

	displayLoader();

	moveBallInterval = setInterval(moveBall, 20);
	document.getElementById('controls').style.display = 'none';
	document.getElementById('msg').style.display = 'none';
	document.getElementById('custom').style.display = 'none';
}


function displayLoader(){
	gameConfig = parseYaml();
	initGlobals();
	playerX = playerFactory(2, defaultCtrl)
	loadInstantCSS();
	loadOnceCSS();

	initGlobals();
	playerX = playerFactory(2, defaultCtrl)
	loadInstantCSS();
}

displayLoader(); // To make the map look cool on load