const express = require('express');
const bodyParser = require('body-parser');
const controller = require('../controller/controller');
const router = express();

router.use(express.json());
router.get('/',controller.loginPage);
router.get('/signup',controller.signupPage);
router.post('/creatUser',controller.signup);
router.post('/login',controller.login)

module.exports = router;
