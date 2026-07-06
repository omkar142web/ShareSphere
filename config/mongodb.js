import { MongoClient } from "mongodb";
import "dotenv/config";

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || "sharesphere";

if (!URI) {
  throw new Error("MONGO_URI is missing in .env");
}

let actuallDB;

async function createIndexes() {
  const usersCollection = actuallDB.collection("users");
  const ridesCollection = actuallDB.collection("rides");
  const bookingsCollection = actuallDB.collection("bookings");

  await Promise.all([
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    ridesCollection.createIndex({ driverEmail: 1 }),
    ridesCollection.createIndex({ availableSeats: -1 }),
    bookingsCollection.createIndex({ rideId: 1 }),
    bookingsCollection.createIndex({ passengerEmail: 1 }),
  ]);

  console.log("Database indexes are ready");
}

export async function connectDB() {
  try {
    if (actuallDB) return actuallDB;

    const client = new MongoClient(URI);
    console.log("Connecting to MongoDB...");

    await client.connect();
    actuallDB = client.db(DB_NAME);

    console.log(`MongoDB connected to database: ${DB_NAME}`);
    await createIndexes();

    return actuallDB;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

export function getCollection(collectionName) {
  if (!actuallDB) {
    throw new Error("Database not connected. Please call connectDB() first.");
  }
  return actuallDB.collection(collectionName);
}
