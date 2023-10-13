const Sequelize = require("sequelize");
const sequelize = require('../util/database');

const messages = sequelize.define('messages',{
    message:{
        type:Sequelize.STRING,
        allowNull:true
    }
})

module.exports = messages;