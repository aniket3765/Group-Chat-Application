const express = require('express');
const bodyParser = require('body-parser');
const controller = require('../controller/controller');
const router = express();

router.use(express.json());
router.get('/',controller.loginPage);
router.get('/signup',controller.signupPage);
router.post('/creatUser',controller.signup);
router.post('/login',controller.login);
router.get('/home',controller.chatPage);
router.post('/addMessage',controller.addMessage);
router.post('/allMessages',controller.allMessages);
router.get('/allUsers',controller.allUsers);
router.post('/createGroup',controller.creatGroup);
router.post('/allGroups',controller.allGroups);
router.post('/addUserToGroup',controller.addUserToGroup)

module.exports = router;
