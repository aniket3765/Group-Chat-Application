const express = require('express');
const bodyParser = require('body-parser');
const controller = require('../controller/controller');
const router = express();

router.use(express.json());
router.get('/',controller.loginPage);
router.post('/signup',controller.signup);

module.exports = router;
