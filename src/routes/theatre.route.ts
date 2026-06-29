import express from "express";
import TheatreController from "../controllers/theatre.controller.js";
import { authorizeRoles, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/theatres", TheatreController.getAllTheatres);
router.get("/theatre/:id", TheatreController.getSpecificTheatre);
router.post(
  "/theatre",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  TheatreController.createNewTheatre,
);
router.patch(
  "/theatre/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  TheatreController.updateSpecificTheatre,
);
router.delete(
  "/theatre/:id",
  protect,
  authorizeRoles("SYSTEM_ADMIN", "ROOT_ADMIN"),
  TheatreController.deleteSpecificTheatre,
);

export default router;
