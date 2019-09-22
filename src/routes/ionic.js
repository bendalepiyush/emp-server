const express = require('express');
const router = express.Router();
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = require('../../config/jwt');
const checkSupAuth = require('../services/check-supervisor-auth');
let SupervisorModel = require('../models/Supervisor');
let EmployeeModel = require("../models/Employee");

router.post('/auth', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    SupervisorModel
        .findOne({ email : email })
        .exec( (err, supervisor) => {
            if (err)
                res.json(err);

            else {

                bcrypt.compare( password, supervisor.password, (err, result) => {

                    if (err)
                        res.json(err);

                    else {

                        if (result) {
                            
                            jwt.sign({
                                email: supervisor.email
                                }, 
                                jwtKey, 
                                {
                                    expiresIn: '2h'
                                }, 
                                (err, token) => {
                                    if (err)
                                        res.json(err);
                                    else {
                                        res.json({
                                            token : token,
                                            message : 'Authentication Successful' 
                                        });
                                    }
                                });

                        } else {
                            
                            res.status(401).json({
                                message: 'Email and Password combination is incorrect'
                            });

                        }

                    }

                });

            }

        });

});

router.post('/allemployees', checkSupAuth, (req, res) => {
    EmployeeModel
        .find()
        .exec( (err, employees) => { 
            if (err)
                res.json(err);
            else 
                res.json(employees);
        });
});

router.post('/totalEmployees', checkSupAuth, (req, res) => {
    EmployeeModel
	.count()
	.exec((err, count) => {
	    if(err)
		    res.json(err);
	    else
		    res.json(count);
	});
});

module.exports = router;
