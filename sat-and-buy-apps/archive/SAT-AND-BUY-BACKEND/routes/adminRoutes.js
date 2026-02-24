const express = require("express");
const router = express.Router();
const {
  addStaff,
  getAllStaff,
  getStaffById,
  getDriverAvailability,
  updateStaff,
  deleteStaff,
  updatedStatus,
} = require("../controller/adminController");

//add a staff
router.post("/add", addStaff);

//get all staff
router.get("/", getAllStaff);

// driver availability
router.get("/:id/availability", getDriverAvailability);

//get a staff
router.get("/:id", getStaffById);
router.post("/:id", getStaffById);

//update a staff
router.put("/:id", updateStaff);

//update staf status
router.put("/update-status/:id", updatedStatus);

//delete a staff
router.delete("/:id", deleteStaff);

module.exports = router;
