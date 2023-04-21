const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Set up a route for the root URL
app.get('/', (req, res) => {
  // Send the 'client/index.html' file
  res.sendFile(path.join(__dirname, 'client', 'pages', 'index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
