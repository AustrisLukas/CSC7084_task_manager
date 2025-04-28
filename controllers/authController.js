const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config({ path: "./config.env" });
const { logMessage } = require("../utils/homeUtils");


/**
 * Renders the login page for the user.
 * 
 * This function renders the "login" view, providing an empty error message to the template. 
 * It's used to display the login form when the user is not authenticated or is redirected to log in.
 */
exports.renderLogin = (req, res) => {
  logMessage("Executing renderLogin");
  return res.render("login", {error: ""});
};

/**
 * Processes the user's login by sending credentials to the backend and managing session data.
 * 
 * This function performs the following actions:
 * - Sends a POST request with the user's login credentials to the backend `/login` endpoint.
 * - If the login is successful, it stores the received token and user data in the session.
 * - If the login fails, it handles different error statuses (400, 401, 404) and displays an appropriate error message on the login page.
 */
exports.processLogin = async (req, res) => {

  logMessage("Executing processLogin");
  const endpoint_processLogin = process.env.API_ENDPOINT + `/login`;
  try {
    const response = await axios.post(endpoint_processLogin, req.body);
    const { token } = response.data;
    if (!token) {
      return res.status(500).json({ message: "Token missing from response" });
    }
    req.session.token = token;
    req.session.user = response.data.users[0];
    res.redirect("/");
  } catch (err) {
    console.log(err);
    if (err.response.status === 400) return res.render('login', {error: `${err.response.data.errorMessages}`})
    if (err.response.status === 401) return res.render("login", {error: `${err.response.data.error}`});
    if (err.response.status === 404) return res.render("login", {error: `${err.response.data.error}`});
    else console.log(err);
  }
};

/**
 * Logs the user out by destroying the session and redirecting to the home page.
 * 
 * This function performs the following actions:
 * - Logs the user out by destroying the session data (removes user and token).
 * - Redirects the user to the home page after logout.
 */
exports.processLogout = (req, res) => {
  logMessage(`Executing logout for user_id =  ${req.session.user.user_id}`);
  req.session.destroy();
  res.redirect("/");
};

/**
 * Renders the registration page for the user.
 * 
 * This function renders the "register" view, providing an empty error message to the template. 
 * It's typically used to display the registration form for new users.
 */
exports.renderRegister = (req, res) => {
  logMessage("Executing renderRegister");
  res.render("register", {error: ""});
};

/**
 * Processes user registration by validating input, checking for existing users,
 * and inserting user details and account information into the database.
 */
exports.processRegister = async (req, res) => {

  logMessage("Executing processRegister.");
  const endpoint_processRegister = process.env.API_ENDPOINT + "/register";

  try {
    const result = await axios.post(endpoint_processRegister, req.body);
    
    if (result.status === 200) {
      logMessage("New user registered succesfully, redirect to /auth/login");
      return res.redirect("/auth/login");
    } else {
      logMessage("error");
      return res.render('register',({error: result.data.message}));
      //return res.send(result.data.message);
    }
  } catch (err) {
    //400 - validation errors from back end.
    if (err.response.status === 400) return res.render('register', ({error: err.response.data.errorMessages}));
    // 409 - user already registered. 
    if (err.response.status === 409) return res.render('register',{error: `${err.response.data.error}`})
    console.log(`Error registering new user: ${err}`);
  }
};


