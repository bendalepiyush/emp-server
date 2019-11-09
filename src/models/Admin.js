const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const adminSchema = 
    new Schema({
        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        }

    },
    {
        strict: true
    });

module.exports = mongoose.model('Admin', adminSchema);
