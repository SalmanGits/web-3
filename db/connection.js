const mongoose = require("mongoose");

const connectToDb = async (req, res) => {
    try {
        const connection = await mongoose.connect(process.env.URI, {
            // useNewUrlParser: true,
        });
        console.log("database connected");
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    connectToDb
}