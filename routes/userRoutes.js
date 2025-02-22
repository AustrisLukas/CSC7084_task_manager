const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();
const middleware = require('../middleware/auth')


router.get('/', middleware.authenticateToken, controller.renderHome);
router.get('/new',middleware.authenticateToken, controller.renderNewTask);
router.get('/logout', middleware.authenticateToken,controller.logout);
router.get('/delete/:id', middleware.authenticateToken, controller.deleteTask);
router.get('/complete/:id', middleware.authenticateToken, controller.completeTask);

router.post('/applyfilters',middleware.authenticateToken, controller.applyFilters);
router.post('/new',middleware.authenticateToken, controller.processNewTask);

router.post('/update', middleware.authenticateToken, controller.updateTask);



router.get('*', controller.renderError);






module.exports = router;