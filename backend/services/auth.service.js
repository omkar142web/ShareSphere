import { getCollection } from "../config/mongodb.js";

export async function findUserByEmail(email) {
  const collection = getCollection("users");
  return collection.findOne({ email });
}

export async function createUser(userData) {
  const collection = getCollection("users");
  return collection.insertOne(userData);
}

export async function updateUser(email, updateData) {
  const collection = getCollection("users");
  return collection.updateOne({ email }, { $set: updateData });
}

export async function getAllUsers() {
  const collection = getCollection("users");
  return collection.find().sort({ _id: -1 }).toArray();
}
