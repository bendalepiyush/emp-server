const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const morgan = require('morgan');

/**  
 * MongoDB Connection
 */
let mongoose = require('./src/services/mongo-connection');
mongoose();


const app = express();


app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");

    if ('OPTIONS' === req.method){
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
        return res.status(204).json({});

    }
    else
        next();

});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



/**
 * Routers Web and App
 */
const adminWebRouter = require('./src/routes/web/admin');
const customerWebRouter = require('./src/routes/web/customer');
const supervisorAppRouter = require('./src/routes/app/supervisor');

app.use('/admin', adminWebRouter);
app.use('/customer', customerWebRouter);
app.use('/customer/supervisor', supervisorAppRouter);


module.exports = app;
