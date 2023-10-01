const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./route/router');

app.use(router)
app.use(express.static('public'));

app.listen(3000)