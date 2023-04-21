const express = require('express');
const router = express.Router();

router.get("/", async (req,res) => {
  try{
    res.json({
      "hello": "hello"
    });
  } catch (error) {
    console.log(error)
  }
});

module.expors = router;
