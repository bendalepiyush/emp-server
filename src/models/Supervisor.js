const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = 
    new Schema({

        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true
        },

        mobileNo: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        }

    },
    {
        strict: true
    });


module.exports = mongoose.model('Supervisor', supervisorSchema);
