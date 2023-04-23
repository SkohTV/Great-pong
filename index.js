const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Static files folder (pages, scripts, css)
app.use(express.static(path.join(__dirname, 'client')));


// Routing for root
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/pages/index.html'));
});


// Redirect for not root
app.get('/:page', (req, res) => {
	const page = req.params.page; // Extract the requested mode (page)
	switch (page){
		case 'local': // local.html -> /local
		case 'versus': // versus.html -> /versus
		case 'arena': // arena.html -> /arena
			res.sendFile(path.join(__dirname, `client/pages/${page}.html`));
			break;
		default: // Else 404
			res.sendFile(path.join(__dirname, 'client/pages/404.html'));
	}
});


// Start the server
app.listen(PORT, () => {
	console.log('Server is running on port 3000');
});