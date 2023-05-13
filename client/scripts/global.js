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
// Not exact, but at least fixed int
arenaItem.style.width = arenaItem.offsetWidth - (gameConfig.arenaBorder*2) + 'px'



//
//* Scripts above are run FIRST and ONCE on load
//* Scripts below are called functions WHEN START GAME
//
//
//* Update CSS on the page (for easier access with server)
//



function loadOnceCSS(){
	ballItem.style.width = gameConfig.ballSize + 'px';
	ballItem.style.backgroundColor = '#' + gameConfig.ballColor;
	ballItem.style.borderRadius = gameConfig.isBall ? '100%' : '0%';

	arenaItem.style.height = gameConfig.arenaSize + 'px';
	arenaItem.style.borderWidth = gameConfig.arenaBorder + 'px';
	arenaItem.style.borderColor = '#' + gameConfig.arenaBorderColor;
	arenaItem.style.backgroundColor = '#' + gameConfig.arenaBackgroundColor;

	document.querySelectorAll('.score').forEach( (x, i) => {
		x.style.backgroundColor = '#' + gameConfig.playerColor[i];
	})

	document.querySelectorAll('.player').forEach( (x, i) => {
		x.style.backgroundColor = '#' + gameConfig.playerColor[i];
		x.style.height = gameConfig.playerSize + 'px';
		x.style.width = gameConfig.playerWidth + 'px'
		
		// Leftover from previous multiplayer idea, can be reformated (not deleted), but don't really matter
		switch (i){
			case 0:
				x.style.left = arenaItem.offsetLeft + gameConfig.arenaBorder + gameConfig.playerSpace + 'px' ; break ;
			case 1:
				x.style.left = arenaItem.offsetLeft + arenaItem.offsetWidth - gameConfig.playerWidth - gameConfig.arenaBorder - gameConfig.playerSpace + 'px' ; break ;
		}
	})

	// https://stackoverflow.com/a/60357706/21143650
	let i = 0;
	const mapping = {
		'.p1.up' : ['--p1-normal', '--p1-hover', '--p1-disable'],
		'.p1.down' : ['--p1-normal', '--p1-hover', '--p1-disable'],
		'.p2.up' : ['--p2-normal', '--p2-hover', '--p2-disable'],
		'.p2.down' : ['--p2-normal', '--p2-hover', '--p2-disable']};
	for (const key in mapping){
		const index = Math.floor(i/2)
		document.querySelector(key).style.setProperty(mapping[key][0], '#'+gameConfig.playerColor[index]);
		document.querySelector(key).style.setProperty(mapping[key][1], '#'+gameConfig.playerColor[index]);
		document.querySelector(key).style.setProperty(mapping[key][2], '#'+gameConfig.playerColor[index]);
		i++;
	}
}


function loadInstantCSS(){
	// Ball position
	ballItem.style.top = ball.yPos + 'px';
	ballItem.style.left = ball.xPos + 'px';

	// Player position
	playerX.forEach(x => x.item.style.top = x.yPos + 'px')
}


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
let ball = {};
let arena = {};
let player = {};


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
//* Cool design pattern (read the fcking book)
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



function moveBall(){
	const newBallXPos = ball.xPos + ball.xDir;
	const newBallYPos = ball.yPos + ball.yDir;

	let calc = arena.left + gameConfig.playerSpace + gameConfig.playerWidth;
	if (newBallXPos >= calc - gameConfig.ballSize/2 && newBallXPos <= calc) {
		if ((ball.yPos+gameConfig.ballSize >= playerX[0].yPos) && (ball.yPos <= playerX[0].yPos+player.height)){
			ball.xDir = Math.abs(ball.xDir);
		}
	}

	calc = arena.right + arenaItem.offsetLeft - gameConfig.playerSpace - gameConfig.playerWidth - gameConfig.ballSize;
	if (newBallXPos >= calc && newBallXPos <= calc + gameConfig.ballSize/2) {
		if (ball.yPos+gameConfig.ballSize >= playerX[1].yPos && ball.yPos <= playerX[1].yPos+player.height){
			ball.xDir = -Math.abs(ball.xDir);
		}
	}

	if (newBallYPos > arena.bottom + arena.top - gameConfig.ballSize - gameConfig.arenaBorder){ ball.yDir = -Math.abs(ball.yDir); }
	if (newBallYPos < arena.top){ ball.yDir = Math.abs(ball.yDir); }
	if (newBallXPos > arena.right - gameConfig.ballSize + gameConfig.playerSpace + gameConfig.playerWidth){
		ball.xPos = arena.right - gameConfig.ballSize + gameConfig.playerSpace + gameConfig.playerWidth;
		ball.yPos += ball.yDir;
		loadInstantCSS();
		stopGame(0);
		return;
	}
	if (newBallXPos < arena.left){
		ball.xPos = arena.left;
		ball.yPos += ball.yDir;
		loadInstantCSS();
		stopGame(1);
		return;
	}

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



function start(){
	displayLoader();

	moveBallInterval = setInterval(moveBall, 20);
	document.getElementById('controls').style.display = 'none';
	document.getElementById('msg').style.display = 'none';
	document.getElementById('custom').style.display = 'none';
}



//
//* Buttons & listeners
//


addEventListener("load", e => {
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


	document.querySelectorAll('.ctrl').forEach( (x, index) => {
		x.childNodes[1].addEventListener('click', y => updateCtrl(index, 'up', y.target))
		x.childNodes[3].addEventListener('click', y => updateCtrl(index, 'down', y.target))
	})
})


function updateCtrl(index, key, item){
	item.textContent = 'Listening...'
	window.addEventListener('keypress', function tmp(e){
		key === 'up' ? playerX[index].ctrlUp = e.code : playerX[index].ctrlDown = e.code;
		item.textContent = `Player${index+1} ${key==='up' ? '🡅' : '🡇'} : ${e.key}`;
		defaultCtrl[ index*2 + (key==='up' ? 0 : 1) ] = e.code;
		window.removeEventListener('keypress', tmp);
	})
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