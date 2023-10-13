const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const groupMembers = sequelize.define('groupmembers',{})  

module.exports = groupMembers;