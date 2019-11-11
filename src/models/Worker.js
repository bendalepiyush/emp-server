const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendaceLogSchema = 
    new Schema({
        
        date: {
            type: Date,
            required: true,
            default: new Date()
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

        attendaceLogs: [attendaceLogSchema]

    },
    {
        strict: true
    });


mongoose.model('attendaceLogSchema', attendaceLogSchema);
module.exports = mongoose.model('Worker', workerSchema);