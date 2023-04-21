import express from 'express';



const app = express();

app.get('/', (req,res) => {
	res.sendFile('/client/pages')
})

export default app;