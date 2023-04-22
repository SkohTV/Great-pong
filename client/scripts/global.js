//
//* Load the config
//


// Load default yaml file
document.getElementById('custom-yaml').value = `ball:
  speed: 5
  size: 20
  color: 008000
  isBall: false
arena:
  size: 300
  border: 3
  borderColor: 000000
  backgroundColor: faebd7
player:
  size: 100
  width: 10
  space: 40
  speed: 4
  color:
    - ff2222
    - 2222ff`;

// Default configs of the game (can be overriden through yaml config file)
let gameConfig = parseYaml();


//
//* Scripts above are run FIRST and ONCE on load
//* Scripts below are called functions WHEN START GAME
//
//
//* Update CSS on the page (for easier access with server)
//


function loadOnceCSS(){
	const tmpArena = document.getElementById('arena')
	const tmpBall = document.getElementById('ball')

	//! Small fix
	// Round to ballSpeed the width of arena
	// For better accuracy of ball
	document.body.style.width = tmpArena.offsetWidth - (tmpArena.offsetWidth % gameConfig.ballSpeed) + gameConfig.arenaBorder*2 + 'px'
	document.body.style.height = tmpArena.offsetHeight - (tmpArena.offsetWidth % gameConfig.ballSpeed) + gameConfig.arenaBorder*2 + 'px'

	tmpBall.style.width = gameConfig.ballSize + 'px';
	tmpBall.style.backgroundColor = '#' + gameConfig.ballColor;
	tmpBall.style.borderRadius = gameConfig.isBall ? '100%' : '0%';

	tmpArena.style.height = gameConfig.arenaSize + 'px';
	tmpArena.style.borderWidth = gameConfig.arenaBorder + 'px';
	tmpArena.style.borderColor = '#' + gameConfig.arenaBorderColor;
	tmpArena.style.backgroundColor = '#' + gameConfig.arenaBackgroundColor;

	document.querySelectorAll('.player').forEach( (x, i) => {
		x.style.backgroundColor = '#' + gameConfig.playerColor[i];
		x.style.height = gameConfig.playerSize + 'px';
		x.style.width = gameConfig.playerWidth + 'px'
		
		switch (i){
			case 0:
				x.style.left = tmpArena.offsetLeft + gameConfig.arenaBorder + gameConfig.playerSpace + 'px' ; break ;
			case 1:
				x.style.left = tmpArena.offsetLeft + tmpArena.offsetWidth - gameConfig.playerWidth - gameConfig.arenaBorder - gameConfig.playerSpace + 'px' ; break ;
			//case 2:
			//	x.style.left = tmpArena.offsetLeft + gameConfig.arenaBorder + gameConfig.playerSpace + 'px'
			//case 3:
			//	x.style.left = tmpArena.offsetLeft + gameConfig.arenaBorder + gameConfig.playerSpace + 'px'
		}
	})
}
//arena.right + arena.item.offsetLeft - gameConfig.arenaBorder - gameConfig.playerSpace - gameConfig.playerWidth - gameConfig.ballSize

function loadInstantCSS(){
	// Ball position
	ball.item.style.top = ball.yPos + 'px';
	ball.item.style.left = ball.xPos + 'px';

	// Player position
	playerX.forEach(x => x.item.style.top = x.yPos + 'px')
}


//
//* Init of global variables
//


// Key pressed array, for key remapping
let keyPressed = [];
let ball = {};
let arena = {};
let player = {};

function initGlobals(){
	const tmpArena = document.getElementById('arena');

	// Default params for the arena
	arena = {
		top : tmpArena.offsetTop + gameConfig.arenaBorder,
		bottom : tmpArena.offsetHeight - gameConfig.arenaBorder,
		left : tmpArena.offsetLeft + gameConfig.arenaBorder,
		right : tmpArena.offsetWidth - gameConfig.arenaBorder,
		item : document.getElementById('arena')
	};

	// Default params for the ball
	ball = {
		xDir : gameConfig.ballSpeed, // X direction
		yDir : gameConfig.ballSpeed, // Y direction
		xPos : parseInt(arena.bottom / 2) + (gameConfig.arenaSize % gameConfig.ballSpeed), // X position
		yPos : parseInt(gameConfig.arenaSize / 2) + (gameConfig.arenaSize % gameConfig.ballSpeed), // Y position
		item : document.getElementById('ball') // Item from DOM
	};

	// Default params for a player
	player = {
		width : document.getElementById('p1').offsetWidth + gameConfig.arenaBorder,
		height : document.getElementById('p1').offsetHeight,
		speed : gameConfig.playerSpeed,
	};
}

// Player object



//
//* Cool design pattern (read the fcking book)
//

class Player{
	constructor(id, up, down){
		this.item = document.getElementById(`p${id}`);
		this.yPos = ((arena.bottom / 2 + arena.top) - (gameConfig.playerSize / 2 - gameConfig.arenaBorder));
		this.ctrlUp = up
		this.ctrlDown = down
	}
}

function playerFactory(x, arr){
	// No list comprehension ? Sadge
	let tmpList = [];
	for (let i = 1 ; i < (2*x)+1 ; i+=2){
		tmpList.push(new Player(Math.ceil(i/2), arr[i-1], arr[i]))
	}
	return tmpList;
}


