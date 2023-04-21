const express = require('express');
const router = express.Router();

router.get("/", async (req,res) => {
  try{
    res.json({
      status: 200,
			message: "Get cool",
    });
  } catch (error) {
    console.log(error)
  }
});

module.expors = router;
