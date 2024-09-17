import express from 'express'
import userController from '../controllers/userController.js'

import auth from '../middlewares/auth.js'
import errorHandler from '../services/catchAsync.js'

const router = express.Router()

router.route("/")
.post(errorHandler(userController.createNewUser))
.get(auth.adminOnly, errorHandler(userController.fetchAllUser));

router.route("/:id")
.get(errorHandler(userController.fetchUserById))
.delete(auth.adminOnly, errorHandler(userController.deleteUser));

export default router