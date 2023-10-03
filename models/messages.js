const Sequelize = require("sequelize");
const sequelize = require('../util/database');

const messages = sequelize.define('messages',{
    message:{
        type:Sequelize.STRING,
        allowNull:true
    },
    userName:{
        type:Sequelize.STRING,
        allowNull:false
    }
})

module.exports = messages;