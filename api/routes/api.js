const express = require('express');
const router = express.Router();

const MongoDBConnector = require('../connector/MongoDBConnector');

router.post('/register', async (req, res, next) => {
    let { email, password, name } = req.body;
    if(email === undefined || password === undefined || name === undefined){
        res.status(400).json({ code:400, status: 'error', message: 'Something is missing!' });
    } else {
        try {
            if( await MongoDBConnector.existsEmail(email) ){
                res.status(400).json({ code:400, status: 'error', message: 'Email already exists!' });
            } else {
                let token = await MongoDBConnector.saveUser(email, password, name);
                res.statusCode = 201;
                res.json({
                    code: 201,
                    status: 'success',
                    token
                })
            }
        } catch (e) {
            next(e);
        }
    }
});

router.post('/login', async (req, res, next) => {
    let { email, password } = req.body;
    try {
        let user = await MongoDBConnector.loginUser(email, password);
        if( !user ){
            res.status(400).json({ code:400, status: 'error', message: 'Wrong combination of email and password!' });
        } else {
            res.statusCode = 200;
            res.json({
                code: 200,
                status : 'success',
                token : user.token
            })
        }
    } catch (e) {
        next(e);
    }
});

router.post('/logout');

router.get(
    '/profile',
    async (req, res, next) => {
        let { authorization } = req.headers;
        if( !authorization ){
            res.status(401).json({ code:401, status: 'error', message: 'You are not authorize to get this data' });
        }
        try {
            let user = await MongoDBConnector.getUserByToken(authorization.replace('Bearer ', ''));
            if( !user ) {
                res.status(407).json({ code:407, status: 'error', message: 'Your token is wrong' });
            } else {
                res.statusCode = 200;
                res.json({
                    code: 200,
                    status: 'success',
                    email: user.email
                });
            }
        } catch (e) {
            next(e);
        }
    }
);

module.exports = router;

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});