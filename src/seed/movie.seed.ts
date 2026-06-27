import mongoose from "mongoose";
import Movie from "../models/movie.model.js";
import dotenv from "dotenv";
dotenv.config();

const seedMovies = [
  {
    name: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces an environmental catastrophe.",
    casts: [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    language: ["English"],
    releaseDate: new Date("2014-11-07"),
    director: "Christopher Nolan",
    releaseStatus: "RELEASED",
  },
  {
    name: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    casts: [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Elliot Page",
      "Tom Hardy",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    language: ["English"],
    releaseDate: new Date("2010-07-16"),
    director: "Christopher Nolan",
    releaseStatus: "RELEASED",
  },
  {
    name: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    casts: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    language: ["English"],
    releaseDate: new Date("2008-07-18"),
    director: "Christopher Nolan",
    releaseStatus: "RELEASED",
  },
  {
    name: "Avengers: Endgame",
    description:
      "After the devastating events of Infinity War, the universe is in ruins. The Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    casts: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Mark Ruffalo",
      "Scarlett Johansson",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    language: ["English"],
    releaseDate: new Date("2019-04-26"),
    director: "Anthony Russo",
    releaseStatus: "RELEASED",
  },
  {
    name: "Parasite",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    casts: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
    language: ["Korean"],
    releaseDate: new Date("2019-05-30"),
    director: "Bong Joon-ho",
    releaseStatus: "RELEASED",
  },
  {
    name: "Dune: Part Two",
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    casts: [
      "Timothée Chalamet",
      "Zendaya",
      "Rebecca Ferguson",
      "Austin Butler",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    language: ["English"],
    releaseDate: new Date("2024-03-01"),
    director: "Denis Villeneuve",
    releaseStatus: "RELEASED",
  },
  {
    name: "Avatar: Fire and Ash",
    description:
      "Jake Sully and Neytiri face a new threat as the conflict on Pandora escalates with the arrival of a mysterious and dangerous new clan.",
    casts: [
      "Sam Worthington",
      "Zoe Saldana",
      "Sigourney Weaver",
      "Stephen Lang",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=placeholder",
    language: ["English"],
    releaseDate: new Date("2025-12-19"),
    director: "James Cameron",
    releaseStatus: "UPCOMING",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL!);
    console.log("Connected to MongoDB");

    await Movie.deleteMany();
    console.log("Cleared existing movies");

    await Movie.insertMany(seedMovies);
    console.log(`Seeded ${seedMovies.length} movies successfully`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
