const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendaceLogSchema = 
    new Schema({
        date: {
            type: String,
            required: true
        },

        inTime: {
            type: String,
            required: true
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
        },

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

        attendaceLog: [attendaceLogSchema]

    },
    {
        strict: true
    });


const stakeholderSchema = 
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



const customerSchema = 
    new Schema({

        companyName: {
            type: String,
            required: true
        },

        customerId: {
            type: Number,
            unique: true,
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

        noOfTotalWorkers: {
            type: Number,
            default: 1
        },

        ratePerWorkerPerMonth: {
            type: Number,
            default: 1
        },
        
        companyAdmins : [stakeholderSchema],

        supervisors: [stakeholderSchema],

        workers: [workerSchema]

    },
    {
        strict: true
    });


mongoose.model('stakeholderSchema', stakeholderSchema);
mongoose.model('attendaceLogSchema', attendaceLogSchema);
mongoose.model('Worker', workerSchema);
module.exports = mongoose.model('Customer', customerSchema);