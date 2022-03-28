const { nanoid } = require('nanoid');
const User = require('../models/User');
const Messages = require("../models/Message");
const Message = require("../models/Message");

const activeConnections = {};

module.exports = (ws, req) => {
    const id = nanoid();
    console.log('client connected! id=', id);
    activeConnections[id] = ws;

    ws.on('close', (msg) => {
        console.log('client disconnected! id=', id);
        delete activeConnections[id];
    });

    let user = null;
    let users = [];
    ws.on('message', async (msg) => {
        const decodedMessage = JSON.parse(msg);
        switch (decodedMessage.type) {
            case 'LOGIN':
                user = await User.findOne({token: decodedMessage.token});
                users.push(user);
                const messages = await Messages.find().populate('user', 'displayName').limit(30);
                Object.keys(activeConnections).forEach(connId => {
                    const conn = activeConnections[connId];

                    conn.send(JSON.stringify({
                        type: 'PREV_MESSAGES',
                        messages: {
                            messages: messages,
                            users: users
                        }
                    }));
                });

                break;
            case 'USER_LOGOUT':
                user = await User.findOne({token: decodedMessage.token});
                users.splice(users.indexOf(user), 1);
                Object.keys(activeConnections).forEach(connId => {
                    const conn = activeConnections[connId];
                    conn.send(JSON.stringify({
                        type: 'LOGOUT',
                        messages: {
                            users
                        }
                    }));
                });
                user = null;

                break;
            case 'SEND_MESSAGE':
                if (user === null) break;

                await Message.create({
                    user: decodedMessage.user,
                    text: decodedMessage.text
                });
                const mes = await Messages.find().populate('user', 'displayName').limit(30);
                Object.keys(activeConnections).forEach( connId => {
                    const conn = activeConnections[connId];
                    conn.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        messages: {
                            messages: mes
                        }
                    }));
                });
                break;
            default:
                console.log('Unknown message type:', decodedMessage.type);
        }
    });
};

