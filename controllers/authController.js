const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config({ path: "./config.env" });
const { logMessage } = require("../utils/homeUtils");


exports.renderLogin = (req, res) => {
  logMessage("Executing renderLogin");
  return res.render("login", {error: ""});
};

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
    if (err.response.status === 400) return res.render('login', {error: `${err.response.data.errorMessages}`})
    if (err.response.status === 401) return res.render("login", {error: `${err.response.data.error}`});
    if (err.response.status === 404) return res.render("login", {error: `${err.response.data.error}`});
    else console.log(err);

  }
};

exports.processLogout = (req, res) => {
  logMessage(`Executing logout for user_id =  ${req.session.user.user_id}`);
  req.session.destroy();
  res.redirect("/");
};

exports.renderRegister = (req, res) => {
  logMessage("Executing renderRegister");
  res.render("register", {error: ""});
};

/**
 * Processes user registration by validating input, checking for existing users,
 * and inserting user details and account information into the database.
 *
 * @async
 * @function processRegister
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The body of the HTTP request.
 * @param {string} req.body.name - The user's name.
 * @param {string} req.body.user_email - The user's email address.
 * @param {string} req.body.password2 - The user's password.
 * @param {Object} res - The HTTP response object.
 *
 * @throws {Error} - If there is an issue querying the database or during transaction operations.
 */

exports.processRegister = async (req, res) => {

  logMessage("Executing processRegister.");
  const endpoint_processRegister = process.env.API_ENDPOINT + "/register";

  try {
    console.log("No errors <------")
    const result = await axios.post(endpoint_processRegister, req.body);
    
    if (result.status === 200) {
      logMessage("New user registered succesfully, redirect to /auth/login");
      return res.redirect("/auth/login");
    } else {
      logMessage("error");
      return res.send(result.data.message);
    }
  } catch (err) {
    if (err.response.status === 400) return res.render('register', ({error: err.response.data.errorMessages}))
    if (err.response.status === 409) return res.render('register',{error: `${err.response.data.error}`})
    console.log(`Error registering new user: ${err}`);
  }
};


