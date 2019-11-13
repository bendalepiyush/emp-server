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
let AdminModel = require("../../models/Admin");
let CustomerModel = require("../../models/Customer");


/**
 * Email and SMS Service
 */
let sendMail = require("../../services/email-transporter");



router.post('/auth', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;

    AdminModel
        .findOne({ email : email })
        .exec( (err, admin) => {

            if (err)
                res.json(err);

            else if( admin === null )
                res.json({
                    err : "Email and Password combination is incorrect"
                });

            else {

                bcrypt.compare( password, admin.password, (err, result) => {

                    if (err)
                        res.json(err);

                    else {

                        if (result) {
                            
                            jwt.sign({
                                email: admin.email,
                                type: "Admin"
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
                                            email: admin.email,
                                            fullName: admin.fullName,
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

        });

});


router.post('/register', (req, res) => {

    let password = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);

    bcrypt.hash(password, 10, (err, hashedPassword) => {

        if ( err ) 
            res.json( err );

        else {        

            AdminModel
                .findOne({ email: req.body.email })
                .exec( (err, adm) => {
                    if(err)
                        res.json({ err: err });

                    else {

                        if(adm === null){

                            let fullName = req.body.firstname + ' ' + req.body.lastname;

                            let admin = new AdminModel({
                                email : req.body.email,
                                fullName : fullName,
                                password : hashedPassword
                            });

                            admin.save( (err) => {

                                if (err)
                                    res.json(err);
                                
                                else {

                                    let mailOptions = {
                                        to: req.body.email,
                                        subject: 'test',
                                        msg: password
                                    };
                                        
                                    sendMail(mailOptions);

                                }           
                
                            });
                

                        } else
                            res.json({ err: "Already registered" });

                    }
                });

        }

    });

});



router.post('/addCustomer', checkAuth, (req, res) => {

    if(req.jwtData.type === "Admin"){
        CustomerModel
            .findOne()
            .sort('-customerId')
            .exec((err, customer) => {
                
                if( err )
                    res.json({ 
                        err: err 
                    });
                else {

                    if(customer === null)
                        customerId = 1;
                    else
                        customerId = ++customer.customerId;

                    let password = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);

                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                    
                        if(err)
                            res.json({ 
                                err: err 
                            });
                            
                        else {  
                    
                            let ownerFullName = req.body.ownerFirstname + ' ' + req.body.ownerLastname;
                            let profileId = customerId * 10000 + 1;
                            let customer = new CustomerModel({
                                companyName : req.body.companyName,
                                email: req.body.email,
                                mobileNo: req.body.mobileNo,
                                ratePerWorkerPerMonth: req.body.ratePerWorkerPerMonth,
                                customerId: customerId,
                                companyAdmins: [{
                                    profileId : profileId,
                                    email : req.body.ownerEmail,
                                    fullName : ownerFullName,
                                    mobileNo : req.body.ownerMobileNo,
                                    password : hashedPassword
                                }]
                            }); 
                                                    
                            customer.save((err) => {
                                if(err)
                                    res.json({ 
                                        err: err 
                                    });
                                    
                                else {

                                    let mailOptions = {
                                        to: req.body.ownerEmail,
                                        subject: 'test',
                                        msg: "Profile ID - " + profileId + "\n" + password
                                    };
                                        
                                    sendMail(mailOptions);

                                }
                            });
                    
                        }
                    
                    });

                    
                }
                
            });
    } else 
        res.status(403).json({
            message: 'Forbidden',
            status: 403
        });
       
    
});


module.exports = router;
