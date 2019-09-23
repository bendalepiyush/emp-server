const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = 
    new Schema({
        profileId: {
            type: Number,
            unique: true
        },

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

        atterndaceLog: [{
            date: Date,
            inTime: Date,
            outTime: Date
        }]

    },
    {
        strict: true
    });


module.exports = mongoose.model('Employee', employeeSchema);
