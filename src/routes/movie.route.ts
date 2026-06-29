import express from "express";
import movieController from "../controllers/movie.controller.js";
import { authorizeRoles, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/movies", movieController.getAllMovies);
router.get("/movies/search", movieController.searchMovies);
router.get("/movie/:id", movieController.getMovie);
router.post(
  "/movie",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.createNewMovie,
);
router.patch(
  "/movie/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.updateSpecificMovie,
);
router.delete(
  "/movie/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.deleteSpecificMovie,
);

export default router;
