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

const timestamp = format(new Date(), "HH:mm:ss"); 
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


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


/** 
app.use('/', (req, res, next) =>{
    console.log(`payload of this message: ${req.body.user_password}`);
    next();
});
*/

app.use('/auth', auth);
app.use('/', router);
startServer();


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
