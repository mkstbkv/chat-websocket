const rootPath = __dirname;

module.exports = {
  rootPath,
  mongo: {
    db: 'mongodb://localhost/chat-ws',
    options: {useNewUrlParser: true},
  }
};