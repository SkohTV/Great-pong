const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/:page', (req, res) => {
	const page = req.params.page;
	switch (page){
		case '':
		case 'local':
		case 'versus':
		case 'arena':
			res.sendFile(path.join(__dirname, `client/pages/${page}`));
			break;
		default:
			res.sendFile(path.join(__dirname, 'client/pages/404.html'));
	}
});

// Start the server
app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
