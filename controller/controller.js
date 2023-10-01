const express = require('express');
const users = require('../models/users');
const bcrypt = require('bcryptjs');
const { use } = require('../route/router');

exports.loginPage = (req,res)=>{
    res.sendFile(process.cwd() + '/public/html/signupPage.html')
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
