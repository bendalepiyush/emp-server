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
                    
                } else 
                    res.json({
                        err: "No worker present"
                    });
                    

                if ( employee.attendaceLog.length <= 0 ) {
                    employee.attendaceLog.push(newAttendanceLog);

                    employee.save();
                    res.json({
                        message: "InTime added successfully"
                    });
                } else {

                    if ( employee.attendaceLog[employee.attendaceLog.length - 1].date === currentDate )
                        res.json({
                            message: "InTime already present"
                        });  
                    else {

                        employee.attendaceLog.push(newAttendanceLog);

                        employee.save();
                        res.json({
                            message: "InTime added successfully"
                        });

                    }

                }
                
            });


    } else {
        

        EmployeeModel
            .findOne({ customerId : req.jwtData.customerId })
            .exec( (err, employee) => {

                if (err)
                    res.json({ err : err });

                else if ( employee.attendaceLog.length <= 0 )
                    res.json({ err : "InTime not present" });

                else {
                    if ( employee.attendaceLog[employee.attendaceLog.length - 1].date !== currentDate )
                        res.json({ err : "InTime not present" });

                    else {

                        if ( employee.attendaceLog[employee.attendaceLog.length - 1].outTime )
                            res.json({
                                err: "OutTime already present" 
                            });
                        
                        else {
                            
                            employee.attendaceLog[employee.attendaceLog.length - 1].outTime = currentTime;

                            employee.save();
                            res.json({
                                message: "OutTime added successfully"
                            });

                        }
                                                
                    }                    
                }

            });
    
    }

    
});


module.exports = router;