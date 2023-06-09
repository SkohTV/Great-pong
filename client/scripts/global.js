//
//* Load the config
//



// Load default yaml file
document.getElementById('custom-yaml').value = `ball:
  speed: 5
  size: 20
  color: 008000
  isBall: 100
arena:
  size: 400
  border: 3
  borderColor: 000000
  backgroundColor: faebd7
player:
  size: 100
  width: 10
  space: 40
  speed: 4
  color:
    - ee4b2b
    - 6495ed`;


// Default configs of the game (can be overriden through yaml config file)
let gameConfig = parseYaml();

const ballItem = document.getElementById('ball') // Item from DOM
const arenaItem = document.getElementById('arena') // Item from DOM


//! Make the arena width definitive (otherwise impossible to use)
// Not exact, but at least rounded to integer
arenaItem.style.width = arenaItem.offsetWidth - (gameConfig.arenaBorder*2) + 'px'



//
//* Scripts above are run FIRST and ONCE on load
//* Scripts below are functions called when display update
//
//* Update CSS on the page
//



// Heavy cost CSS, called on update
function loadOnceCSS(){
	// Ball css
	ballItem.style.width = gameConfig.ballSize + 'px';
	ballItem.style.backgroundColor = '#' + gameConfig.ballColor;
	ballItem.style.borderRadius = gameConfig.isBall + '%';

	// Arena css
	arenaItem.style.height = gameConfig.arenaSize + 'px';
	arenaItem.style.borderWidth = gameConfig.arenaBorder + 'px';
	arenaItem.style.borderColor = '#' + gameConfig.arenaBorderColor;
	arenaItem.style.backgroundColor = '#' + gameConfig.arenaBackgroundColor;

	// Score css
	document.querySelectorAll('.score').forEach( (x, i) => {
		x.style.backgroundColor = '#' + gameConfig.playerColor[i];
	})

	// Player css
	document.querySelectorAll('.player').forEach( (x, i) => {
		x.style.backgroundColor = '#' + gameConfig.playerColor[i];
		x.style.height = gameConfig.playerSize + 'px';
		x.style.width = gameConfig.playerWidth + 'px'
		
		// Leftover from previous multiplayer idea, can be reformated (not deleted), but don't really matter anyway
		switch (i){
			case 0:
				x.style.left = arenaItem.offsetLeft + gameConfig.arenaBorder + gameConfig.playerSpace + 'px' ; break ;
			case 1:
				x.style.left = arenaItem.offsetLeft + arenaItem.offsetWidth - gameConfig.playerWidth - gameConfig.arenaBorder - gameConfig.playerSpace + 'px' ; break ;
		}
	})

	// https://stackoverflow.com/a/60357706/21143650 (see SASS var to CSS var in SASS file)
	let i = 0;
	for (const select of ['.p1.up', '.p1.down', '.p2.up', '.p2.down']){
		const index = Math.floor(i/2)
		document.querySelector(select).style.setProperty(`--p${index+1}-normal`, '#'+gameConfig.playerColor[index]);
		document.querySelector(select).style.setProperty(`--p${index+1}-hover`, rgb2hex(darken(hex2rgb('#'+gameConfig.playerColor[index]), 35)));
		i++;
	}
}


// Low cost CSS, called often
function loadInstantCSS(){
	// Ball position
	ballItem.style.top = ball.yPos + 'px';
	ballItem.style.left = ball.xPos + 'px';

	// Player position
	playerX.forEach(x => x.item.style.top = x.yPos + 'px')
}


// Ugly function, but make it otherwise would be tricky and long
// Could be optimised, but not needed since it's not called often
function displayLoader(){
	initGlobals();
	playerX = playerFactory(numberPlayers, defaultCtrl)
	loadInstantCSS();
	loadOnceCSS();

	initGlobals();
	playerX = playerFactory(numberPlayers, defaultCtrl)
	loadInstantCSS();
}



//
//* Init of global variables
//



// Key pressed array, for key remapping
let keyPressed = [];

// Values for quick access to items values (width, position...)
let ball = {};
let arena = {};
let player = {};


// Initate values into objects above
function initGlobals(){
	//! Small fix
	// Round to ballSpeed the width of arena
	// For better accuracy of ball
	// parseInt(9999px) => 9999 (cringe)
	arenaItem.style.width = parseInt(arenaItem.style.width) - (parseInt(arenaItem.style.width) % gameConfig.ballSpeed) + 'px'

	// Default params for the arena
	arena = {
		top : arenaItem.offsetTop + gameConfig.arenaBorder,
		bottom : arenaItem.offsetHeight - gameConfig.arenaBorder,
		left : arenaItem.offsetLeft + gameConfig.arenaBorder,
		right : arenaItem.offsetWidth - gameConfig.arenaBorder,
	};

	// Default params for the ball
	ball = {
		xDir : Math.round(Math.random()) ? gameConfig.ballSpeed : -gameConfig.ballSpeed, // X direction
		yDir : Math.round(Math.random()) ? gameConfig.ballSpeed : -gameConfig.ballSpeed, // Y direction
		xPos : Math.ceil((arena.right / 2 + arena.left) - (gameConfig.ballSize / 2 + gameConfig.arenaBorder)), // X position
		yPos : Math.ceil((arena.bottom / 2 + arena.top) - (gameConfig.ballSize / 2 + gameConfig.arenaBorder)), // Y position
	};

	// Default params for a player
	player = {
		width : document.querySelector('.player').offsetWidth + gameConfig.arenaBorder,
		height : document.querySelector('.player').offsetHeight,
		speed : gameConfig.playerSpeed,
	};
}



