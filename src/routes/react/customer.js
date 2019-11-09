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
    let profileId = req.body.profileId;
    let password = req.body.password;

    let customerId = Math.floor(profileId / 10000); 

    CustomerModel
        .findOne({ customerId : customerId })
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
                    if(customer.companyAdmins[i].profileId === profileId){
                        console.log(customer.companyAdmins[i]);

                        bcrypt.compare( password, customer.companyAdmins[i].password, (err, result) => {

                            if (err)
                                res.json(err);
        
                            else {
        
                                if (result) {
                                    
                                    jwt.sign({
                                        profileId: profileId,
                                        type: "CustomerAdmin",
                                        customerId: customerId
                                        }, 
                                        jwtKey, 
                                        {
                                            expiresIn: '1h'
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
                }

            }

        });

});

router.post('/admins', checkAuth, (req, res) => {

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        CustomerModel
        .findOne({ customerId : req.jwtData.customerId })
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
        .findOne({ customerId : req.jwtData.customerId })
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

router.post('/workers', checkAuth, (req, res) => {

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        CustomerModel
        .findOne({ customerId : req.jwtData.customerId })
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
                res.json(customer.workers);
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

            CustomerModel
            .findOne({ customerId : req.jwtData.customerId })
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

                    let profileId;
                    // Calculate Profile ID
                    if(customer.supervisors.length === 0)
                        profileId = (req.jwtData.customerId * 10000) + 1;
                             
                    else
                        profileId = customer.supervisors[customer.supervisors.length - 1].profileId + 1;
                        
                        
                    // Save new supervisor
                    let fullName = req.body.firstname + ' ' + req.body.lastname;

                    let supervisor = {
                        profileId: profileId,
                        email : req.body.email,
                        fullName : fullName,
                        mobileNo : req.body.mobileNo,
                        password : hashedPassword
                    };

                    CustomerModel
                        .findOne({ customerId : req.jwtData.customerId })
                        .exec((err, customer) => {

                                if( err )
                                    res.json({
                                        err: err
                                    });

                                else{

                                    customer.supervisors.push(supervisor);
                                    customer.save((err)=> {
                                        if(err)
                                            res.json();

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

                                    }); 

                                }
                                    
                            }
                        );                  
                
                    
                }

            });        
            


        }

    });

});






module.exports = router;
