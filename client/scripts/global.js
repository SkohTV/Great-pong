//
//* Init of global variables
//


// Key pressed array, for key remapping
let keyPressed = [];

// Default configs of the game (can be overriden through yaml config file)
const gameConfig = {
	ballSpeed : 5,
	ballStartPosX : 70,
	ballStartPosY : 240,
	ballSize : 40,
	ballColor : "008000",
	isBall : 1, // 0 == Square
	arenaBorder : 5,
	arenaBorderColor : "faebd7",
	arenaBackgroundColor : "000000",
	playerSpeed : 7,
	playerColor : "000000",
};


//! Small fix, not optimal but does its job well enough
// Round to ballSpeed the width of arena
// For better accuracy of ball
let tmpArena = document.getElementById('arena')
tmpArena.style.width = tmpArena.offsetWidth - (tmpArena.offsetWidth % gameConfig.ballSpeed) + 'px'


// Default params for the ball
let ball = {
	xDir : gameConfig.ballSpeed, // X direction
	yDir : gameConfig.ballSpeed, // Y direction
	xPos : gameConfig.ballStartPosX, // X position
	yPos : gameConfig.ballStartPosY, // Y position
	item : document.getElementById('ball') // Item from DOM
};

// Default params for the arena
let arena = {
	top : tmpArena.offsetTop + gameConfig.arenaBorder,
	bottom : tmpArena.offsetHeight + gameConfig.arenaBorder,
	left : tmpArena.offsetLeft + gameConfig.arenaBorder,
	right : tmpArena.offsetWidth + gameConfig.arenaBorder,
};

// Default params for a player
let player = {
	width : document.getElementById('p1').offsetWidth + gameConfig.arenaBorder,
	height : document.getElementById('p1').offsetHeight,
	speed : gameConfig.playerSpeed,
};

// Player object
class Player{
	constructor(id){
		this.item = document.getElementById(`p${id}`);
		this.yPos = (arena.bottom / 2);
	}
}


//
//* Cool design pattern (read the fcking book)
//


function playerFactory(x){
	// No list comprehension ? Sadge
	let tmpList = [];
	for (let i = 1 ; i < x+1 ; i++){
		tmpList.push(new Player(i))
	}
	return tmpList;
}


//
//* Keyboard control
//


// How to remap key press to void "writting behavior"
// https://stackoverflow.com/questions/3691461/remove-key-press-delay-in-javascript
function remapKeys() {
	// Remap key press
	document.onkeydown = e => {
		if (keyPressed.includes(e.code)){ return; }
		keyPressed.push(e.code) // Add to keypresses
	}
	// Remap key release
	document.onkeyup = e => {
		if (!keyPressed.includes(e.code)){ return; }
		keyPressed.splice(keyPressed.indexOf(e.code), 1); // Remove key press
	}
	// If window out of focus, clear keys
	window.onblur = () => {
		keyPressed = [];
	}
}


function keyboardControl(){
	keyPressed.forEach(key => {
		switch (key){
			case 'KeyR':
				movePlayer(0, - player.speed) ; break ;
			case 'KeyF':
				movePlayer(0, player.speed) ; break ;
			case 'KeyO':
				movePlayer(1, - player.speed) ; break ;
			case 'KeyL':
				movePlayer(1, player.speed) ; break ;
		}
	})
}


//
//* Movement functions (maths)
//


function moveBall(){
	const newBallXPos = ball.xPos + ball.xDir;
	const newBallYPos = ball.yPos + ball.yDir;

	if (newBallXPos < arena.left + player.width) {
		if ((ball.yPos+gameConfig.ballSize > playerX[0].yPos) && (ball.yPos < playerX[0].yPos+player.height)){
			ball.xDir = Math.abs(ball.xDir);
		}
	}

	if (newBallXPos > arena.right - player.width - gameConfig.arenaBorder) {
		if (ball.yPos+gameConfig.ballSize > playerX[1].yPos && ball.yPos < playerX[1].yPos+player.height){
			ball.xDir = -Math.abs(ball.xDir);
		}
	}

	if (newBallYPos > arena.bottom){ ball.yDir = -Math.abs(ball.yDir); }
	if (newBallYPos < arena.top){ ball.yDir = Math.abs(ball.yDir); }
	if (newBallXPos > arena.right){ console.log('P1 win') ; stopGame(0) ; return ;}
	if (newBallXPos < arena.left){ console.log('P2 win') ; stopGame(1) ; return ;}

	ball.xPos += ball.xDir;
	ball.yPos += ball.yDir;

	loadInstantCSS();
}


function movePlayer(p, x){
	playerX[p].yPos += x
	const bottomBorder = arena.bottom - player.height/2 - gameConfig.arenaBorder*2
	if (playerX[p].yPos < arena.top){ playerX[p].yPos = arena.top}
	if (playerX[p].yPos > bottomBorder){ playerX[p].yPos = bottomBorder }
	loadInstantCSS();
}


//
//* Update CSS on the page (for easier access with server)
//


function loadOnceCSS(){
	loadInstantCSS();
	ball.item.style.width = gameConfig.ballSize + 'px';
	ball.item.style.backgroundColor = '#' + gameConfig.ballColor;
	ball.item.style.borderRadius = gameConfig.isBall ? '100%' : '0%';
	document.getElementById('arena').style.arenaBorderWidth = gameConfig.arenaBorder + 'px';
	document.getElementById('arena').style.arenaBorderColor = '#' + gameConfig.arenaBorderColor;
	document.getElementById('arena').style.arenaBackgroundColor = '#' + gameConfig.arenaBackgroundColor;
	playerX.forEach(x => x.item.style.backgroundColor = '#' + gameConfig.playerColor)
}

function loadInstantCSS(){
	// Ball position
	ball.item.style.top = ball.yPos + 'px';
	ball.item.style.left = ball.xPos + 'px';

	// Player position
	playerX.forEach(x => x.item.style.top = x.yPos + 'px')
}


//
//* Stop the game (more like a pause)
//


function stopGame(x){
	clearInterval(moveBallInterval);
	clearInterval(keyboardCtrlInterval);
	console.log(x + " win");
}