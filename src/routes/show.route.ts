import express from "express";
import showController from "../controllers/show.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// public routes
router.get("/shows", showController.getAllShows);
router.get("/shows/movie/:movieId", showController.getShowByMovie);
router.get("/shows/theatre/:theatreId", showController.getShowByTheatre);
router.get("/show/:id", showController.getShow);

// protected routes
router.get(
  "/shows/my-shows",
  protect,
  authorizeRoles("CLIENT", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.getMyShows,
);
router.post(
  "/show",
  protect,
  authorizeRoles("CLIENT", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.createShow,
);
router.patch(
  "/show/:id",
  protect,
  authorizeRoles("CLIENT", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.updateShow,
);
router.patch(
  "/show/:id/cancel",
  protect,
  authorizeRoles("CLIENT", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.cancelShow,
);
router.delete(
  "/show/:id",
  protect,
  authorizeRoles("CLIENT", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.deleteShow,
);

export default router;
