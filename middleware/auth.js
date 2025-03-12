//const express = require('express');
//const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const {logMessage} = require('../utils/homeUtils');


/**
 * Middleware function to authenticate a user's session token.
 * 
 * This function checks if a valid token exists in the user's session and verifies its validity.
 * - If the token is missing, it redirects the user to the login page.
 * - If the token is invalid, it redirects the user to the login page.
 * - If the token is valid, it attaches the user object to the request and proceeds to the next middleware or route handler.
 * 
 * @function authenticateToken
 * @param {Object} req - The request object, which contains the user's session data.
 * @param {Object} res - The response object used to redirect the user if authentication fails.
 * @param {Function} next - The next middleware function to be called if authentication is successful.
 * 
 * @returns {void} - Either redirects the user to the login page or calls `next()` to proceed with the request.
 */
function authenticateToken(req,res,next){

    const token = req.session.token
    //Check if available
    if (!token){
        logMessage('Token not found, redirecting to /auth/login.');
        return res.redirect('/auth/login');
    } 
    //Verify if valid
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


