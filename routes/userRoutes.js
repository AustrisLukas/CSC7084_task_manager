const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();
const middleware = require('../middleware/auth')


router.get('/', middleware.authenticateToken, controller.renderHome);
router.get('/new',middleware.authenticateToken, controller.renderNewTask);

router.post('/applyfilters',middleware.authenticateToken, controller.applyFilters);

router.get('*', controller.renderError);




module.exports = router;