import express from "express";
import TheatreController from "../controllers/theatre.controller.js";
import { authorizeRoles, protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTheatreSchema,
  updateTheatreSchema,
} from "../validations/theatre.validation.js";

const router = express.Router();

/**
 * @swagger
 * /theatres:
 *   get:
 *     summary: Get all theatres
 *     tags: [Theatres]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all theatres
 */
router.get("/theatres", TheatreController.getAllTheatres);

/**
 * @swagger
 * /theatre/{id}:
 *   get:
 *     summary: Get specific theatre
 *     tags: [Theatres]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Theatre details
 */
router.get("/theatre/:id", TheatreController.getSpecificTheatre);

/**
 * @swagger
 * /theatre:
 *   post:
 *     summary: Create a new theatre (CLIENT only)
 *     tags: [Theatres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city, postalCode, address]
 *             properties:
 *               name:
 *                 type: string
 *                 example: QFX Civil Mall
 *               description:
 *                 type: string
 *                 example: Premium cinema in Kathmandu
 *               city:
 *                 type: string
 *                 example: Kathmandu
 *               postalCode:
 *                 type: string
 *                 example: "44600"
 *               address:
 *                 type: string
 *                 example: Civil Mall, Sundhara
 *     responses:
 *       201:
 *         description: Theatre created
 */
router.post(
  "/theatre",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  validate(createTheatreSchema),
  TheatreController.createNewTheatre,
);

/**
 * @swagger
 * /theatre/{id}:
 *   patch:
 *     summary: Update a specific theatre
 *     tags: [Theatres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Theatre updated
 */
router.patch(
  "/theatre/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  validate(updateTheatreSchema),
  TheatreController.updateSpecificTheatre,
);

/**
 * @swagger
 * /theatre/{id}:
 *   delete:
 *     summary: Delete a specific theatre
 *     tags: [Theatres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Theatre deleted
 */
router.delete(
  "/theatre/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  TheatreController.deleteSpecificTheatre,
);

export default router;
