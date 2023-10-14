const express = require('express');
const app = express();
const router = require('./route/router');
const users = require('./models/users');
const messages = require('./models/messages');
const ArchivedChats = require('./models/ArchivedChats')
const groups = require('./models/groups');
const groupMembers = require('./models/groupMembers')
const sequelize = require('./util/database');
const cors = require('cors');
const server = require('http').createServer(app)
const io = require('socket.io')(server);
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');


io.on('connection', socket => {
    console.log(socket.id);
    socket.on('sendMessage',message =>{
        io.emit('receiveMessage',message)
    });
    socket.on('addUser',message =>{
        io.emit('userAdded',message)    
    })
})

app.use(cors({
    origin:[ "http://localhost:3000/"]
}))

app.use(router)
app.use(express.static('public'));

users.hasMany(messages);
messages.belongsTo(users);


groups.hasMany(messages);
messages.belongsTo(groups)


users.hasMany(ArchivedChats);
ArchivedChats.belongsTo(users);


groups.hasMany(ArchivedChats);
ArchivedChats.belongsTo(groups)


users.belongsToMany(groups,{
    through: groupMembers,
  foreignKey: "userId",
});
groups.belongsToMany(users,{
    through: groupMembers,
  foreignKey: "groupId",
});

app.use(helmet());
const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'), {flags :'a'})

app.use(morgan('combined', {stream:accessLogStream}));



sequelize.sync()
.then(result => {server.listen(3000)})
.catch(err=> {console.log(err)})