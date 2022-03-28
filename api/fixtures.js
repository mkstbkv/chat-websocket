const mongoose = require('mongoose');
const config = require("./config");
const User = require("./models/User");
const Message = require("./models/Message");
const {nanoid} = require("nanoid");

const run = async () => {
    await mongoose.connect(config.mongo.db, config.mongo.options);

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const coll of collections) {
        await mongoose.connection.db.dropCollection(coll.name);
    }

    const [tugol, admin] = await User.create({
        email: 'tugol@chat.com',
        password: '321',
        displayName: 'TUGOL',
        token: nanoid(),
    }, {
        email: 'admin@chat.com',
        password: '123',
        displayName: 'Admin',
        token: nanoid(),
    });

    await Message.create({
        user: tugol,
        text: 'Hello people!'
    }, {
        user: admin,
        text: 'Hi!'
    }, {
        user: tugol,
        text: 'How is it going?'
    });


    await mongoose.connection.close();
};

run().catch(e => console.error(e));