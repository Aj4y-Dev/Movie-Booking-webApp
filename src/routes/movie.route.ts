import express from "express";
import movieController from "../controllers/movie.controller.js";
import { authorizeRoles, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all movies
 */
router.get("/movies", movieController.getAllMovies);

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Search movies by query params
 *     tags: [Movies]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         example: Inception
 *       - in: query
 *         name: director
 *         schema:
 *           type: string
 *         example: Nolan
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         example: English
 *       - in: query
 *         name: releaseStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, UPCOMING, RELEASED]
 *     responses:
 *       200:
 *         description: Matching movies
 */
router.get("/movies/search", movieController.searchMovies);

/**
 * @swagger
 * /movie/{id}:
 *   get:
 *     summary: Get specific movie by id
 *     tags: [Movies]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 *       404:
 *         description: Movie not found
 */
router.get("/movie/:id", movieController.getMovie);

/**
 * @swagger
 * /movie:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, casts, trailerUrl, language, releaseDate, director]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: A thief who steals corporate secrets through dream sharing technology
 *               casts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
 *               trailerUrl:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=YoHD9XEInc0
 *               language:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English"]
 *               releaseDate:
 *                 type: string
 *                 example: 2010-07-16
 *               director:
 *                 type: string
 *                 example: Christopher Nolan
 *               releaseStatus:
 *                 type: string
 *                 enum: [PENDING, UPCOMING, RELEASED]
 *                 example: RELEASED
 *     responses:
 *       201:
 *         description: Movie created successfully
 */
router.post(
  "/movie",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.createNewMovie,
);

/**
 * @swagger
 * /movie/{id}:
 *   patch:
 *     summary: Update a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               releaseStatus:
 *                 type: string
 *                 enum: [PENDING, UPCOMING, RELEASED]
 *     responses:
 *       200:
 *         description: Movie updated
 *       404:
 *         description: Movie not found
 */
router.patch(
  "/movie/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.updateSpecificMovie,
);

/**
 * @swagger
 * /movie/{id}:
 *   delete:
 *     summary: Delete a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted
 *       404:
 *         description: Movie not found
 */
router.delete(
  "/movie/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  movieController.deleteSpecificMovie,
);

export default router;