//
//* Cool design pattern
// https://en.wikipedia.org/wiki/Design_Patterns
//



class Player{
	constructor(id, up, down){
		this.item = document.querySelector(`.player.p${id}`);
		this.itemScore = document.querySelector(`.score.p${id}`);
		this.score = 0;
		this.yPos = ((arena.bottom / 2 + arena.top) - (gameConfig.playerSize / 2 - gameConfig.arenaBorder));
		this.ctrlUp = up;
		this.ctrlDown = down;
	}
}


// Returns a list of Player objects, from number of players and array of defined controls
function playerFactory(x, arr){
	let tmpList = [];
	for (let i = 1 ; i < (2*x)+1 ; i+=2){
		tmpList.push(new Player(Math.ceil(i/2), arr[i-1], arr[i]))
	}
	return tmpList;
}



//
//* Keyboard control
//



// Remap key press to avoid "writting behavior"
// https://stackoverflow.com/a/3691661/21143650
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


// Handles keypress to move a player
// Function handles one player at time to handle multiplayer
// But it's "multithreaded" because called with setInterval
function keyboardControlPlayer(x){
	keyPressed.forEach(key => {
		switch (key){
			case playerX[x].ctrlUp:
				movePlayer(x, -player.speed) ; break ;
			case playerX[x].ctrlDown:
				movePlayer(x,  player.speed) ; break ;
		}
	})
}



//
//* Movement functions (maths)
//



// Ball movements, refactoring should be avoided since hard to understand
function moveBall(){
	// Predict next ball position
	const newBallXPos = ball.xPos + ball.xDir;
	const newBallYPos = ball.yPos + ball.yDir;

	// Check for collision with first player
	let calc = arena.left + gameConfig.playerSpace + gameConfig.playerWidth;
	if (newBallXPos >= calc - gameConfig.ballSize/2 && newBallXPos <= calc) {
		if ((ball.yPos+gameConfig.ballSize >= playerX[0].yPos) && (ball.yPos <= playerX[0].yPos+player.height)){
			ball.xDir = Math.abs(ball.xDir);
		}
	}

	// Check for collision with second player
	calc = arena.right + arenaItem.offsetLeft - gameConfig.playerSpace - gameConfig.playerWidth - gameConfig.ballSize;
	if (newBallXPos >= calc && newBallXPos <= calc + gameConfig.ballSize/2) {
		if (ball.yPos+gameConfig.ballSize >= playerX[1].yPos && ball.yPos <= playerX[1].yPos+player.height){
			ball.xDir = -Math.abs(ball.xDir);
		}
	}

	// Check for collision with top and bottom of arena
	if (newBallYPos > arena.bottom + arena.top - gameConfig.ballSize - gameConfig.arenaBorder){ ball.yDir = -Math.abs(ball.yDir); }
	if (newBallYPos < arena.top){ ball.yDir = Math.abs(ball.yDir); }

	// Check for collision with right of arena
	if (newBallXPos > arena.right - gameConfig.ballSize + gameConfig.playerSpace + gameConfig.playerWidth){
		ball.xPos = arena.right - gameConfig.ballSize + gameConfig.playerSpace + gameConfig.playerWidth;
		ball.yPos += ball.yDir;
		loadInstantCSS();
		stopGame(0);
		return;
	}

	// Check for collision with left of arena
	if (newBallXPos < arena.left){
		ball.xPos = arena.left;
		ball.yPos += ball.yDir;
		loadInstantCSS();
		stopGame(1);
		return;
	}

	// Set current ball positio to new ball position
	ball.xPos += ball.xDir;
	ball.yPos += ball.yDir;

	// Reload display (low cost)
	loadInstantCSS();
}


// Move a player
function movePlayer(p, x){
	// Fetch position
	playerX[p].yPos += x

	// Check for collision
	const bottomBorder = arena.top + gameConfig.arenaSize - player.height;
	if (playerX[p].yPos < arena.top){ playerX[p].yPos = arena.top }
	if (playerX[p].yPos > bottomBorder){ playerX[p].yPos = bottomBorder }

	// Reload display (low cost)
	loadInstantCSS();
}


