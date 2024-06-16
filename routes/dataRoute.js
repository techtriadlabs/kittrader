
const express = require ('express');
const dataController = require ('../controllers/dataController');


const router = express.Router();

router.post('/create',dataController.create);
router.post('/history',dataController.history);

router.post('/update',dataController.update);




module.exports = router;