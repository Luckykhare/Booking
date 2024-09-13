import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

// Create a new room and associate it with a hotel
export const createRoom = async (req, res, next) => {
    const hotelId = req.params.hotelid;
    const newRoom = new Room(req.body);

    try {
        const savedRoom = await newRoom.save();
        try {
            await Hotel.findByIdAndUpdate(hotelId, {
                $push: { rooms: savedRoom._id },
            });
            res.status(200).json(savedRoom);
        } catch (err) {
            await Room.findByIdAndDelete(savedRoom._id); // Rollback room creation if hotel update fails
            next(err);
        }
    } catch (err) {
        next(err);
    }
};

// Update room details
export const updatedRoom = async (req, res, next) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }  // Return the updated document
        );
        if (!updatedRoom) {
            return next(createError(404, "Room not found"));
        }
        res.status(200).json(updatedRoom);
    } catch (err) {
        next(err);
    }
};

// Function to check if a date is valid
const isValidDate = (date) => !isNaN(Date.parse(date));

// Update room availability (unavailable dates)
export const updatedRoomAvailability = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const { dates } = req.body;

        if (!dates || !Array.isArray(dates) || !dates.every(isValidDate)) {
            return res.status(400).json({ message: "Invalid dates format." });
        }

        // Update the room's availability by adding unavailable dates
        const result = await Room.updateOne(
            { "roomNumbers._id": roomId },
            {
                $push: {
                    "roomNumbers.$.unavailableDates": { $each: dates }
                }
            }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ message: "Room not found or no updates made." });
        }

        res.status(200).json({ message: "Room availability has been updated." });
    } catch (err) {
        console.error("Error updating room availability:", err);
        next(err);
    }
};

// Delete a room and remove its reference from the hotel
export const deleteRoom = async (req, res, next) => {
    const hotelId = req.params.hotelid;
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return next(createError(404, "Room not found"));
        }

        try {
            await Hotel.findByIdAndUpdate(hotelId, {
                $pull: { rooms: req.params.id },
            });
            res.status(200).json("Room has been deleted.");
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    }
};

// Get a specific room by ID
export const getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return next(createError(404, "Room not found"));
        }
        res.status(200).json(room);
    } catch (err) {
        next(err);
    }
};

// Get all rooms
export const getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        next(err);
    }
};
