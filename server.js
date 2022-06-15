/**
 * Ex5 Best2Watch
 * Aviv Eldad
 * This file is the server file. Include all the routes and initialization
 */

const express = require('express');
const { validationResult } = require('express-validator');
bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    cors = require('cors'),
    routers = require('./server/routes/routes.js'),
    mongoose = require('./server/db/mongoose');
const port = 3001

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/list', express.static(path.join(__dirname, 'client/html/list.html')));
app.use('/addForm', express.static(path.join(__dirname, 'client/html/form.html')));
app.use('/updateForm', express.static(path.join(__dirname, 'client/html/updateDetails.html')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/js', express.static(path.join(__dirname, 'client/js')));


app.use('/', routers);



app.listen(port, () => {
  console.log(`listening on port ${port}...`)
})