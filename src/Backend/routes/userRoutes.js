const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  deleteUser,
  promoteToAdmin,   // ✅ NEW
  demoteToUser      // ✅ NEW
} = require("../controllers/userController");

// Routes
router.get("/", getAllUsers);
router.put("/approve/:uid", approveUser);
router.put("/promote/:uid", promoteToAdmin);   // ✅ NEW
router.put("/demote/:uid", demoteToUser);      // ✅ NEW
router.delete("/:uid", deleteUser);

module.exports = router;
