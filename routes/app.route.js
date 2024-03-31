const express = require('express');
const router = express.Router()
const { getPublicApis, protectedRoute, login, logout, getEthBalance } = require('../controllers/app.controller.js');
const verifyToken = require('../auth/auth.js');
router.post("/login", login)
router.post("/logout", logout)
router.get("/protected", verifyToken, protectedRoute)
router.get("/public-apis", getPublicApis)
router.post("/eth-balance",getEthBalance)

module.exports = router