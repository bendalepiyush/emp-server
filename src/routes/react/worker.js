const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
let transporter = require("../../services/smtp-server");

router.post('/supervisor/register', (req, res) => {

    let password = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);

    bcrypt.hash(password, 10, (err, hashedPassword) => {

        if ( err ) 
            res.json( err );

        else {        

            SupervisorModel
                .findOne({ email: req.body.email })
                .exec( (err, sup) => {
                    if(err)
                        res.json({ err: err });

                    else {

                        if(sup === null){

                            let fullName = req.body.firstname + ' ' + req.body.lastname;

                            let supervisor = new SupervisorModel({
                                email : req.body.email,
                                fullName : fullName,
                                mobileNo : req.body.mobileNo,
                                password : hashedPassword
                            });

                            supervisor.save( (err) => {

                                if (err)
                                    res.json(err);
                                
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
                                
                
                            });
                

                        } else
                            res.json({ err: "Already registered" });

                    }
                });


        }

    });

});



router.post('/supervisor', (req, res) => {
    SupervisorModel
        .find()
        .exec( (err, supervisors) => { 
            if (err)
                res.json(err);
            else 
                res.json(supervisors);
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
                    
                    EmployeeModel
                        .findOne({ email: req.body.email })
                        .exec( (err, emp) => {
                            if(err)
                                res.json({ err: err });

                            else {

                                if(emp === null){
                                    employee.save( (err) => {

                                        if (err)
                                            res.json(err);
                
                                        else
                                            res.json({
                                                profileId: profileId
                                            });                        
                
                                    });

                                } else
                                    res.json({ err: "Already registered" });

                            }
                        });

                    

            }

        });

    

});



router.post('/employee', (req, res) => {
    EmployeeModel
        .find()
        .exec( (err, employees) => { 
            if (err)
                res.json(err);
            else 
                res.json(employees);
        });    
});


module.exports = router;
