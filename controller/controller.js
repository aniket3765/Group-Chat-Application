const express = require('express');
const users = require('../models/users');
const bcrypt = require('bcryptjs');

exports.loginPage = (req,res)=>{
    res.sendFile(process.cwd() + '/public/html/signupPage.html')
}
//create new user 
exports.signup = async (req, res) => {
console.log(req)
res.status(200)
    var r = await users.findAll({ where: { Email: req.body.email } })
    if (r[0] == undefined) {
      const salt = await bcrypt.genSalt(10);
      users.create({
        Email: req.body.email,
        Mobile: req.body.mobile,
        total: 0,
        password: await bcrypt.hash(req.body.password, salt)
      }).then(result => { }).catch(error => { console.log(error) })
      res.json({ validate: false })
    }
}
