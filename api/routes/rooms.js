import express from "express";
import { 
    deleteRoom, 
    getRoom, 
    getRooms, 
    updatedRoom, 
    createRoom, 
    updatedRoomAvailability 
} from "../controllers/room.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Create a new room associated with a hotel
router.post("/:hotelid", verifyAdmin, createRoom);

// Update room details
router.put("/:id", verifyAdmin, updatedRoom);

// Update room availability
router.put("/availability/:id", updatedRoomAvailability);  // Endpoint for updating room availability

// Delete a room and remove it from the hotel's reference
router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);

// Get a specific room by ID
router.get("/:id", getRoom);

// Get all rooms
router.get("/", getRooms);

export default router;
