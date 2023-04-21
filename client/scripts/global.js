// Key pressed array, for key remapping
var keyPressed = [];


// Player object
class Player{
	constructor(id){
		this.item = document.getElementById(`j${id}`);
		this.yPos = 210;
	}
}
// And its generator
var playerX = [
	new Player(1),
	new Player(2),
];


// Default params for the ball
var ball = {
	xDir : 5, // X direction
	yDir : 5, // Y direction
	xPos : 70, // X position
	yPos : 240, // Y position
	width : 40, // Width
	height : 40, // Height
	item : document.getElementById('ball') // Item from DOM
};

// Default params for the arena
var arena = {
	border : 5,
	top : document.getElementById('cadre').offsetTop + 5,
	bottom : document.getElementById('cadre').offsetHeight + 5,
	left : document.getElementById('cadre').offsetLeft + 5,
	right : document.getElementById('cadre').offsetWidth + 5,
};

// Default params for a player
var player = {
	width : document.getElementById('j1').offsetWidth + arena.border,
	height : 100,
	speed : 7,
};



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
	window.onblur = e => {
		keyPressed = [];
	}
}


function moveBall(){
	const newBallXPos = ball.xPos + ball.xDir;
	const newBallYPos = ball.yPos + ball.yDir;

	if (newBallXPos < arena.left + player.width) {
		if ((ball.yPos+ball.height > playerX[0].yPos) && (ball.yPos < playerX[0].yPos+player.height)){
			ball.xDir = Math.abs(ball.xDir);
		}
	}

	if (newBallXPos > arena.right - player.width) {
		if (ball.yPos+ball.height > playerX[1].yPos && ball.yPos < playerX[1].yPos+player.height){
			ball.xDir = -Math.abs(ball.xDir);
		}
	}

	if (newBallYPos > arena.bottom){ ball.yDir = -Math.abs(ball.yDir); }
	if (newBallYPos < arena.top){ ball.yDir = Math.abs(ball.yDir); }
	if (newBallXPos > arena.right){ console.log('P1 win') ; return }
	if (newBallXPos < arena.left){ console.log('P2 win') ; return }

	ball.xPos += ball.xDir;
	ball.yPos += ball.yDir;

	ball.item.style.top = ball.yPos + 'px';
	ball.item.style.left = ball.xPos + 'px';
}


function keyboardControl(){
	keyPressed.forEach(key => {
		switch (key){
			case 'KeyR':
				movePlayer(0, -player.speed) ; break ;
			case 'KeyF':
				movePlayer(0, player.speed) ; break ;
			case 'KeyO':
				movePlayer(1, -player.speed) ; break ;
			case 'KeyL':
				movePlayer(1, player.speed) ; break ;
		}
	})
}


function movePlayer(p, x){
	playerX[p].yPos += x
	const bottomBorder = arena.bottom - player.height/2 - arena.border*2
	if (playerX[p].yPos < arena.top){ playerX[p].yPos = arena.top}
	if (playerX[p].yPos > bottomBorder){ playerX[p].yPos = bottomBorder }
	playerX[p].item.style.top = playerX[p].yPos + 'px';
}


//function fdfqf() {
//	ball.style.top = ballYPos + 'px';
//	ball.style.left = ballXPos + 'px';
//	player1.style.top = player1YPos + 'px'
//	player2.style.top = player2YPos + 'px'

	



	//while(true){
		
	//} // https://stackoverflow.com/questions/3691461/remove-key-press-delay-in-javascript

	//document.addEventListener('keydown', e => {
	//    switch (e.code){
	//        case 'Space':
	//            if (partieId===undefined){
	//                document.getElementById("infos").style.display = "none";
	//                start();
	//                break;
	//            }
	//        case 'KeyI':
	//            movePlayer(1, -10);
	//            break;
	//        case 'KeyK':
	//            movePlayer(1, 10);
	//            break;
	//        case 'KeyO':
	//            movePlayer(2, -10);
	//            break;
	//        case 'KeyL':
	//            movePlayer(2, 10);
	//            break;
	//        default:
	//            console.log(e.code);
	//            break;
	//    }
	//});

