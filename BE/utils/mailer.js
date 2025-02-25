const nodemailer = require('nodemailer');
const {google} = require("googleapis");
const {compile} = require("handlebars");
const {readFileSync} = require("fs");
const path = require('path');
require('dotenv').config();


/**
 * Handlebar compile template replacement function.
 * @param {string} filePath the path to the html template file.
 * @param {string} replacements the content to be swapped out in the mail.
 * @return {function} the new html file with the new content.
 */
function generateMail (filePath, replacements){
  const source = readFileSync(path.join(__dirname, filePath), "utf-8").toString();
  const template = compile(source);
  const htmlToSend = template(replacements);

  return htmlToSend;
};


/**
 * Sends an email using Gmail's OAuth2 authentication.
 * @param {object} swap - Swap object
 * @return {Promise} A promise that resolves to the result of the sendMail operation.
 */
async function sendMail(swap) {  
  try {
    const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;
    const REDIRECT_URI = "https://developers.google.com/oauthplayground";
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
  
    const { email, code, state, country } = swap;
    const replacements = {
      "email-addr": email,
      "state": state,
      "country": country,
      "ver-code": code,
    }
  
    const mail = generateMail('./mail-template/verify.html', replacements);
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "e.verifier.dev@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOPtions = {
      from: "Verifier <e.verifier.dev@gmail.com>",
      to: email,
      subject: `Verifier code - ${code}`,
      html: mail,
    };

    return transport.sendMail(mailOPtions);
  } catch (error) {
    throw error;
  }
}


module.exports = sendMail;