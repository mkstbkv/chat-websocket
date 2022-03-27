const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const chat = require('./app/chat');
const users = require('./app/users');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());
app.use(express.json());
app.ws('/chat', chat);
app.use('/users', users);

const run = async () => {
    await mongoose.connect(config.mongo.db, config.mongo.options);

    app.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });

    process.on('exit', () => {
        mongoose.disconnect();
    });
};

run().catch(e => console.error(e));
