let gameID = 9;
let moveBallInterval = undefined;
let keyboardCtrlInterval = undefined;

let playerX = playerFactory(2)

function start(){
	remapKeys();
	loadOnceCSS();
	setInterval(keyboardControl, 5);
	moveBallInterval = setInterval(moveBall, 20);
	console.log("Done")
}

start();