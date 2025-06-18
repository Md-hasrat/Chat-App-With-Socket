import { Router } from "express";
import { checkAuthStatus, getUsers, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { verifyAuthToken } from "../utils/verifyJwt.js";


const router = Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.put('/update-profile',verifyAuthToken,updateProfile)
router.get('/check',verifyAuthToken,checkAuthStatus);


router.get("/getAllUsers",getUsers)


export default router;
