const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');

const { rateLimit } = require('express-rate-limit');
const countryCode = require('./utils/data/countryCode.json');
const sendMail= require('./utils/mailer');
const DB = require('./utils/db');
const verifierDB = new DB();

const PORT = process.env.PORT || 5000;
const  app = express();

const limit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { sts: false, msg: 'Too many requests, please try again later.' },
    keyGenerator: (req, res) => retMailOrIp(req),
})

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(limit);
app.set('trust proxy', true);
app.use(cors(corsOptions))
app.use(express.json())

let dbUp; // DB Connection Monitor


app.get('/', async (req,res) =>{
    try {
        res.status(200).json({sts: true, msg: 'Health check positive!'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({sts: false, msg: 'An error occured, please try again!'});
    }
})

app.post('/requestCode', async (req, res) => {
    try {
        if(!dbUp) return res.status(500).json({ sts: false, msg: 'DB connection down!'});

        const { email } = req.body;

        if (!email) return res.status(400).json({sts: false, msg: 'Email is required' });
    
        const epochSecond = Math.floor(Date.now()/1000);
        const code = generateVerificationCode()
        await verifierDB.insertData({code, email, time: epochSecond});

        const userIp = getClientIp(req);
        const userGeoData = await getGeoData(userIp);
        const { state, country } = userGeoData;
        
        // send Mail
        await sendMail({ email, code, state, country });
        return res.status(200).json({ sts: true, msg: 'Verification code sent to mail' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({sts: false, msg: 'An error occured, please try again!'});
    }
})

app.post('/verifyCode', async(req, res) => {

    try {
        if(dbUp) return res.status(500).json({ sts: false, msg: 'DB connection down!'});

        const { email, code } = req.body;
    
        if (!email) return res.status(400).json({sts: false, msg: 'Email is required' });
    
        if (!code) return res.status(400).json({sts: false, msg: 'Verification code is required.' })

        const userData = await verifierDB.retrieveData(email);

        if(!userData) return res.status(404).json({sts: false, msg: 'User with email address not found!' })

        if (!isTimeValid(userData.time)) return res.status(400).json({sts: false, msg: 'Code expired, get a new code'})

        if(userData.code !== code) return res.status(400).json({sts: false, msg: 'Incorrect code supplied'});

        return res.status(200).json({ sts: true, msg: 'Account verified successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({sts: false, msg: 'An error occured, please try again!'});
    }

})


app.listen(PORT, async ()=>{
    dbUp = await verifierDB.connect();
    dbUp ? console.log('DB connected.') : console.log('DB not connected!');
    console.log(`API server listening on port: ${PORT}`);
})

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isTimeValid(suppliedEpochTime) {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000);
    const timeDifference = currentEpochTime - suppliedEpochTime;
    const fifteenMinutesInSeconds = 15 * 60;

    return timeDifference <= fifteenMinutesInSeconds;
}


/**
 * Gets the real IP address from various headers
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIp(req) {

    let ip = req.headers['x-forwarded-for']?.split(',')[0] || // Check for proxy forwarded IP
      req.headers['x-real-ip'] || // Check for nginx real IP header
      req.connection.remoteAddress || // Direct connection IP
      req.socket.remoteAddress || // Socket IP
      req.ip // express Ip

    ip = ip.replace(/^::ffff:/, '');
    if(ip == '::1') return  '127.0.0.1'; // localhost IP reformat to work with ratelimit
    return ip;
}


function retMailOrIp(req){
    if(req.body && req.body.email){
        return req.body.email;
    } else {
        return getClientIp(req);
    }
}


/**
 * Fetches geolocation data for an IP address
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Geolocation data
 */
async function getGeoData(ip) {
    try {
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://ipinfo.io/${ip}/json?token=${process.env.IP_INFO_TOKEN}`,
          headers: { }
        };

        let response = await axios.request(config);
        let data = response.data;

        return { state: data.region, country: countryCode[data.country] }
    } catch (error) {
      throw error
    }
}

// DB Cleaner Cron Job
cron.schedule("0 0 * * *", async() => {
    if(dbUp){
        await verifierDB.removeStaleUsers();
    }
});