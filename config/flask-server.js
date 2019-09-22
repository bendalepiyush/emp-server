if ( process.env.FLASK_URI )

    module.exports = process.env.FLASK_URI;

else

    module.exports = 'http://127.0.0.1:5000';

