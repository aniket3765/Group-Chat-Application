const express = require('express');
const users = require('../models/users');
const messages = require('../models/messages');
const group = require('../models/groupMembers');
const bcrypt = require('bcryptjs');
const { use } = require('../route/router');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const secretKey = process.env.secretKey;
require('dotenv').config();

exports.signupPage = (req, res) => {
  res.sendFile(process.cwd() + '/public/html/signupPage.html')
}

exports.loginPage = (req, res) => {
  res.sendFile(process.cwd() + '/public/html/loginPage.html')
}

exports.chatPage = (req, res) => {
  res.sendFile(process.cwd() + '/public/html/chatPage.html');
}

exports.login = async (req, res) => {
  const findUser = await users.findOne({ where: { name: req.body.name } });
  if (findUser == undefined) {
    return res.status(404).json({ message: 'userName' });
  }
  else {
    const user = findUser.dataValues;
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordValid) {
      console.log(user)
      const token = jwt.sign({ userId: user.id, name: user.Name }, secretKey);
      res.status(200).json({ token: token });
    }
    else res.status(401).json({ message: 'password' });
  }
}


exports.signup = async (req, res) => {
  console.log(req.body)
  var r = await users.findAll({ where: { Email: req.body.email } })
  if (r[0] == undefined) {
    const salt = await bcrypt.genSalt(10);
    users.create({
      Name: req.body.name,
      Email: req.body.email,
      Mobile: req.body.phoneNumber,
      password: await bcrypt.hash(req.body.password, salt)
    }).then(result => { res.status(200).json({ validate: false }) }).catch(error => { res.status(404).json(error) })

  }
  else {
    res.status(201).json({ message: 'User already exist' })
  }
}

jwtToken = (token) => {
  return jwt.verify(token, secretKey);
}

exports.addMessage = (req, res) => {
  const token = jwtToken(req.body.token);
  messages.create({
    message: req.body.message,
    userName: token.name,
    groupName: req.body.groupName,
    userId: token.userId
  }).then(result => { res.status(200).json({ message: 'success' }) }).catch(result => { res.status(201).json({ error: res }) })
}

exports.allMessages = async (req, res) => {
  const allMessages = await messages
    .findAll({
      where: {
        id: { [Sequelize.Op.gt]: req.body.id },
        groupName: req.body.groupName
      }
    });
  res.status(200).json(allMessages);
}

exports.allUsers = (req, res) => {
  users.findAll().then(result => res.status(200).json(result)).catch(result => res.status(201).json(result));

}

exports.creatGroup = (req, res) => {
  const token = jwtToken(req.body.token);
  group.create({
    userName: token.name,
    groupName: req.body.groupName,
    isAdmin: true,
    userId: token.userId
  }).then(result => res.status(200).json({ msg: 'Group created' })).catch(result => res.status(201).json({ error: result }));
}

exports.allGroups = (req, res) => {
  console.log(req.body)
  const token = jwtToken(req.body.token);
  group.findAll({
    where: {
      userName: token.name
    }
  }).then(result => res.status(200).json(result)).catch(result => res.status(201).json(result));
}

findUserInGroup = (userName, groupName) => {
  return group.findOne({
    where: {
      userName: userName,
      groupName: groupName
    }
  })
}

exports.addUserToGroup = async (req, res) => {
  const token = jwtToken(req.body.token);
  await findUserInGroup(token.name, req.body.groupName).then(result => {
    if (result.dataValues.isAdmin) {
      findUserInGroup(req.body.userName, req.body.groupName)
        .then(result => {
          if (result == null) {
            group.create({
              userName: req.body.userName,
              groupName: req.body.groupName,
              isAdmin: false,
            }).then(responce => res.status(200).json(responce))
          }
          else res.status(201).json({ msg: "User already added" });
        });
    }
    else res.status(201).json({ msg: "You are not admin" });
  });
}

exports.allGroupUsers = (req, res) => {
 const token = jwtToken(req.body.token);
 group.findAll({
  where:{
    groupName:req.body.groupName
  },
  attributes:['userName']
 }).then(result => res.json(result))
}

exports.removeUser = async (req, res)=> {
const token = jwtToken(req.body.token);
const admin = await findUserInGroup(token.name, req.body.groupName);
if(admin.dataValues.isAdmin){
  group.destroy({
    where:{
      groupName:req.body.groupName,
      userName:req.body.userName
    }
  }).then(result => res.status(200).json({msg:'deleted'}))}
  else res.json({msg:'you are not admin'})
}