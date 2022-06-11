const Router = require('express').Router;
const index = require('./app.routes')
const router = Router();

//routes
router.use(index);

module.exports = router;