const express = require('express');
const router = express.Router();
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = require('../../config/jwt');
const checkSupAuth = require('../services/check-supervisor-auth');
let SupervisorModel = require('../models/Supervisor');
let EmployeeModel = require("../models/Employee");



router.post('/', checkSupAuth, (req, res) => {

    let currentDateTime = new Date;
    let currentDate =  currentDateTime.getDate() + '/' + (currentDateTime.getMonth()+1) + '/' + currentDateTime.getFullYear();

    
    EmployeeModel
        .countDocuments()
        .exec((err, count) => {

            if(err)
                res.json(err);
                
            else

                EmployeeModel
                    .countDocuments({ 'attendaceLog.date' : currentDate })
                    .exec( (err, countPresent) => { 
            
                        if(err)
                            res.json(err);

                        else
                            res.json({
                                allPresentEmployees : countPresent,
                                totalEmployees : count
                            });  

                    });
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
        .countDocuments()
        .exec((err, count) => {
            if(err)
                res.json(err);
            else
                res.json(count);
        });
});


router.post('/allPresentEmployees', checkSupAuth, (req, res) => {
    let currentDateTime = new Date;
    let currentDate =  currentDateTime.getDate() + '/' + (currentDateTime.getMonth()+1) + '/' + currentDateTime.getFullYear();
    EmployeeModel
        .find({ 'attendaceLog.date' : currentDate })
        .exec( (err, employees) => { 

            if (err)
                res.json(err);
            else
                if ( employees ) 
                res.json(employees);

        });
});

router.post('/markPresent', checkSupAuth, (req, res) => {

    let profileId = req.body.profileId;
    let type = req.body.type;
    let currentDateTime = new Date;
    let currentDate =  currentDateTime.getDate() + '/' + (currentDateTime.getMonth()+1) + '/' + currentDateTime.getFullYear();
    let currentTime = currentDateTime.getHours() + ':' + currentDateTime.getMinutes();

    
    if( type === 'in' ) {
        let newAttendanceLog = {
            date: currentDate,
            inTime: currentTime,
            outTime: null
        };

        EmployeeModel
            .findOne({ profileId : profileId })
            .exec( (err, employee) => {

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
            .findOne({ profileId : profileId })
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
