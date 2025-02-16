//const express = require('express');
//const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const {logMessage} = require('../utils/homeUtils');

function authenticateToken(req,res,next){

    const token = req.session.token
    
    if (!token){
        logMessage('Token not found, redirecting to /auth/login.');
        return res.redirect('/auth/login');
    } 

    jwt.verify(token, process.env.JWT_KEY, (err, user) =>{
        if (err) {
            logMessage('Invalid token, redirecting to /auth/login.');
            return res.redirect('/auth/login');
        }
        req.user = user;
        logMessage('Middleware authentication successful.');
        next();
    });
}

module.exports = {authenticateToken};


