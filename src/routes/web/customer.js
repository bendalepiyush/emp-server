const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');


/**
 * JWT Token
 */
const jwt = require('jsonwebtoken');
const jwtKey = require('../../../config/jwt');
const checkAuth = require('../../services/check-auth');


/**
 * Mongoose Models
 */
let CustomerModel = require("../../models/Customer");
let SupervisorModel = require("../../models/Supervisor");
let WorkersModel = require("../../models/Worker");

/**
 * Email and SMS Service
 */
let transporter = require("../../services/smtp-server");


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

                        break;
        
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

    } else 
        res.status(403).json({
            message: 'Forbidden',
            status: 403
        });
    
});

router.post('/supervisors', checkAuth, (req, res) => {

    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000;   

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        SupervisorModel
            .find({ profileId : { $gt : limit.low, $lt : limit.high } })
            .exec( (err, supervisors) => {

                if (err)
                    res.json({
                        err: err
                    });

                else if(supervisors === null) 
                    res.json({
                        err: "Something went wrong"
                    });
                
                else {
                    res.json(supervisors);
                }
            });

    } else

        res.status(403).json({
            message: 'Forbidden',
            status: 403
        });
    
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
        res.status(403).json({
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
                                                to: req.body.email,
                                                subject: 'test ',
                                                text: "Profile ID - " + profileId + "\n" + password,
                                                html: password
                                            };
                                            
                                            transporter.sendMail(mailOptions, (err, info) => {

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



router.post('/worker/register', checkAuth, (req, res) => {

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
                    profileId = customer.workers[customer.workers.length - 1].profileId + 1;
                
                    
                // Save new supervisor
                let fullName = req.body.firstname + ' ' + req.body.lastname;

                let worker = {
                    profileId: profileId,
                    email : req.body.email,
                    fullName : fullName,
                    mobileNo : req.body.mobileNo
                };

                CustomerModel
                    .findOne({ customerId : req.jwtData.customerId })
                    .exec((err, customer) => {

                    if( err )
                        res.json({
                            err: err
                        });

                    else{

                        customer.workers.push(worker);
                        customer.save(
                            (err)=> {

                                if(err)
                                    res.json();

                                else {

                                    let mailOptions = {
                                        from: 'test@thetechnolover.com',
                                        to: req.body.email,
                                        subject: 'test ',
                                        text: "You have successfully added",
                                        html: "You have successfully added"
                                    };
                                            
                                    transporter.sendMail(mailOptions, (err, info) => {

                                        if(err)
                                            res.json({err: err});
                                        else
                                            res.json(supervisor);
                                    });  

                                }
                            }); 

                    }
                                    
                    });                  
                
            }

        });        
            
    });




module.exports = router;
