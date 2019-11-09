const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    name: "mail.thetechnolover.com",
    host: "mail.thetechnolover.com",
    port: 587,
    secure: false,
    auth: {
		user: "test@thetechnolover.com",
		pass: "Piyush@123"
    },
    tls: { 
        rejectUnauthorized: false 
    }
});

