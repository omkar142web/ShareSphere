import { ObjectId } from "mongodb";
import { findUserByEmail, updateUser } from "../services/auth.service.js";
import {
  getAllRides,
  findRideById,
  createRide,
  deleteRideById,
  updateRide,
  getBooking,
  createBooking,
  deleteBooking,
  deleteAllBookingsForRide,
  getBookingsForRide,
} from "../services/ride.service.js";

function clearUserCookies(res) {
  ["name", "email", "password"].forEach((cookie) => {
    res.clearCookie(cookie);
  });
}

async function authenticateUser(req, res) {
  if (!req.cookies.email || !req.cookies.password) return null;
  const user = await findUserByEmail(req.cookies.email);
  if (!user || user.password !== req.cookies.password) {
    clearUserCookies(res);
    return null;
  }
  return user;
}

export const getDashboard = async (req, res, next) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return res.redirect("/login");

    const rides = await getAllRides();
    const enriched = [];

    for (const ride of rides) {
      const bookings = await getBookingsForRide(ride._id.toString());
      const passengers = bookings.map((b) => ({
        email: b.passengerEmail,
        name: b.passengerName,
      }));
      const hasJoined = bookings.some(
        (b) => b.passengerEmail === user.email,
      );

      enriched.push({
        _id: ride._id.toString(),
        driverEmail: ride.driverEmail,
        driverName: ride.driverName,
        origin: ride.origin,
        destination: ride.destination,
        time: ride.time,
        totalSeats: ride.totalSeats,
        availableSeats: ride.availableSeats,
        createdAt: ride.createdAt,
        passengers,
        hasJoined,
      });
    }

    return res.render("dashboard", {
      user,
      rides: enriched,
      message: null,
    });
  } catch (err) {
    console.error("Dashboard error ❌", err);
    return next(err);
  }
};

export const getPostRide = async (req, res, next) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return res.redirect("/login");

    return res.render("post-ride", { user, error: null });
  } catch (err) {
    return next(err);
  }
};

export const postRide = async (req, res, next) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return res.redirect("/login");

    const { origin, destination, time, totalSeats } = req.body;
    if (!origin || !destination || !time || !totalSeats) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    const seats = parseInt(totalSeats, 10);
    if (seats < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Must have at least 1 seat." });
    }

    await createRide({
      driverEmail: user.email,
      driverName: user.name,
      origin,
      destination,
      time,
      totalSeats: seats,
      availableSeats: seats,
    });

    await updateUser(user.email, {
      eco_score: (user.eco_score || 0) + 10,
    });

    return res.json({ success: true, redirect: "/dashboard" });
  } catch (err) {
    console.error("Post ride error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not create ride." });
  }
};

export const joinRide = async (req, res) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first." });
    }

    const rideId = req.params.id;
    if (!ObjectId.isValid(rideId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ride ID." });
    }

    const ride = await findRideById(rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }

    if (ride.driverEmail === user.email) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot join your own ride." });
    }

    const existingBooking = await getBooking(rideId, user.email);
    if (existingBooking) {
      return res
        .status(400)
        .json({ success: false, message: "You already joined this ride." });
    }

    if (ride.availableSeats < 1) {
      return res
        .status(400)
        .json({ success: false, message: "No seats available." });
    }

    await createBooking(rideId, user.email, user.name);
    await updateRide(rideId, { availableSeats: ride.availableSeats - 1 });
    await updateUser(user.email, {
      eco_score: (user.eco_score || 0) + 25,
    });

    return res.json({ success: true, message: "Joined ride!" });
  } catch (err) {
    console.error("Join ride error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not join ride." });
  }
};

export const leaveRide = async (req, res) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first." });
    }

    const rideId = req.params.id;
    if (!ObjectId.isValid(rideId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ride ID." });
    }

    const ride = await findRideById(rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }

    const existingBooking = await getBooking(rideId, user.email);
    if (!existingBooking) {
      return res
        .status(400)
        .json({ success: false, message: "You haven't joined this ride." });
    }

    await deleteBooking(rideId, user.email);
    await updateRide(rideId, { availableSeats: ride.availableSeats + 1 });
    await updateUser(user.email, {
      eco_score: Math.max(0, (user.eco_score || 0) - 25),
    });

    return res.json({ success: true, message: "Left the ride." });
  } catch (err) {
    console.error("Leave ride error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not leave ride." });
  }
};

export const deleteRide = async (req, res) => {
  try {
    const user = await authenticateUser(req, res);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first." });
    }

    const rideId = req.params.id;
    if (!ObjectId.isValid(rideId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ride ID." });
    }

    const ride = await findRideById(rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }

    if (ride.driverEmail !== user.email) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only the driver can delete this ride.",
        });
    }

    await deleteAllBookingsForRide(rideId);
    await deleteRideById(rideId);

    return res.json({ success: true, message: "Ride deleted." });
  } catch (err) {
    console.error("Delete ride error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not delete ride." });
  }
};

export const getUserData = async (req, res) => {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized" });
  }
  return res.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      eco_score: user.eco_score || 0,
    },
  });
};
