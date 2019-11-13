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


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*") 
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization" 
    );
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, OPTIONS');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        res.status(200).json({});
    } else {
        next();
    }
})


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
