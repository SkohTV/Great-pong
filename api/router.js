import express from 'express';



const app = express();

app.get('/', (req,res) => {
	res.sendFile('/client/pages')
	console.log('Server started on port 3000');
})

export default app;