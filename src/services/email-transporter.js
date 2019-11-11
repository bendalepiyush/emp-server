const nodemailer = require('nodemailer');

const config = nodemailer.createTransport({
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


module.exports = (options) => {

	let mailOptions = {
		from: 'test@thetechnolover.com',
		to: options.to,
		subject: options.subject,
		text: options.msg
	};

	transporter.sendMail(mailOptions, function(err, info){

		if(err)
			res.json({err: err});

		else
			res.json({
				msg: "Please check your inbox",
				info: info
			});
		
	});

} 
