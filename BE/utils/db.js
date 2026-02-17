const { MongoClient } = require('mongodb');
require('dotenv').config()

class DB{

    constructor(){
        this.client = null; // MongoDB client
        this.db = null; // DB Object
        this.userCollection = null; // Collection identifier
    }

    async connect(){
        try {
            const uri = process.env.DB_CONNECTION_URI; // Connection URL
            this.client = new MongoClient(uri);

            // Connect to running mongoDB server
            await this.client.connect();

            this.db = this.client.db('verifier');
            this.userCollection = this.db.collection('users');
            
            return true;
        } catch (error) {
            // console.error(error); // Used when in dev mode
            return false;
        }
    }

    async disconnect(){
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.userCollection = null;
        }
    }

    _ensureConnected(){
        if (!this.userCollection) {
            throw new Error('Database not connected. Call connect() first.');
        }
    }

    async insertData(dataObj){
        this._ensureConnected();
        try {
            const { code, email, time } = dataObj;
            await this.userCollection.insertOne({_id:email, code, time});
        } catch (error) {
            if(error.message.includes('E11000')){
                const { code, email, time } = dataObj;
                await this.userCollection.updateOne({_id: email}, { $set: { time: time, code: code}})
            } else {
                throw error;
            }
        }
    }

    async retrieveData(email){
        this._ensureConnected();
        try {
            const data = await this.userCollection.findOne({_id: email});
            return data;
        } catch (error) {
            throw error;
        }
    }

    async removeStaleUsers(){
        this._ensureConnected();
        try {
            const dayAgo = Math.floor((Date.now()/1000)) - (24 * 60  * 60);
            await this.userCollection.deleteMany({time: { $lt: dayAgo }});
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DB;