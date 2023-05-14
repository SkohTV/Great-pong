const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Static files folder (pages, scripts, css)
app.use(express.static(path.join(__dirname, 'client')));



// Routing for root
app.get('/', (req, res) => {
	res.status(200).sendFile(path.join(__dirname, 'client/pages/index.html'));
});


// Routing for local (no server allocated)
app.get('/local', (req, res) => {
	res.status(200).sendFile(path.join(__dirname, 'client/pages/local.html'));
});


// Routing for versus
app.get('/versus', (req, res) => {
	const dynamicID = req.query.id;
	if (!dynamicID){
		const randomString = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
		playersLogged[randomString] = 0
		res.status(302).redirect(`/versus?id=${randomString}`)
	} else {
		res.status(200).sendFile(path.join(__dirname, `client/pages/versus.html`));
	}
});


// Routing for 404
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, `client/pages/404.html`))
});



// Start the server
http.listen(PORT, () => {
	console.log('Server is running on port 3000');
});


// All logged players with their ids
let playersLogged = {}


// All io goes here
io.on('connection', (socket) => {

	// Handle connection events (set player = X)
	socket.on('newPlayer-versus-ask', data => {
		playersLogged[data] += 1
		io.emit('newPlayer-versus-rep', playersLogged[data]);
	});

	// Sends back messages from admin client to players client
	socket.on('message-game-admin', res => {
		io.emit(`message-rep-player-${res.id}`, res.data);
	})

	socket.on(`message-game-player`, res => {
		io.emit(`message-rep-admin-${res.id}`, res.data);
	})

	socket.on(`update-game-admin`, res => {
		io.emit(`update-rep-player-${res.id}`, res.pack);
	})

	socket.on(`askupdateCSS-ask-player`, res => {
		io.emit(`askupdateCSS-rep-admin-${res.id}`);
	});

	socket.on(`gameStarted-ask`, res => {
		io.emit(`gameStarted-rep-${res.id}`);
	});

	socket.on(`stopGame-ask`, res => {
		io.emit(`stopGame-rep-${res.id}`, res.player);
	});

	socket.on(`ballStuckNotAdmin-ask`, res => {
		io.emit(`ballStuckNotAdmin-rep-${res.id}`);
	});

	socket.on(`plsStartGame-ask`, res => {
		io.emit(`plsStartGame-rep-${res.id}`);
	});

});

