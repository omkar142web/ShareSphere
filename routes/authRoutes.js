import express from "express";
import {
  getHome,
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logoutUser,
} from "../controllers/authControllers.js";
import {
  getUserData,
} from "../controllers/rideControllers.js";

const router = express.Router();

router.route("/").get(getHome);
router.route("/login").get(getLogin).post(postLogin);
router.route("/register").get(getRegister).post(postRegister);
router.get("/logout", logoutUser);
router.get("/api/users/me", getUserData);

export default router;
