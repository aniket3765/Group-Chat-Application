const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./route/router');
const users = require('./models/users');
const sequelize = require('./util/database');
const cors = require('cors');

app.use(cors({
    origin: "http://127.0.0.1:5000/"
}))

app.use(router)
app.use(express.static('public'));

sequelize.sync().then(result => {app.listen(3000)}).catch(err=> {console.log(err)})