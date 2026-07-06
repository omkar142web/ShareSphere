import { ObjectId } from "mongodb";
import { getCollection } from "../config/mongodb.js";

export async function getAllRides() {
  const collection = getCollection("rides");
  return collection.find().sort({ _id: -1 }).toArray();
}

export async function findRideById(id) {
  const collection = getCollection("rides");
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createRide(rideData) {
  const collection = getCollection("rides");
  return collection.insertOne({
    ...rideData,
    createdAt: new Date(),
  });
}

export async function deleteRideById(id) {
  const collection = getCollection("rides");
  return collection.deleteOne({ _id: new ObjectId(id) });
}

export async function updateRide(id, updateData) {
  const collection = getCollection("rides");
  return collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

export async function getBookingsForRide(rideId) {
  const collection = getCollection("bookings");
  return collection.find({ rideId: new ObjectId(rideId) }).toArray();
}

export async function getBooking(rideId, passengerEmail) {
  const collection = getCollection("bookings");
  return collection.findOne({ rideId: new ObjectId(rideId), passengerEmail });
}

export async function createBooking(rideId, passengerEmail, passengerName) {
  const collection = getCollection("bookings");
  return collection.insertOne({
    rideId: new ObjectId(rideId),
    passengerEmail,
    passengerName,
    createdAt: new Date(),
  });
}

export async function deleteBooking(rideId, passengerEmail) {
  const collection = getCollection("bookings");
  return collection.deleteOne({ rideId: new ObjectId(rideId), passengerEmail });
}

export async function deleteAllBookingsForRide(rideId) {
  const collection = getCollection("bookings");
  return collection.deleteMany({ rideId: new ObjectId(rideId) });
}

export async function getRidesWithBookingsForUser(userEmail) {
  const rides = await getAllRides();
  const bookings = await getCollection("bookings").find().toArray();

  return rides.map((ride) => {
    const rideBookings = bookings.filter(
      (b) => b.rideId.toString() === ride._id.toString(),
    );
    return {
      ...ride,
      _id: ride._id.toString(),
      passengers: rideBookings.map((b) => ({
        email: b.passengerEmail,
        name: b.passengerName,
      })),
      hasJoined: rideBookings.some((b) => b.passengerEmail === userEmail),
    };
  });
}
