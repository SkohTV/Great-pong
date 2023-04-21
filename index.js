const express = require("express");
const app = express();
const test = require("./api/test");

app.use(express.json({extented: false}));
app.use("/api/test", test);

const PORT = 8080;

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));