const mongoose = require('mongoose');
const URI = 'mongodb+srv://vaibhavkulkarni4144_db_user:12vaibhav@cybernova.mferke9.mongodb.net/tvp-it-solutions';

const UserSchema = new mongoose.Schema({ 
    email: { type: String, required: true }, 
    role: { type: String, default: 'user' } 
});
const User = mongoose.model('User', UserSchema);

async function revert() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');
        
        // Restore vaibhav to user
        const res1 = await User.updateOne({ email: 'vaibhavkulkarni4144@gmail.com' }, { $set: { role: 'user' } });
        console.log('Restored vaibhav to user:', res1);
        
        // Restore demo2 to admin
        const res2 = await User.updateOne({ email: 'demo2@tvp.com' }, { $set: { role: 'admin' } });
        console.log('Restored demo2 to admin:', res2);
        
        console.log('Revert successful.');
        process.exit(0);
    } catch (e) {
        console.error('Error during revert:', e);
        process.exit(1);
    }
}
revert();
