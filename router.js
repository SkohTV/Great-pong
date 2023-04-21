import express from 'express';




const app = express();


app.get('/', (req,res) => {
  console.log('Hello!');
  res.send('Hello, World!');
	res.sendFile('/client/pages/index.html');
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});