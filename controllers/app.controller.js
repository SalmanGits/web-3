const axios = require('axios');
const createUserToken = require("../helpers/generateToken");
const { sendResponse } = require('res-express');
const { Web3 } = require("web3");
const User = require("../models/user.model")
const bcrypt = require("bcrypt")
/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: mypassword
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login successful"
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "6412345678901234567890ab"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Email or Password is Wrong"
 *         success:
 *           type: boolean
 *           example: false
 */
//not implementing signup api for now
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse({ res, status: 401, data: { message: "You are not a user", success: false } });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return sendResponse({ res, status: 401, data: { message: "Email or Password is Wrong", success: false } });
        }
        const token = createUserToken(user._id)
        console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });
        sendResponse({
            res,
            status: 200,
            message: "Login successful",
            success: true,
            data: { token, user: { id: user._id, email: user.email } },
        });
    } catch (error) {
        next(error);
    }
}
/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     summary: Logout a user
 *     responses:
 *       '200':
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
 * components:
 *   schemas:
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Logout successful"
 *         success:
 *           type: boolean
 *           example: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Unauthorized"
 *         success:
 *           type: boolean
 *           example: false
 */
const logout = async (req, res, next) => {
    try {
        // we will clear the cookie and frontend will remove the token from local storage
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 0,
        });
        sendResponse({
            res,
            status: 200,
            data: {
                message: "Logout successful",
                success: true,
            }

        });
    } catch (error) {
        next(error);
    }
};


/**
 * @swagger
 * /api/v1/protected:
 *   get:
 *     summary: Access a protected route
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProtectedRouteResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ProtectedRouteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Protected Route"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Requires authentication"
 */

const protectedRoute = async (req, res, next) => {
    try {
        return res.status(200).json({ message: "Protected Route" })
    } catch (error) {
        next(error)
    }
}





/**
 * @swagger
 * /api/v1/public-apis:
 *   get:
 *     summary: Fetch public APIs
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter results by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicAPIsResponse'
 *       '500':
 *         description: Internal server error
 * components:
 *   schemas:
 *     PublicAPIsResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: The number of entries
 *         entries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PublicAPI'
 *     PublicAPI:
 *       type: object
 *       properties:
 *         API:
 *           type: string
 *           description: The name of the API
 *         Description:
 *           type: string
 *           description: A description of the API
 *         Auth:
 *           type: string
 *           description: The authentication method required for the API
 *         HTTPS:
 *           type: boolean
 *           description: Whether the API supports HTTPS
 *         Cors:
 *           type: string
 *           description: Whether the API supports CORS
 *         Link:
 *           type: string
 *           description: The URL of the API
 *         Category:
 *           type: string
 *           description: The category of the API
 */


const getPublicApis = async (req, res, next) => {
    try {
        const { category, limit } = req.query;
        //we can use env if it is a sensitive url
        const apiUrl = 'https://api.publicapis.org/entries';
        const response = await axios.get(apiUrl);
        const data = response.data;
        let filteredData = data.entries;
        //category filter
        if (category) {
            filteredData = filteredData.filter(entry => entry.Category.toLowerCase() === category.toLowerCase());
        }
        // Limit the number of results if provided
        if (limit) {
            filteredData = filteredData.slice(0, parseInt(limit));
        }
        return sendResponse({ res, status: 200, data: { count: filteredData.length, entries: filteredData } })
    } catch (error) {
        next(error)
    }

}
/**
 * @swagger
 * /eth-balance:
 *   post:
 *     summary: Get Ethereum balance of an address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EthBalanceRequest'
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EthBalanceResponse'
 *       '500':
 *         description: Internal server error
 * components:
 *   schemas:
 *     EthBalanceRequest:
 *       type: object
 *       required:
 *         - address
 *       properties:
 *         address:
 *           type: string
 *           description: Ethereum address to check the balance for
 *           example: '0x123456789abcdef....'
 *     EthBalanceResponse:
 *       type: object
 *       properties:
 *         balance:
 *           type: string
 *           description: Ethereum balance in Ether
 *           example: '1.234567'
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *           example: true
 */

const getEthBalance = async (req, res, next) => {
    try {
        const {address} = req.body
        const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.API_KEY}`))
        let balance = await web3.eth.getBalance(address);
        balance = web3.utils.fromWei(balance, "ether")
        return sendResponse({ res, status: 200, data: { balance: balance, success: true } })
    } catch (error) {
        next(error)
    }
}
module.exports = {
    getPublicApis,
    protectedRoute,
    login,
    logout,
    getEthBalance
}