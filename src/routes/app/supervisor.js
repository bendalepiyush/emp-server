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
let SupervisorModel = require("../../models/Supervisor");
let WorkerModel = require("../../models/Worker");



router.post('/auth', (req, res) => {

    let profileId = req.body.profileId;
    let password = req.body.password;
    const customerId = Math.floor(profileId / 10000); 

    SupervisorModel
        .findOne({ profileId : profileId })
        .exec( (err, supervisor) => {

            if (err)
                res.json({
                    err: err
                });

            else if(supervisor === null) 
                res.json({
                    err: "ID and Password combination is incorrect"
                });
            
            else {

                bcrypt.compare( password, supervisor.password, (err, result) => {

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
                                message: 'ID and Password combination is incorrect'
                            });

                        }

                    }

                });

            }

        });

});

router.post('/index', checkAuth, (req, res) => {

    const todaysDate = new Date().toDateString();
    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000;

    WorkerModel
        .countDocuments({ profileId : { $gt : limit.low, $lt : limit.high } })
        .exec((err, count) => {

            if(err)
                res.json(err);
                
            else

                WorkerModel
                    .countDocuments({ profileId : { $gt : limit.low, $lt : limit.high }, 'attendanceLogs.date' : todaysDate })
                    .exec( (err, countPresent) => { 
            
                        if(err)
                            res.json(err);

                        else
                            res.json({
                                allPresentworkers : countPresent,
                                totalworkers : count
                            });  

                    });
        });

    
});

router.post('/allWorkers', checkAuth, (req, res) => {
    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000;

    WorkerModel
        .find({ profileId : { $gt : limit.low, $lt : limit.high } })
        .exec( (err, workers) => { 
            if (err)
                res.json(err);
            else 
                res.json(workers);
        });
});


router.post('/allPresentWorkers', checkAuth, (req, res) => {
    const customerId = req.jwtData.customerId;
    let limit = {};
    limit.low = customerId * 10000;
    limit.high = limit.low + 10000;
    const todaysDate =  new Date().toDateString();
    WorkerModel
        .find({ profileId : { $gt : limit.low, $lt : limit.high }, 'attendanceLogs.date' : todaysDate })
        .exec( (err, workers) => { 

            if (err)
                res.json(err);
            else
                if ( workers ) 
                res.json(workers);

        });
});

router.post('/markPresent', checkAuth, (req, res) => {

    let profileId = req.body.profileId;
    let type = req.body.type;
    const todaysDate =  new Date().toDateString();
    const currentTime = new Date().toTimeString();

    
    if( type === 'in' ) {
        let newAttendanceLog = {
            date: todaysDate,
            inTime: currentTime,
            outTime: null,
            longitude: req.body.longitude,
            latitude: req.body.latitude
        };

        WorkerModel
            .findOne({ profileId : profileId })
            .exec( (err, worker) => {

                if(err) 
                    res.json({
                        err: err
                    });
                
                else {

                    if ( worker.attendanceLogs.length <= 0 ) {

                        worker.attendanceLogs.push(newAttendanceLog);
                        worker.save();
                        res.json({
                            message: "InTime added successfully"
                        });

                    } else {

                        if ( worker.attendanceLogs[worker.attendanceLogs.length - 1].date === todaysDate )
                            res.json({
                                message: "InTime already present"
                            });  
                            
                        else {

                            worker.attendanceLogs.push(newAttendanceLog);

                            worker.save();
                            res.json({
                                message: "InTime added successfully"
                            });

                        }

                    }
                }
            });


    } else {
        

        WorkerModel
            .findOne({ profileId : profileId })
            .exec( (err, worker) => {

                if (err)
                    res.json({ err : err });

                else if ( worker.attendanceLogs.length <= 0 )
                    res.json({ err : "InTime not present" });

                else {
                    if ( worker.attendanceLogs[worker.attendanceLogs.length - 1].date !== todaysDate )
                        res.json({ err : "InTime not present" });

                    else {

                        if ( worker.attendanceLogs[worker.attendanceLogs.length - 1].outTime )
                            res.json({
                                err: "OutTime already present" 
                            });
                        
                        else {
                            
                            worker.attendanceLogs[worker.attendanceLogs.length - 1].outTime = currentTime;

                            worker.save();
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
