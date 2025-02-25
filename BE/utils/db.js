const { MongoClient } = require('mongodb');
require('dotenv').config()

class DB{

    constructor(){
        this.db; // DB Object
        this.userCollection; // COllection identifier
    }

    async connect(){
        try {
            const uri = process.env.DB_CONNECTION_URI; // Connection URL
            const client = new MongoClient(uri);

            // Connect to running mongoDB server
            await client.connect();

            this.db = client.db('verifier');
            this.userCollection = this.db.collection('users');
            
            return true
        } catch (error) {
            // console.error(error); // Used when in dev mode
            return false;
        }
    }

    async insertData(dataObj){
        try {
            const { code, email, time } = dataObj;
            await this.userCollection.insertOne({_id:email, code, time})
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
        try {
            const data = await this.userCollection.findOne({_id: email});
            return data;
        } catch (error) {
            throw error;
        }
    }

    async removeStaleUsers(){
        try {
            const dayAgo = Math.floor((Date.now()/1000)) - (24 * 60  * 60);
            await this.userCollection.deleteMany({time: { $lt: dayAgo }});
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DB;