const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
var EmployeeModel = require("../models/Employee");
var SupervisorModel = require("../models/Supervisor");


router.post('/supervisor/register', (req, res) => {

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {

        if ( err ) 
            res.json( err );

        else {

            let fullName = req.body.firstname + ' ' + req.body.lastname;

            let supervisor = new SupervisorModel({
                email : req.body.email,
                fullName : fullName,
                mobileNo : req.body.mobileNo,
                password : hashedPassword
            });

            console.log(supervisor);
            supervisor.save( (err) => {
                if (err)
                    res.json(err);
                
                res.json(supervisor);

            });

        }

    });

});


router.post('/employee/register', (req, res, next) => {
        
    let profileId;

    EmployeeModel
        .findOne()
        .sort('-profileId') 
        .exec( (err, emp) => {

            if (err)
                res.json({ err: err });

            else {

                    if ( emp === null )
                        profileId = 1000;

                    else
                        profileId = emp.profileId + 1;
                        


                    let fullName = req.body.firstname + ' ' + req.body.lastname;

                    let employee = new EmployeeModel({
                        email : req.body.email,
                        fullName : fullName,
                        mobileNo : req.body.mobileNo,
                        profileId : profileId
                    });
            
                    employee.save( (err) => {

                        if (err)
                            res.json(err);

                        else
                            res.json({
                                profileId: profileId
                            });                        

                });

            }

        });

    

});


module.exports = router;
