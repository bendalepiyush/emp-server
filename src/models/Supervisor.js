const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisor = 
    new Schema({

        profileId: {
            type: Number,
            unique: true,
            required: true
        },

        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
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

    
module.exports = mongoose.model('Supervisor', supervisor);