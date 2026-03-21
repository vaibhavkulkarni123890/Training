const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const user = await User.findOne({ email: 'demo2@tvp.com' });
        if (!user) {
            console.log("User demo2@tvp.com not found!");
            process.exit(1);
        }
        
        user.password = '123456';
        await user.save();
        
        console.log("Success! Password reset.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
