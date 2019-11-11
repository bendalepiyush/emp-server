const express = require('express');
const router = express.Router();
const bcrypt= require('bcrypt');


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


router.post('/auth', (req, res) => {

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

            else if(customer.supervisors.length < 1 || customer === null) 
                res.json({
                    err: "Something went wrong"
                });
            
            else {

                for(var i=0; i<customer.supervisors.length; i++){
                    if(customer.supervisors[i].profileId === profileId){
                     
                        bcrypt.compare( password, customer.supervisors[i].password, (err, result) => {

                            if (err)
                                res.json(err);
        
                            else {
        
                                if (result) {
                                    
                                    jwt.sign({
                                        profileId: profileId,
                                        type: "Supervisor",
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


router.post('/', checkAuth, (req, res) => {

    let currentDateTime = new Date;
    let currentDate =  currentDateTime.getDate() + '/' + (currentDateTime.getMonth()+1) + '/' + currentDateTime.getFullYear();

    
    // CustomerModel
    //     .countDocuments()
    //     .exec((err, count) => {

    //         if(err)
    //             res.json(err);
                
    //         else

    //             EmployeeModel
    //                 .countDocuments({ 'attendaceLog.date' : currentDate })
    //                 .exec( (err, countPresent) => { 
            
    //                     if(err)
    //                         res.json(err);

    //                     else
    //                         res.json({
    //                             allPresentEmployees : countPresent,
    //                             totalEmployees : count
    //                         });  

    //                 });
    //     });

    
});


router.post('/markPresent', checkAuth, (req, res) => {

    let profileId = req.body.profileId;
    let type = req.body.type;
    let currentDateTime = new Date;
    let currentDate =  currentDateTime.getDate() + '/' + (currentDateTime.getMonth()+1) + '/' + currentDateTime.getFullYear();
    let currentTime = currentDateTime.getHours() + ':' + currentDateTime.getMinutes();

    
    if( type === 'in' ) {
        let newAttendanceLog = {
            date: currentDate,
            inTime: currentTime,
            outTime: null,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };

        CustomerModel
            .findOne({ customerId : req.jwtData.customerId })
            .exec( (err, customer) => {

                if( customer.workers.length > 0 ) {
                    
                    for(let i=0; i<customer.workers.length; i++){

                        if(customer.workers[i].profileId === profileId){

                            if ( customer.workers[i].attendaceLog <= 0 ){

                                customer.workers[i].attendaceLog.push(newAttendanceLog);
                                customer.save();

                                res.json({
                                    message: "InTime added successfully"
                                });

                            } else {

                                if ( customer.workers[i].attendaceLog[customer.workers[i].attendaceLog.length - 1].date === currentDate )
                                    res.json({
                                        message: "InTime already present"
                                    });

                                else {

                                    customer.workers[i].attendaceLog.push(newAttendanceLog);
                                    customer.save();

                                    res.json({
                                        message: "InTime added successfully"
                                    });

                                }

                            }
                                

                            break;
                        }
                    }

                } else 
                    res.json({
                        err: "No worker present"
                    });
                                    
                
            });


    } else {
        
        CustomerModel
            .findOne({ customerId : req.jwtData.customerId })
            .exec( (err, customer) => {

                if( customer.workers.length > 0 ) {
                    
                    for(let i=0; i<customer.workers.length; i++){

                        if(customer.workers[i].profileId === profileId){

                            if ( customer.workers[i].attendaceLog <= 0 ){

                                res.json({
                                    message: "InTime not present"
                                });

                            } else {

                                if ( customer.workers[i].attendaceLog[customer.workers[i].attendaceLog.length - 1].date === currentDate )
                                    
                                    if(customer.workers[i].attendaceLog[customer.workers[i].attendaceLog.length - 1].outTime)
                                        res.json({
                                            err: "OutTime already present" 
                                        });
                                        
                                    else {

                                        customer.workers[i].attendaceLog[customer.workers[i].attendaceLog.length - 1].outTime = currentTime;
                                        customer.save();
                                        
                                        res.json({
                                            message: "OutTime added successfully"
                                        });
                                        
                                    }

                                else {

                                    res.json({
                                        message: "InTime not present"
                                    });

                                }

                            }
                                

                            break;
                        }
                    }

                } else 
                    res.json({
                        err: "No worker present"
                    });
                                    
                
            });
           
    
    }

    
});


module.exports = router;