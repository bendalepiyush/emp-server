const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../../config/jwt');
let CustomerModel = require("../../models/Customer");
let transporter = require("../../services/smtp-server");

const checkAuth = require('../../services/check-auth');

// @TODO Replace customerId static to dynamic
router.post('/admin/auth', (req, res) =>{
    let email = req.body.email;
    let password = req.body.password;

    CustomerModel
        .findOne({ customerId : 1 })
        .exec( (err, customer) => {

            if (err)
                res.json({
                    err: err
                });

            else if(customer === null) 
                res.json({
                    err: "Something went wrong"
                });
            
            else {

                for(var i=0; i<customer.companyAdmins.length; i++){
                    if(customer.companyAdmins[i].email === email){
                        console.log(customer.companyAdmins[i]);

                        bcrypt.compare( password, customer.companyAdmins[i].password, (err, result) => {

                            if (err)
                                res.json(err);
        
                            else {
        
                                if (result) {
                                    
                                    jwt.sign({
                                        email: email,
                                        type: "CustomerAdmin"
                                        }, 
                                        jwtKey, 
                                        {
                                            expiresIn: '1h'
                                        }, 
                                        (err, token) => {
                                            if (err)
                                                //res.json(err);
                                                console.log("ez");
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
                }

            }

        });

});

router.post('/admins', checkAuth, (req, res) => {

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        CustomerModel
        .findOne({ customerId : 1 })
        .exec( (err, customer) => {

            if (err)
                res.json({
                    err: err
                });

            else if(customer === null) 
                res.json({
                    err: "Something went wrong"
                });
            
            else {
                res.json(customer.companyAdmins);
            }
        });

    } else {
        res.status(401).json({
            message: 'Forbidden',
            status: 403
        });
    }
    
});

router.post('/supervisors', checkAuth, (req, res) => {

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        CustomerModel
        .findOne({ customerId : 1 })
        .exec( (err, customer) => {

            if (err)
                res.json({
                    err: err
                });

            else if(customer === null) 
                res.json({
                    err: "Something went wrong"
                });
            
            else {
                res.json(customer.supervisors);
            }
        });

    } else {
        res.status(401).json({
            message: 'Forbidden',
            status: 403
        });
    }
    
});


router.post('/supervisor/register', checkAuth, (req, res) => {

    let password = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);

    bcrypt.hash(password, 10, (err, hashedPassword) => {

        if ( err ) 
            res.json( err );

        else {  
            
            let fullName = req.body.firstname + ' ' + req.body.lastname;

            let supervisor = {
                email : req.body.email,
                fullName : fullName,
                mobileNo : req.body.mobileNo,
                password : hashedPassword
            };

            CustomerModel
                .findOneAndUpdate(
                    { email: req.jwtData.email },
                    { $push: { supervisors: supervisor  }},

                    (err, success) => {
                        if( err )

                            res.json({
                                err: err
                            });

                        else{

                            let mailOptions = {
                                from: 'test@thetechnolover.com',
                                to: 'thetechnolover7@gmail.com',
                                subject: 'test ',
                                text: password,
                                html: password
                            };
                            
                            transporter.sendMail(mailOptions, function(err, info){
                                if(err)
                                    res.json({err: err});
                                else
                                    res.json(supervisor);
                            
                            });    

                        }
                            
                    }
                );


        }

    });

});






module.exports = router;
