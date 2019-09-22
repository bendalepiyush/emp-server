const mongoose = require('mongoose');
const MONGO_URI = require('../../config/database');

// Require database URL from properties file
var dbURL = MONGO_URI;

// 
mongoose.set('useCreateIndex', true);


module.exports = () => {

    mongoose.connect(dbURL, { useNewUrlParser: true });

    mongoose.connection.on('connected', () => {
        console.log("Mongoose default connection is open to ", dbURL);
    });

    mongoose.connection.on('error', (err) => {
        console.log("Mongoose default connection has occured " + err + " error");
    });

    mongoose.connection.on('disconnected', () => {
        console.log("Mongoose default connection is disconnected");
    });

    process.on('SIGINT', () => {
        mongoose.connection.close( () => {
            console.log("Mongoose default connection is disconnected due to application termination");
            process.exit(0)
        });
    });
    
}
