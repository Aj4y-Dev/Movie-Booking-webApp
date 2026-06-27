import express from "express";
import movieController from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/movies", movieController.getAllMovies);
router.get("/movie/:id", movieController.getMovie);
router.post("/movie", movieController.createNewMovie);
router.put("/movie/:id", movieController.updateSpecificMovie);
router.delete("/movie/:id", movieController.deleteSpecifcMovie);

export default router;
