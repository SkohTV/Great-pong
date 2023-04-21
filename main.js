import express from 'express';
import path from 'path';


const app = express();

app.get('/', (req,res) => {
	//res.sendFile(path.join('client', 'pages', 'index.html'))
	res.send('Hello');
	console.log('Here');
})

app.listen(3000, () => {
	console.log('Server started on port 3000');
});