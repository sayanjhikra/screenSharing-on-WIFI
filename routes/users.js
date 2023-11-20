const express = require("express");
const router = express.Router();

router.get("/host", (req, res) => {
//   res.render("host", { roomId: req.params.room });
res.send('host')
});
router.get("/viewer", (req, res) => {
//   res.render("viewer", { roomId: req.params.room });
res.send('viewer')
});