const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const groupMembers = sequelize.define('groupMembers',{
    userName :{
        type:Sequelize.STRING,
        allowNull:false
    },
    groupName:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isAdmin:{
        type:Sequelize.BOOLEAN,
        allowNull:true
    }

});

module.exports = groupMembers