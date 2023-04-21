import express from 'express';

const router = express;

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

app.get('/main', (req,res) => {
	res.sendFile('/client/pages')
})