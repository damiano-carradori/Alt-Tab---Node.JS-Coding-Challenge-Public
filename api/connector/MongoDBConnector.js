const { MongoClient } = require("mongodb");
const { randomBytes } = require("crypto");

const url = "mongodb://admin:admin1234@ds016098.mlab.com:16098/mydb";

const MongoDBConnector = {

    existsEmail : async email => {
        const db = await MongoClient.connect(url);
        const user = await db.collection('users').findOne({
            email
        });
        db.close();
        return !!user;
    },
    loginUser : async ( email, password ) => {
        const db = await MongoClient.connect(url);
        // TODO : add some security, encrypt password?
        const user = db.collection('users').findOne({
            email,
            password
        });
        db.close();
        return user;
    },
    saveUser : async ( email, password, name ) => {
        let buffer = await randomBytes(32);
        let token = buffer.toString('hex');
        const db = await MongoClient.connect(url);
        db.collection('users').insertOne({
            email,
            password,
            name,
            token
        });
        db.close();
        return token;
    },
    getUserByToken : async token => {
        const db = await MongoClient.connect(url);
        const user = db.collection('users').findOne({
            token
        });
        db.close();
        return user;
    }
};

module.exports = MongoDBConnector;

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});
