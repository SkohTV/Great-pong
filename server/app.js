const express = require('express');
const app = express();
const path = require('path');

// Set static folder for front-end code
app.use(express.static(path.join(__dirname, '../client')));

// Require routes
const indexRouter = require('./router.js');

// Use routes
app.use('/', indexRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});