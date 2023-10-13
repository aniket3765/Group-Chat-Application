const users = require('../models/users');
const messages = require('../models/messages');
const groups = require('../models/groups');
const groupMembers = require('../models/groupMembers')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKey;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
const AWS = require('aws-sdk');
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
  var r = await users.findAll({ where: { Email: req.body.email } })
  if (r[0] == undefined) {
    const salt = await bcrypt.genSalt(10);
    users.create({
      Name: req.body.name,
      Email: req.body.email,
      Mobile: req.body.phoneNumber,
      password: await bcrypt.hash(req.body.password, salt)
    }).then(result => {
      addToGroup(0, result.dataValues.id)
      res.status(201).json({ validate: false });
    }).catch(error => { res.status(404).json(error) })

  }
  else {
    res.status(400).json({ message: 'User already exist' })
  }
}

jwtToken = (token) => {
  return jwt.verify(token, secretKey);
}

exports.addMessage = (req, res) => {
  const token = jwtToken(req.body.token);
  console.log(req.body);
  console.log(token);
  messages.create({
    message: req.body.message,
    groupId: req.body.groupId,
    userId: token.userId
  }).then(result => { res.status(201).json({ message: 'success' }) }).catch(result => { res.send(result) })
}

exports.allMessages = (req, res) => {
  // const allMessages =  messages.findAll(
  //   {
  //     where: {
  //       id: { [Sequelize.Op.gt]: req.body.id },
  //       groupId: req.body.groupId
  //     }
  //   });


  res.status(200).json(allMessages);
}

exports.allUsers = async (req, res) => {
  const token = jwtToken(req.body.token);
  await findUserInGroup(req.body.groupId).then(r => {
    if(r.dataValues.adminId == token.userId)
    {
      users.findAll().then(result => {
       res.status(200).json(result)
      })
      .catch(result => res.send(result))
  }
  else res.status(400).json({msg:'you are not admin'})
  })
 
}

exports.creatGroup = (req, res) => {
  const token = jwtToken(req.body.token);
  groups.create({
    groupName: req.body.groupName,
    adminId: token.userId
  }).then(result => {
    addToGroup(result.dataValues.id, token.userId)
  }).then(result => res.status(201).json({ msg: 'Group created' })).catch(result => res.status(400).json({ error: result }));
}

exports.allGroups = (req, res) => {
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
  const token = jwtToken(req.body.token);
  await findUserInGroup(req.body.groupId).then(result => {
    if (result.dataValues.adminId == token.userId) {
      addToGroup(req.body.groupId, req.body.userId);
      res.status(201).json({ msg: 'user added' })
    }
    else res.status(400).json({ msg: 'You are not admin' })
  });
}

exports.allGroupUsers = (req, res) => {
  const token = jwtToken(req.body.token);

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
  }).then(result => res.status(200).json(result));
}

exports.removeUser = async (req, res) => {
  const token = jwtToken(req.body.token);
  const admin = await findUserInGroup(req.body.groupId);
  if (admin.dataValues.adminId == token.userId && req.body.userId !== token.user) {
    groupMembers.destroy({
      where: {
        groupId: admin.id,
        userId: req.body.userId
      }
    }).then(result => res.json(result))
  }
  else res.status(400).json({ msg: 'you are not admin' })
}


exports.upload = (req, res) => {
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
      if (err) res.status(400).json("Something wrong!", err);
      else {
        console.log('Succesfully uploaded');

        res.status(201).json({ link: r.Location })
      }

    })

  }

}



