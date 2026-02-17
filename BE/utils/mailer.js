const nodemailer = require('nodemailer');
const {compile} = require("handlebars");
const {readFileSync} = require("fs");
const path = require('path');
require('dotenv').config();


/**
 * Handlebar compile template replacement function.
 * @param {string} filePath the path to the html template file.
 * @param {object} replacements the content to be swapped out in the mail.
 * @return {string} the new html file with the new content.
 */
function generateMail (filePath, replacements){
  const source = readFileSync(path.join(__dirname, filePath), "utf-8").toString();
  const template = compile(source);
  const htmlToSend = template(replacements);

  return htmlToSend;
};

// Reusable transport instance
let transport = null;

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_MAIL_USER,
        pass: process.env.GOOGLE_APP_PASSWORD
      },
    });
  }
  return transport;
}


/**
 * Sends an email using Gmail's OAuth2 authentication.
 * @param {object} swap - Swap object
 * @return {Promise} A promise that resolves to the result of the sendMail operation.
 */
async function sendMail(swap) {  
  try {
    const { email, code, state, country } = swap;
    const replacements = {
      "email-addr": email,
      "state": state,
      "country": country,
      "ver-code": code,
    }
  
    const mail = generateMail('./mail-template/verify.html', replacements);
    const mailTransport = getTransport();

    const mailOPtions = {
      from: `Verifier <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Verifier code - ${code}`,
      html: mail,
    };

    return mailTransport.sendMail(mailOPtions);
  } catch (error) {
    throw error;
  }
}


module.exports = sendMail;