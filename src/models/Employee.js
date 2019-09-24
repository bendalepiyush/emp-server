const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendaceLogSchema = 
    new Schema({
        date: {
            type: String,
            required: true,
            unique: true
        },

        inTime: {
            type: String,
            required: true
        },

        outTime: {
            type: String
        }

    });

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

        attendaceLog: [attendaceLogSchema]

    },
    {
        strict: true
    });


mongoose.model('attendaceLogSchema', attendaceLogSchema);
module.exports = mongoose.model('Employee', employeeSchema);
