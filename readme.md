# Project Summary

## Backend (BE) Directory

The backend directory contains the server-side code responsible for handling 'business' logic, database interactions, and API endpoints. The main components in this directory include:

- **index.js**: It spins up an express server, uses the mongo driver to interact with a dockerized mongo DB server, uses express rate limit to rate limit either based on email, or IP, it also uses node-cron to setup a cron job that periodically(every 24hrs) clean up old user data. And for sending emails, Using Gmail API, and setting up oauth, I use nodemailer and a template html to send mails. I also uses handlebars, to swap out the content of the template with the DB data before sending. 
- **env**: It contains all the sensitive files I used. I explain how I got them and use them in the BE directory readme file [here](https://github.com/eebod/Verifier/blob/main/BE/readme.md).
- **utils**: I abstracted my data folder, containing a JSON of countryCode and countries in there, I also abstracted my DB logic into a DB class into a 'db,js' file, and the mailer logic and templates in there as well.

To setup the backend environment, all you have to do, is run ```npm install``` or ```yarn install``` in the BE directory..

## Frontend (FE) Directory

The frontend directory contains the client-side code responsible for the user interface and user experience. The main components in this directory include:

- **resource**: This directory houses all of my media files, javascript and stylesheet files, each in their respective directory.
- **Tailwind**: The tailwind directory contains my tailwind config file, source css file, node_modules, and the package.json file where I have scripts for developing and building the stylesheet based on the input from index.html and the its file.
- **Index.html**: The index file is where the HTML for the UI is stored, it also connects to the javascripts and css file, css, which is an output from Tailwind, and the simple JS file, to add functionality and interactiveness.

To setup the Tailwind environment, all you have to do, is run ```npm install``` or ```yarn install``` in the Tailwind directory inside /FE..


## Watch me use this project
<!-- [![Watch me use this project](<img-link>)](<video-url>)  
Click on Image to Youtube video or use link: <video-url> -->


## Help Improve
You can also contribute to improving how this works, by sending in a pull request. It can be to fix a problem, improve a section, or to add a new feature.


## Reach me
This was written and developed by me, Ebode.
You can find more adventurous solutions I have developed in my corner [here](https://ebode.dev).