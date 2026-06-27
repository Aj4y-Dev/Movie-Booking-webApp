import mongoose from "mongoose";
import Theatre from "../models/theatre.model.js";
import dotenv from "dotenv";
dotenv.config();

const seedTheatres = [
  {
    name: "QFX Cinemas Civil Mall",
    description:
      "A premium cinema experience in the heart of Kathmandu with state-of-the-art sound and projection systems.",
    city: "Kathmandu",
    postalCode: "44600",
    address: "Civil Mall, Sundhara",
  },
  {
    name: "QFX Cinemas Labim Mall",
    description:
      "Modern multiplex cinema located in Lalitpur with comfortable seating and latest movies.",
    city: "Lalitpur",
    postalCode: "44700",
    address: "Labim Mall, Pulchowk",
  },
  {
    name: "Big Movies Bhatbhateni",
    description:
      "Popular cinema chain inside Bhatbhateni Superstore offering the latest Nepali and international films.",
    city: "Kathmandu",
    postalCode: "44602",
    address: "Bhatbhateni Superstore, Naxal",
  },
  {
    name: "Gopi Krishna Movies",
    description:
      "One of the oldest and most iconic cinema halls in Kathmandu serving moviegoers for decades.",
    city: "Kathmandu",
    postalCode: "44601",
    address: "New Road, Kathmandu",
  },
  {
    name: "CG Cinemas",
    description:
      "Luxury cinema experience with recliner seats and premium food options.",
    city: "Kathmandu",
    postalCode: "44600",
    address: "CG Mall, Tinkune",
  },
  {
    name: "Pokhara Cinema Hall",
    description:
      "The premier cinema destination in Pokhara offering latest releases in a comfortable environment.",
    city: "Pokhara",
    postalCode: "33700",
    address: "Lakeside Road, Baidam",
  },
  {
    name: "Biratnagar Cinema",
    description:
      "Modern cinema hall serving the eastern region of Nepal with latest Nepali and Bollywood films.",
    city: "Biratnagar",
    postalCode: "56613",
    address: "Traffic Chowk, Biratnagar",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL!);
    console.log("Connected to MongoDB");

    await Theatre.deleteMany();
    console.log("Cleared existing theatres");

    await Theatre.insertMany(seedTheatres);
    console.log(`Seeded ${seedTheatres.length} theatres successfully`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
