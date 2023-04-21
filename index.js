const express = require('express');
const path = require('path');
const app = express();

// Where our static files are located
app.use(express.static(__dirname, 'client'));


// Main redirect (static)
app.get('/:page', (req, res) => {
	const page = req.params.page; // Extract the requested page
	switch (page){
		case '': // index.html -> root
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
app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
