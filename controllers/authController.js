const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config({ path: "./config.env" });
const { logMessage } = require("../utils/homeUtils");

exports.renderLogin = (req, res) => {
  logMessage("Executing renderLogin");
  return res.render("login");
};

exports.processLogin = async (req, res) => {
  logMessage("Executing processLogin");

  const endpoint_processLogin = process.env.API_ENDPOINT + `/login`;
  const response = await axios.post(endpoint_processLogin, req.body);
  const { token } = response.data;

  if (!token) {
    return res.status(500).json({ message: "Token missing from response" });
  }
  req.session.token = token;
  req.session.user = response.data.users[0];
  res.redirect("/");
};

exports.renderRegister = (req, res) => {
  logMessage("Executing renderRegister");
  res.render("register");
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
    const result = await axios.post(endpoint_processRegister, req.body);
    if (result.status === 200) {
      logMessage("New user registered succesfully, redirect to /auth/login");
      return res.redirect("/auth/login");
    } else {
      logMessage("error");
      return res.send(result.data.message);
    }
  } catch (err) {
    console.log(`Error registering new user: ${err}`);
  }
};
