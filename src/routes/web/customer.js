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
var sendMail = require("../../services/email-transporter");


router.post('/admin/signInWithToken', checkAuth, (req, res) => {
    res.json({
        auth: true     
    });
});

router.post('/admin/auth', (req, res) =>{

    let profileId = req.body.profileId;
    let password = req.body.password;

    let customerId = Math.floor(profileId / 10000); 

    CustomerModel
        .findOne({ customerId : customerId })
        .exec( (err, customer) => {

            if (err){
                res.json({
                    err: err
                });

            }else if(customer === null){
                res.json({
                    err: "ID and Password combination is incorrect"
                });
                
            
            }else {
                
                for(var i=0; i<customer.companyAdmins.length; i++){

                    if(customer.companyAdmins[i].profileId === profileId){
                        bcrypt.compare( password, customer.companyAdmins[i].password, (err, result) => {

                            if (err){
                                res.json(err);

                            }else {        

                                if (result) {

                                    try {
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

                                                if (err){
                                                    res.json(err);
    
                                                }else {
                                                    res.json({
                                                        email: customer.companyAdmins[i].email,
                                                        fullName: customer.companyAdmins[i].fullName,
                                                        token : token,
                                                        message : 'Authentication Successful' 
                                                    });
                                                }
                                                
                                            });

                                    } catch(err){
                                        res.json(err);
                                    }
        
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


router.post('/monthlyStatus', checkAuth, (req, res) => {

    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000; 

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin") ) {

        WorkersModel
            .find({ profileId : { $gt : limit.low, $lt : limit.high } }, { fullName: 1, attendanceLogs: 1, stipendPerDay: 1 })
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

   }

});

router.post('/admins', checkAuth, (req, res) => {

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin") ) {

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

    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000; 

    if( (req.jwtData.type === "CustomerAdmin") || (req.jwtData.type === "Admin")){

        WorkersModel
            .find({ profileId : { $gt : limit.low, $lt : limit.high } })
            .exec( (err, workers) => {

                if (err)
                    res.json({
                        err: err
                    });

                else if(workers === null) 
                    res.json({
                        err: "Something went wrong"
                    });
                
                else {
                    res.json(workers);
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

    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000; 
    

    let password = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);

    bcrypt.hash(password, 10, (err, hashedPassword) => {

        if ( err ) 
            res.json( err );

        else {  

            SupervisorModel
                .findOne({ profileId : { $gt : limit.low, $lt : limit.high } })
                .sort('-profileId')
                .exec( (err, supervisor) => {

                    if (err)
                        res.json({
                            err: err
                        });
                    
                    else {

                        let profileId;
                        // Calculate Profile ID
                        if(supervisor === null)
                            profileId = (req.jwtData.customerId * 10000) + 1;
                                
                        else
                            profileId = supervisor.profileId + 1;
                            
                            
                        // Save new supervisor
                        let fullName = req.body.firstname + ' ' + req.body.lastname;

                        let newSupervisor = new SupervisorModel({
                            profileId: profileId,
                            email : req.body.email,
                            fullName : fullName,
                            mobileNo : req.body.mobileNo,
                            password : hashedPassword
                        });

                        newSupervisor.save((err)=> {
                            if(err)
                                res.json();

                            else{
                                
                                let mailOptions = {
                                    to: req.body.email,
                                    subject: 'test',
                                    msg: "Profile ID - " + profileId + "\n" + password
                                };
                                    
                                sendMail(mailOptions);

                                res.json({
                                    msg: "Please check your inbox"
                                });
                            }

                        }); 

                        
                    }

                });        
            


        }

    });

});



router.post('/worker/register', checkAuth, (req, res) => {

    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000; 

    WorkersModel
        .findOne({ profileId : { $gt : limit.low, $lt : limit.high } })
        .sort('-profileId')
        .exec( (err, worker) => {

            if (err)
                res.json({
                    err: err
                });

            else {

                let profileId;

                // Calculate Profile ID
                if(worker === null)
                    profileId = (req.jwtData.customerId * 10000) + 1;
                             
                else
                    profileId = worker.profileId + 1;
                
                    
                // Save new worker
                let fullName = req.body.firstname + ' ' + req.body.lastname;

                let newWorker = new WorkersModel({
                    profileId: profileId,
                    email : req.body.email,
                    fullName : fullName,
                    mobileNo : req.body.mobileNo
                });

                newWorker.save(
                    (err)=> {

                        if(err)
                            res.json();

                        else {

                            let mailOptions = {
                                to: req.body.email,
                                subject: 'test',
                                msg: "You are successfully added"
                            };
                                
                            sendMail(mailOptions);

                            res.json({
                                profileId: profileId,
                                customerId: customerId
                            });

                        }
                    }); 
 
                
            }

        });        
            
    });




module.exports = router;