//
//* Keyboard control
//


// How to remap key press to avoid "writting behavior"
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
			case playerX[0].ctrlUp:
				if (gameState){ movePlayer(0, -player.speed); } break ;
			case playerX[0].ctrlDown:
				if (gameState){ movePlayer(0,  player.speed); } break ;
			case playerX[1].ctrlUp:
				if (gameState){ movePlayer(1, -player.speed); } break ;
			case playerX[1].ctrlDown:
				if (gameState){ movePlayer(1,  player.speed); } break ;
			case 'Space':
				if (!gameState){ start() ; gameState = 1 ; } break ;
		}
	})
}


//
//* Movement functions (maths)
//


function moveBall(){
	const newBallXPos = ball.xPos + ball.xDir;
	const newBallYPos = ball.yPos + ball.yDir;

	if (newBallXPos <= arena.left + gameConfig.playerSpace + gameConfig.playerWidth) {
		if ((ball.yPos+gameConfig.ballSize >= playerX[0].yPos) && (ball.yPos <= playerX[0].yPos+player.height)){
			ball.xDir = Math.abs(ball.xDir);
		}
	}

	if (newBallXPos >= arena.right + arena.item.offsetLeft - gameConfig.playerSpace - gameConfig.playerWidth - gameConfig.ballSize) {
		if (ball.yPos+gameConfig.ballSize >= playerX[1].yPos && ball.yPos <= playerX[1].yPos+player.height){
			ball.xDir = -Math.abs(ball.xDir);
		}
	}

	if (newBallYPos > arena.bottom + arena.top - gameConfig.ballSize - gameConfig.arenaBorder){ ball.yDir = -Math.abs(ball.yDir); }
	if (newBallYPos < arena.top){ ball.yDir = Math.abs(ball.yDir); }
	if (newBallXPos > arena.right + gameConfig.arenaBorder){ stopGame(0) ; return ; }
	if (newBallXPos < arena.left){ stopGame(1) ; return ; }

	ball.xPos += ball.xDir;
	ball.yPos += ball.yDir;

	loadInstantCSS();
}

function movePlayer(p, x){
	playerX[p].yPos += x
	const bottomBorder = arena.top + gameConfig.arenaSize - player.height;
	if (playerX[p].yPos < arena.top){ playerX[p].yPos = arena.top }
	if (playerX[p].yPos > bottomBorder){ playerX[p].yPos = bottomBorder }
	loadInstantCSS();
}


//
//* Stop/start the game
//


function stopGame(x){
	clearInterval(moveBallInterval);
	clearInterval(keyboardCtrlInterval);
	console.log(x + ' win');
	gameState = 0;
}


//
//* Buttons & listeners
//

window.onload = () => {
	// Update gameConfig params
	document.getElementById('update').addEventListener('click', displayLoader);

	// This whole purpose it to override tab presses to '  ' for yaml config :)
	document.getElementById('custom-yaml').addEventListener('keydown', (event) => {
		if (event.key === 'Tab') {
			event.preventDefault();
			const start = myInput.selectionStart;
			const end = myInput.selectionEnd;
			const value = myInput.value;
			myInput.value = value.substring(0, start) + '  ' + value.substring(end);
			myInput.selectionStart = myInput.selectionEnd = start + 1;
		}
	});
}

function parseYaml() {
	const yamlString = document.getElementById('custom-yaml').value
	const lines = yamlString.split('\n');


	let parsedYaml = {playerColor: []}; // We init with an array because otherwise can't push
	let mode = 'none'

	for (let line of lines) { // Loop through each lines
		line = line.trim() // Remove spaces

		if (line === ''){ continue ; } // Empty => pass
		if (line.substring(0,2) === '- '){ parsedYaml['playerColor'].push(line.substring(2)) ; continue ; } // Color => push array

		// Split line to key/value pair
		let [key, value] = line.split(':').map(s => s.trim());

		// If no value, then key is mode
		if (value === '') { mode = key}

		// Match human value to program value
		else {
			if (mode === 'ball'){
				if (key === 'speed'){ parsedYaml['ballSpeed'] = parseInt(value) }
				else if (key === 'size'){ parsedYaml['ballSize'] = parseInt(value) }
				else if (key === 'color'){ parsedYaml['ballColor'] = value }
				else if (key === 'isBall'){ parsedYaml['isBall'] = (value === 'true' ? 1 : 0) }
			}
			else if (mode === 'arena'){
				if (key === 'size'){ parsedYaml['arenaSize'] = parseInt(value) }
				else if (key === 'border'){ parsedYaml['arenaBorder'] = parseInt(value) }
				else if (key === 'borderColor'){ parsedYaml['arenaBorderColor'] = value }
				else if (key === 'backgroundColor'){ parsedYaml['arenaBackgroundColor'] = value }
			}
			else if (mode === 'player'){
				if (key === 'size'){ parsedYaml['playerSize'] = parseInt(value) }
				else if (key === 'width'){ parsedYaml['playerWidth'] = parseInt(value) }
				else if (key === 'space'){ parsedYaml['playerSpace'] = parseInt(value) }
				else if (key === 'speed'){ parsedYaml['playerSpeed'] = parseInt(value) }
			}
		}
	}
	return parsedYaml; // Return final value
}