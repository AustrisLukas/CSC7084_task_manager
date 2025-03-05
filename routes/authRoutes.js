const express = require('express');
const authRouter = express.Router();
const {renderLogin, renderRegister, processLogin, processLogout, processRegister} = require('./../controllers/authController');



authRouter.get('/register', renderRegister);
authRouter.get('/login', renderLogin);
authRouter.get('/logout', processLogout);


authRouter.post('/login', processLogin);
authRouter.post('/register', processRegister);


module.exports = authRouter;