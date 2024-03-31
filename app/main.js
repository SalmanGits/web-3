const express = require('express');
const cors = require('cors');
const errorHandler = require('../middleware/errorHandler.js');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const router = require('../routes/app.route.js');


class App {
    constructor() {
        //configuring our app and middlewares
        this.app = express()
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))

    }
    registerRoutes() {

        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
        this.app.use("/", router)

        //error handler middleware
        this.app.use(errorHandler)
    }

    init() {
        this.registerRoutes()
        return express().use("/api/v1", this.app)
    }


}

module.exports = App