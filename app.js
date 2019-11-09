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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
    if(req.method === 'OPTIONS'){
        
        return res.status(200).json({});
    }

    next();
});


/**
 * Routers
 */
const adminRouter = require('./src/routes/react/admin');
const customerRouter = require('./src/routes/react/customer');
//const ionicRouter = require('./src/routes/ionic');

app.use('/admin', adminRouter);
app.use('/customer', customerRouter);
//app.use('/ionic/', ionicRouter);

module.exports = app;
