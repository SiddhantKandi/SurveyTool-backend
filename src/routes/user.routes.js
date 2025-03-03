import { Router } from 'express';
import { registerUser, loginUser, logoutUser, sendOTP, verifyOTP, changeCurrentPassword,adminEmailOTP, verifyAdminEmailOTP } from '../controllers/User/user.controller.js';
import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(express.json())

//User register route
router.route("/register").post(registerUser);


//Login route
router.route("/login").post(loginUser);

//Logout route
router.route("/logout").post(verifyJWT, requireAdmin, logoutUser)

router.route("/sendOTP").post(sendOTP)

router.route("/adminEmailOTP").post(adminEmailOTP)

router.route("/verifyAdminEmailOTP").post(verifyAdminEmailOTP)

router.route("/verifyOTP").post(verifyOTP)

router.put('/updatePassword', verifyJWT, requireAdmin, changeCurrentPassword)


//verify admin route
router.route("/admin").get(verifyJWT, requireAdmin, (req, res) => {
    res.json({ message: "Welcome Admin!" });
})

export default router;
