import { Router } from "express";
import { verifyAuthToken } from "../utils/verifyJwt.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/users",verifyAuthToken,getUsersForSidebar);
router.get("/:id",verifyAuthToken,getMessages);
router.post("/send/:id",verifyAuthToken,sendMessage);

export default router;