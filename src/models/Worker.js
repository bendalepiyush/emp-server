const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceLogSchema = 
    new Schema({
        
        date: {
            type: String,
            required: true,
            default: new Date()
        },

        inTime: {
            type: String
        },

        outTime: {
            type: String
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        }

    });


const workerSchema = 
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
            required: true,
            unique: true
        },

        mobileNo: {
            type: String,
            required: true
        },

        stipendPerDay: {
            type: Number,
            default: 100
        },

        attendanceLogs: [attendanceLogSchema]

    },
    {
        strict: true
    });


mongoose.model('attendanceLogSchema', attendanceLogSchema);
module.exports = mongoose.model('Worker', workerSchema);