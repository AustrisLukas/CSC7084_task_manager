const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const router = require("./routes/userRoutes.js");
const session = require("express-session");
const auth = require(path.join(__dirname, '/routes/authRoutes.js'));
const { format } = require('date-fns');
const { logMessage } = require('./utils/homeUtils.js');
const axios = require("axios");



//const cookieParser = require("cookie-parser");
//const session = require("express-session");
//const authRouter = require("./routes/auth");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
//app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public')));

app.use(
    session({
        name: "SESSIONID",
        secret: "my-secret-key",
        resave: "false",
        saveUninitialized: false,
    })
);


// API security - attaching req.token with every axios call
app.use((req, res, next) => {
    if (req.session.token) {
      global.sessionToken = req.session.token; // Store session token globally
      global.sessionUser = req.session.user;
    }
    next();
  });

// Attach the token from req.session to every Axios request
axios.interceptors.request.use(
  (config) => {
    // Ensure token exists in session
    if (global.sessionToken) {
      config.headers.Authorization = `Bearer ${global.sessionToken}`;
      config.headers.user_id = global.sessionUser.user_id || " ";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


//Debugging 
/** 
app.use('/', (req, res, next) =>{
    console.log(`payload of this message: ${req.body.user_password}`);
    next();
});
*/

app.use('/auth', auth);
app.use('/', router);
startServer();



/**
 * Starts the server after testing the API connection.
 * 
 * This function first attempts to test the connection to the API by calling the `testAPI()` function. If the connection is 
 * successful, it then starts the server on the specified port. If the API connection fails, the server will not start, and 
 * an error message will be logged. The process will then exit with a non-zero status code to indicate failure.
 * 
 * @async
 * @function startServer
 * 
 * @returns {void} - Starts the server if the API connection is successful. If the connection fails, logs the error and exits the process.
 * 
 * @throws {Error} - If the API connection fails, the function logs an error and exits the process with a status code of 1.
 */
async function startServer(){
    try {
        const PORT = process.env.PORT || 3000;
        await testAPI();
        app.listen(PORT, () => {
            logMessage(`Listening on PORT ${process.env.PORT}`)
        });
    } catch (error){
        logMessage(`Failed to start application: ${error.message}`)
        process.exit(1);
    }
};



/**
 * Attempts to test the connection to a specified API endpoint with retry logic.
 * 
 * This function tries to make a GET request to the `/testAPI` endpoint up to 3 times in case of failure. If the request 
 * succeeds, it logs a success message and returns `true`. If all attempts fail, it throws an error indicating the failure.
 * 
 * The function follows these steps:
 * - It sends a GET request to the `testAPI` endpoint.
 * - If the request fails, it retries up to 3 times with a 2000ms delay between each attempt.
 * - If the maximum number of attempts is reached without success, an error is thrown.
 * 
 * @async
 * @function testAPI
 * 
 * @returns {boolean} - Returns `true` if the API connection is successful within the allowed attempts; throws an error if all attempts fail.
 * 
 * @throws {Error} - Throws an error if the API connection cannot be established after the maximum number of attempts.
 */
async function testAPI(){
    let attempt = 0;
    const maxAttempt = 3;
    const endpoint_testAPI = process.env.API_ENDPOINT + `/testAPI`;

    while (attempt <= maxAttempt) {
        try {
            const result = await axios.get(endpoint_testAPI);
            logMessage(`Test API successfull on ${process.env.API_ENDPOINT} `);
            return true;
        } catch (error) {
            attempt++;
            logMessage(`API endpoint unreachable after attempt ${attempt}`);  
        }
        if (attempt == maxAttempt) throw new Error('Failed to establish connection to API - conection attempts exceeded.');

        // 2000ms delay before attempting read again.
        await new Promise((resolve) => {setTimeout(resolve, 2000)});
    }
}
