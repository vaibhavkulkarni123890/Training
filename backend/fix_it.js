const mongoose = require('mongoose');
const URI = 'mongodb+srv://vaibhavkulkarni4144_db_user:12vaibhav@cybernova.mferke9.mongodb.net/tvp-it-solutions';

const UserSchema = new mongoose.Schema({
    selectedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectLockedAt: { type: Date }
});
const User = mongoose.model('User', UserSchema);

const ProjectSchema = new mongoose.Schema({});
const Project = mongoose.model('Project', ProjectSchema);

async function run() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');
        const users = await User.find({ selectedProject: { $exists: true, $ne: null } });
        console.log(`Checking ${users.length} users with selected projects...`);
        let fixed = 0;
        for (let user of users) {
             const exists = await Project.findById(user.selectedProject);
             if (!exists) {
                 console.log(`Fixing user ${user._id}: Project ID ${user.selectedProject} no longer exists. Clearing selection.`);
                 user.selectedProject = undefined;
                 user.projectLockedAt = undefined;
                 await user.save();
                 fixed++;
             }
        }
        console.log(`Successfully fixed ${fixed} users.`);
        process.exit(0);
    } catch (e) { 
        console.error('Error during repair:', e); 
        process.exit(1); 
    }
}
run();
