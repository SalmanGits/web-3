const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "api",
        version: "1.0.0",
        description: "api",
    },
};

const options = {
    swaggerDefinition,
    apis: ["./controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;