// If game is paused, then ball is not moving, but stuck instead
function ballStuck(x){
	if (!x){ // if player 1 has WON, stuck to p2
		ball.yPos = playerX[1].yPos - (gameConfig.ballSize / 2) + (gameConfig.playerSize / 2);
		ball.xPos = arena.right + arenaItem.offsetLeft - gameConfig.playerSpace - gameConfig.playerWidth - gameConfig.ballSize;
		ball.xDir = -Math.abs(ball.xDir);
	} else { // else player 2 has WON, stuck to p1
		ball.yPos = playerX[0].yPos - (gameConfig.ballSize / 2) + (gameConfig.playerSize / 2);
		ball.xPos = arena.left + gameConfig.playerSpace + gameConfig.playerWidth;
		ball.xDir = Math.abs(ball.xDir);
	} loadInstantCSS(); // Reload display (low cost)
	// Why here ? Because otherwise you could just maintain Space and insta win
	// Lazy fix, but efficient
	gameState = 0;
}



//
//* Stop/start the game
//



// Start the game
function start(){
	// Stop the ball to be stuck
	clearInterval(moveBallInterval);

	// We load display ONLY if first time
	if (parseInt(document.querySelector(`.score.p1>p`).textContent) + parseInt(document.querySelector(`.score.p2>p`).textContent) === 0){
		displayLoader();
	}

	// Hide everything and ball starts moving
	moveBallInterval = setInterval(moveBall, 20);
	document.getElementById('controls').style.display = 'none';
	document.getElementById('msg').style.display = 'none';
	document.getElementById('custom').style.display = 'none';
}



//
//* Buttons & listeners
//



// 
addEventListener("load", e => {
	// This whole purpose it to override tab presses to '  ' for yaml config :)
	// https://stackoverflow.com/a/6637396/21143650
	document.getElementById('custom-yaml').addEventListener('keydown', e => {
		if (e.key === 'Tab') {
			const item = e.target;
			e.preventDefault();
			const start = item.selectionStart;
			const end = item.selectionEnd;
			const value = item.value;
			item.value = value.substring(0, start) + '  ' + value.substring(end);
			item.selectionStart = item.selectionEnd = start + 2;
		}
	});

	// Add listeners to buttons for player controls
	document.querySelectorAll('.ctrl').forEach( (x, index) => {
		x.childNodes[1].addEventListener('click', y => updateCtrl(index, 'up', y.target))
		x.childNodes[3].addEventListener('click', y => updateCtrl(index, 'down', y.target))
	})
})


// Listen for keypresses, then update the controls
// index : 0 for p1, 1 for p2
// key : 'up' or 'down'
// item : button item from the DOM
function updateCtrl(index, key, item){
	// Starts listening
	item.disabled = true;
	item.textContent = 'Listening...'

	// Add an evenlistener, that will remove itself after the first keypress
	window.addEventListener('keypress', function tmp(e){
		item.disabled = false;
		key === 'up' ? playerX[index].ctrlUp = e.code : playerX[index].ctrlDown = e.code;
		item.textContent = `Player${index+1} ${key==='up' ? '🡅' : '🡇'} : ${e.key}`;
		defaultCtrl[ index*2 + (key==='up' ? 0 : 1) ] = e.code;
		window.removeEventListener('keypress', tmp);
	})
}


// Custom parser for YAML
//! DOES NOT HANDLE ANY ERROR, BE CAREFUL
function parseYaml() {
	// Get values from textarea
	const yamlString = document.getElementById('custom-yaml').value
	const lines = yamlString.split('\n');

	// We init with an array because otherwise can't push
	let parsedYaml = {playerColor: []};
	let mode = 'none'

	// Loop through each lines
	for (let line of lines) { 
		line = line.trim() // Remove spaces

		if (line === ''){ continue ; } // Empty => pass
		if (line.substring(0,2) === '- '){ parsedYaml['playerColor'].push(line.substring(2)) ; continue ; } // Color => push array

		// Split line to key/value pair
		let [key, value] = line.split(':').map(s => s.trim());

		// If no value, then key is mode
		if (value === '') { mode = key}

		// Match human value to code value
		else {
			if (mode === 'ball'){
				if (key === 'speed'){ parsedYaml['ballSpeed'] = parseInt(value) }
				else if (key === 'size'){ parsedYaml['ballSize'] = parseInt(value) }
				else if (key === 'color'){ parsedYaml['ballColor'] = value }
				else if (key === 'isBall'){ parsedYaml['isBall'] = Math.floor(parseInt(value)/2) }
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



//
//* Changing color
//

// #ffffff to [255, 255, 255]
function hex2rgb(hex){
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16)
	];
}

// [255, 255, 255] to #ffffff
function rgb2hex(rgb){
	// Insanity, welcome to the magnificent world of bitwise operations
	return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

// Darken a color
function darken(rgb, amount){
	return [
		Math.round(Math.max(rgb[0] * (1 - amount / 100), 0)),
		Math.round(Math.max(rgb[1] * (1 - amount / 100), 0)),
		Math.round(Math.max(rgb[2] * (1 - amount / 100), 0)),
	];
}