const express = require('express');
const Messages = require('../models/Message');

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const messages = await Messages.find().limit(30);
        return res.send(messages);
    } catch(e) {
        next(e);
    }
});

module.exports = router;