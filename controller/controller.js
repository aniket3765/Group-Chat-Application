const express = require('express');
const users = require('../models/users');
const messages = require('../models/messages');
const bcrypt = require('bcryptjs');
const { use } = require('../route/router');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const secretKey = process.env.secretKey;
require('dotenv').config();

exports.signupPage = (req,res)=>{
    res.sendFile(process.cwd() + '/public/html/signupPage.html')
}

exports.loginPage = (req,res)=>{
    res.sendFile(process.cwd() + '/public/html/loginPage.html')
}

exports.chatPage = (req, res) =>{
  res.sendFile(process.cwd() + '/public/html/chatPage.html');
}

exports.login = async (req, res)=> {
    const findUser = await users.findOne({where:{name:req.body.name}});
    if(findUser == undefined){
      return  res.status(404).json({message:'userName'});
    }
    else{
        const user = findUser.dataValues;
        const isPasswordValid = await bcrypt.compare(req.body.password,user.password);
        if(isPasswordValid) 
        {
          console.log(user)
            const token = jwt.sign({userId:user.id,name:user.Name},secretKey);
            res.status(200).json({token:token});
         }
         else res.status(401).json({message:'password'});
    }
}


exports.signup = async (req, res) => {
console.log(req.body)
    var r = await users.findAll({ where: { Email: req.body.email } })
    if (r[0] == undefined) {
      const salt = await bcrypt.genSalt(10);
      users.create({
        Name:req.body.name,
        Email: req.body.email,
        Mobile: req.body.phoneNumber,
        password: await bcrypt.hash(req.body.password, salt)
      }).then(result => { res.status(200).json({ validate: false }) }).catch(error => { res.status(404).json(error) })
     
    }
    else{
        res.status(201).json({message:'User already exist'})
    }
}

jwtToken = (token) =>{
  return jwt.verify(token,secretKey);
}

exports.addMessage = (req, res) => {
  const token = jwtToken(req.body.token);
console.log(token)
  messages.create({
    message:req.body.message,
    userName:token.name,
    userId:token.userId
  }).then(result => { res.status(200).json({message:'success'}) }).catch(res => {res.status(201).json({error:res})})  
}

exports.allMessages = async (req, res)=> {
  console.log(req.body)
  const allMessages = await messages
  .findAll({where:{
    id:{[Sequelize.Op.gt]:req.body.id}
  }});
  res.status(200).json(allMessages);
}
