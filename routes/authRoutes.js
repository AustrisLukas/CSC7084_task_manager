const express = require('express');
const authRouter = express.Router();
const {renderLogin, renderRegister, processLogin, processRegister} = require('./../controllers/authController');


authRouter.get('/register', renderRegister);
authRouter.get('/login', renderLogin);


authRouter.post('/login', processLogin);
authRouter.post('/register',processRegister);


module.exports = authRouter;