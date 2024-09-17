import express from 'express';
import auth from '../middlewares/auth.js';
import errorHandler from '../services/catchAsync.js';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

//Routes Here
router.route("/dashboard")
.get(auth.adminOnly, errorHandler(dashboardController.getDashboardStats));

router.route("/dashboard/pie")
.get(auth.adminOnly, errorHandler(dashboardController.getPieCharts));

router.route("/dashboard/bar")
.get(auth.adminOnly, errorHandler(dashboardController.getBarGraphs));

router.route("/dashboard/line")
.get(auth.adminOnly, errorHandler(dashboardController.getLineCharts));

//Routes End

export default router;