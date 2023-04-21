const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

// Set up a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/pages/index.html'));
  res.send("Yo");
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
