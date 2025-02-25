# Getting environment Variables
There a 5 environment variables in here, each gotten differently.

- **DB_CONNECTION_URI=mongodb://<...>/:** This is the mongodb connection string, depending on if you're using atlas, or running mongodb locally, you can check the documentation [here](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/#std-label-node-connect-to-mongodb) for that. In my case, I am running mongo from a docker container, and exposing it to localhost with a -p flag to publish the port from the container on 20127:20127. You can watch this [video](https://youtu.be/gFjpv-nZO0U?si=RliCV73d3q2eBjT2) to better understand this.

- **Google AUTH for GMAIL:** This was used to setup the authentication process to allow for sending emails. Easiest way to do this, is read docs, or follow along in this [video](https://www.youtube.com/watch?v=-rcRf7yswfM)
    - CLIENT_ID=&lt;oauth_client_id&gt;
    - CLIENT_SECRET=&lt;oauth_client_secret&gt;
    - REFRESH_TOKEN=&lt;auth_refresh_token&gt;

- **IP_INFO_TOKEN=<ip_info_free_token>** Finally, I use the IPinfo API, for getting the user location, which is appended in the email, to let them know where the IP making the request is located. It has a generous free tier of 50k req/month. To use them, simply create an account at https://ipinfo.io/signup, and read their API docs [here](https://ipinfo.io/developers).