require('dotenv').config();
var express = require('express');
var logger = require('morgan');
var app = express();
var path = require('path');
var cors = require("cors");
var cookieParser = require('cookie-parser');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// set view engine ejs
app.set('view engine', 'ejs');

// define routes
const routes = require('./routes');
app.use('/api/v1', routes);

// 500 error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

// 404 error handler
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `are you lost? ${req.method} ${req.url} is not registered!`,
        data: null
    });
});

module.exports = app;
