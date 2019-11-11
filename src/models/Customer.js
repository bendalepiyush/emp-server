const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companyAdminSchema = 
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
        
        companyAdmins : [companyAdminSchema]

    },
    {
        strict: true
    });


mongoose.model('companyAdminSchema', companyAdminSchema);
module.exports = mongoose.model('Customer', customerSchema);