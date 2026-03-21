const mongoose = require('mongoose');
const URI = 'mongodb+srv://vaibhavkulkarni4144_db_user:12vaibhav@cybernova.mferke9.mongodb.net/tvp-it-solutions';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

async function run() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');
        
        // 1. Find the target user who should be admin
        const targetUser = await User.findOne({ email: 'vaibhavkulkarni4144@gmail.com' });
        
        if (targetUser) {
            console.log('Target user found. Promoting to admin...');
            targetUser.role = 'admin';
            await targetUser.save();
            
            // 2. Demote any other admins to avoid confusion
            const otherAdmins = await User.find({ role: 'admin', _id: { $ne: targetUser._id } });
            for (const oldAdmin of otherAdmins) {
                console.log(`Demoting old admin: ${oldAdmin.email}`);
                oldAdmin.role = 'user';
                await oldAdmin.save();
            }
            console.log('Admin migration complete.');
        } else {
            // 3. If target user doesn't exist, rename current admin
            const currentAdmin = await User.findOne({ role: 'admin' });
            if (currentAdmin) {
                console.log(`Renaming current admin ${currentAdmin.email} to vaibhavkulkarni4144@gmail.com`);
                currentAdmin.email = 'vaibhavkulkarni4144@gmail.com';
                await currentAdmin.save();
                console.log('Admin renamed successfully.');
            } else {
                console.log('No user or admin found to update.');
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
