const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.model');
const { connectToDb } = require('./db/connection');
require("dotenv").config()

const seedUsers = async () => {
    try {
        connectToDb()
   
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('Users already exist, skipping seed');
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('dummy', saltRounds);

        const dummyUser = new User({
            name: 'Dummy User',
            email: 'dummy@gmail.com',
            password: hashedPassword,
        });
        await dummyUser.save();

        console.log('Dummy user created successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding users:', error);
    }
};

seedUsers();