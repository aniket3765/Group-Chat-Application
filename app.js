const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./route/router');
const users = require('./models/users');
const messages = require('./models/messages');
const groupMembers = require('./models/groupMembers');
const sequelize = require('./util/database');
const cors = require('cors');
const server = require('http').createServer(app)
const io = require('socket.io')(server);


io.on('connection', socket => {
    console.log(socket.id);
    socket.on('sendMessage',message =>{
        io.emit('receiveMessage',message)
    })
})

app.use(cors({
    origin:[ "http://localhost:3000/"]
}))

app.use(router)
app.use(express.static('public'));

users.hasMany(messages);
messages.belongsTo(users);

users.hasMany(groupMembers);
groupMembers.belongsTo(users);




sequelize.sync()
.then(result => {server.listen(3000)})
.catch(err=> {console.log(err)})