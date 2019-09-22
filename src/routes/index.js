const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const flaskURI = require('../../config/flask-server');
const apiHelper = require('../services/api-helper');
var EmployeeModel = require("../models/Employee");
var SupervisorModel = require("../models/Supervisor");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});
  
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
  
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


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


router.post('/employee/register', upload.single('profile'), (req, res, next) => {
        
    if (req.file.size < (15 * 1024) ) 
        res.json({err : 'File size less than 15kb'});

    else {

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
                        profile : req.file.filename,
                        profileId : profileId
                    });
            
                    employee.save( (err) => {

                        if (err)
                            res.json(err);

                        apiHelper.make_API_call( flaskURI + '/employee/register' )
                            .then(employee => {
                                res.json({
                                    data: employee,
                                    host: req.get('host'),
                                    directory: '/public/uploads'
                                })
                            })
                            .catch(err => {
                                res.send(err);
                            });

                    });

                }

            });

    }

});


module.exports = router;
