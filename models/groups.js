const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const groups = sequelize.define('groups',{
    
    groupName:{
        type:Sequelize.STRING,
        allowNull:false
    },
    adminId:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
})  

module.exports = groups;