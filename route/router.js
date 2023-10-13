const express = require('express');
const controller = require('../controller/controller');
const router = express();
const fileUpload = require('express-fileupload');
router.use(fileUpload({
    limits: {
        fileSize: 10000000,
    },
    abortOnLimit: true,
}))

router.use(express.json());
router.get('/',controller.loginPage);
router.get('/signup',controller.signupPage);
router.post('/creatUser',controller.signup);
router.post('/login',controller.login);
router.get('/home',controller.chatPage);
router.post('/addMessage',controller.addMessage);
router.post('/allMessages',controller.allMessages);
router.post('/allUsers',controller.allUsers);
router.post('/createGroup',controller.creatGroup);
router.post('/allGroups',controller.allGroups);
router.post('/addUserToGroup',controller.addUserToGroup);
router.post('/allGroupUsers',controller.allGroupUsers);
router.post('/removeUser',controller.removeUser);
router.post('/upload', controller.upload);



module.exports = router;
