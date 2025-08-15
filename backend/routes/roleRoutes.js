// backend/routes/roleRoutes.js
const express = require("express");
const router = express.Router();

const roleController = require("../modules/role/controllers/roleController");

// Get all available roles
router.get("/", roleController.getAll);

module.exports = router;
