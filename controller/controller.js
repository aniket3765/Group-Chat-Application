const users = require('../models/users');
const messages = require('../models/messages');
const ArchivedChats = require('../models/ArchivedChats')
const groups = require('../models/groups');
const groupMembers = require('../models/groupMembers')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKey;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
const AWS = require('aws-sdk');
require('dotenv').config();
const Cron = require('node-cron');

Cron.schedule('0 0 0 * * *', function () {
  console.log('ghgh')
  // messages.findAll().then(res =>{

  // })
})

exports.signupPage = (req, res) => {
  try {
    res.sendFile(process.cwd() + '/public/html/signupPage.html')
  }
  catch (err) { res.status(400).send() }
}

exports.loginPage = (req, res) => {
  try {
    res.sendFile(process.cwd() + '/public/html/loginPage.html')
  } catch (err) { res.status(400).send() }
}

exports.chatPage = (req, res) => {
  try {
    res.sendFile(process.cwd() + '/public/html/chatPage.html');
  } catch (err) { res.status(400).send() }
}

exports.login = async (req, res) => {
  try {
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
  } catch (err) { res.status(400).send() }
}


exports.signup = async (req, res) => {
  try {
    var r = await users.findAll({ where: { Email: req.body.email } })
    if (r[0] == undefined) {
      const salt = await bcrypt.genSalt(10);
      users.create({
        Name: req.body.name,
        Email: req.body.email,
        Mobile: req.body.phoneNumber,
        password: await bcrypt.hash(req.body.password, salt)
      }).then(result => {
        console.log(result.dataValues)
        addToGroup(1, result.dataValues.id)
        res.status(201).json({ validate: false });
      }).catch(error => { res.status(404).json(error) })

    }
    else {
      res.status(400).json({ message: 'User already exist' })
    }
  }
  catch (err) { res.status(400).send() }
}

jwtToken = (token) => {
  return jwt.verify(token, secretKey);
}

exports.addMessage = (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    console.log(req.body);
    console.log(token);
    messages.create({
      message: req.body.message,
      groupId: req.body.groupId,
      userId: token.userId
    }).then(result => { res.status(201).json({ message: 'success' }) }).catch(result => { res.send(result) })
  } catch (err) { res.status(400).send() }
}


exports.allUsers = async (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    await findUserInGroup(req.body.groupId).then(r => {
      if (r.dataValues.adminId == token.userId) {
        users.findAll().then(result => {
          res.status(200).json(result)
        })
          .catch(result => res.send(result))
      }
      else res.status(400).json({ msg: 'you are not admin' })
    })
  }
  catch (err) { res.status(400).send() }

}

exports.creatGroup = (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    groups.create({
      groupName: req.body.groupName,
      adminId: token.userId
    }).then(result => {
      addToGroup(result.dataValues.id, token.userId)
      res.status(201).json({ i: result.dataValues.id })
    }).catch(result => res.status(400).json({ error: JSON.stringify(result) }));
  }
  catch (err) { res.status(400).send() }
}

exports.allGroups = (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    users.findAll({
      where: {
        id: token.userId
      },
      include: [{
        model: groups,
        through: { attributes: ['userId'] }
      }]
    }).then(result => res.status(200).json(result)).catch(result => res.send(result));
  }
  catch (err) { res.status(400).send() }
}

findUserInGroup = (groupId) => {
  return groups.findOne({
    where: {
      id: groupId
    }
  })
}

addToGroup = (groupId, userId) => {
  return groupMembers.create({
    userId: userId,
    groupId: groupId
  })
}

exports.addUserToGroup = async (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    await findUserInGroup(req.body.groupId).then(result => {
      if (result.dataValues.adminId == token.userId) {
        addToGroup(req.body.groupId, req.body.userId);
        res.status(201).json({ msg: 'user added' })
      }
      else res.status(400).json({ msg: 'You are not admin' })
    });
  }
  catch (err) { res.status(400).send() }
}

exports.allGroupUsers = (req, res) => {
  try {

    groups.findAll({
      where: { id: req.body.groupId },
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      },
      include: [{
        model: users,
        through: { attributes: [] },
        attributes: ['id', 'Name']
      },
      {
        model: messages,
        attributes: ['id', 'message'],
        include: [{
          model: users,
          attributes: ['Name']
        }],
        order: [['createdAt', 'DESC']],
        separate: true,
        limit: 15
      }
      ]
    }).then(result => res.status(200).json(result))

  }
  catch (err) { res.status(400).send() }
}

exports.removeUser = async (req, res) => {
  try {
    const token = jwtToken(req.body.token);
    const admin = await findUserInGroup(req.body.groupId);

    if (admin.dataValues.adminId == token.userId && req.body.userId != token.userId) {
      groupMembers.destroy({
        where: {
          groupId: admin.id,
          userId: req.body.userId
        }
      }).then(result => res.json(result))
    }
    else res.status(400).json({ msg: 'you are not admin' })
  }
  catch (err) { res.status(400).send() }
}


exports.upload = (req, res) => {
  try {
    const link = uploadToS3(req.files.file.data, req.files.file.name)
    console.log(link)

    async function uploadToS3(data, filename) {

      let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,

      });

      var params = {
        Bucket: "aniketgroupchatapp",
        Key: filename,
        Body: data,
        ACL: 'public-read'
      }
      s3bucket.upload(params, (err, r) => {
        if (err) res.status(400).json({ msg: "Something wrong!" });
        else {
          res.status(201).json({ link: r.Location })
        }

      })

    }
  }
  catch (err) { res.status(400).send() }
}

exports.deleteGroup = async (req, res) => {
  try {
    const token = jwtToken(req.headers.token);
    isAdmin = await findUserInGroup(req.headers.groupid);
    if (isAdmin.dataValues.adminId == token.userId) {
      groups.destroy({
        where: {
          id: isAdmin.dataValues.id
        }
      });
      groupMembers.destroy({
        where: {
          groupId: isAdmin.dataValues.id
        }
      }).then(result => res.status(204).json()).catch()
    }
    else res.status(401).json({ msg: "you are not admin" })
  }
  catch (err) { res.status(400).send() }
}



