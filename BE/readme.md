# Getting environment Variables
There a 5 environment variables in here, each gotten differently.

- **DB_CONNECTION_URI=mongodb://<...>/:** This is the mongodb connection string, depending on if you're using atlas, or running mongodb locally, you can check the documentation [here](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/#std-label-node-connect-to-mongodb) for that. In my case, I am running mongo from a docker container, and exposing it to port 27017 with a -p flag to publish the port from the container on 27017:27017. You can watch this [video](https://youtu.be/gFjpv-nZO0U?si=RliCV73d3q2eBjT2) to better understand this.

- **Google AUTH for GMAIL:** This is used to setup the authentication process to allow for sending emails via GMAIL. Easiest way to do this, is read [this](https://support.google.com/accounts/answer/185833)
    - GOOGLE_APP_PASSWORD=&lt;google_app_password&gt;

- **IP_INFO_TOKEN=<ip_info_free_token>** Finally, I use the IPinfo API, for getting the user location, which is appended in the email, to let them know where the IP making the request is located. It has a generous free tier of 50k req/month. To use them, simply create an account at https://ipinfo.io/signup, and read their API docs [here](https://ipinfo.io/developers).