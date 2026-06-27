import express from "express";
import TheatreController from "../controllers/theatre.controller.js";

const router = express.Router();

router.get("/theatres", TheatreController.getAllTheatres);
router.get("/theatre/:id", TheatreController.getSpecificTheatre);
router.post("/theatre", TheatreController.createNewTheatre);
router.patch("/theatre/:id", TheatreController.updateSpecificTheatre);
router.delete("/theatre/:id", TheatreController.deleteSpecificTheatre);

export default router;
