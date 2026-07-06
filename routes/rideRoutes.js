import express from "express";
import {
  getDashboard,
  getPostRide,
  postRide,
  joinRide,
  leaveRide,
  deleteRide,
} from "../controllers/rideControllers.js";

const router = express.Router();

router.get("/dashboard", getDashboard);
router.route("/post-ride").get(getPostRide).post(postRide);
router.post("/rides/:id/join", joinRide);
router.delete("/rides/:id/join", leaveRide);
router.delete("/rides/:id", deleteRide);

export default router;
