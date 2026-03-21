const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Project = require('./models/Project');
const { generateCertificate, generateOfferLetter } = require('./services/documentService');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const user = await User.findOne({ email: 'demo2@tvp.com' });
        if (!user) {
            console.log("User demo2@tvp.com not found!");
            process.exit(1);
        }
        
        const project = await Project.findById(user.selectedProject);
        if (!project) {
            console.log("Project not found!");
            process.exit(1);
        }
        
        console.log(`Generating certificate for ${user.name} - ${project.title}...`);
        
        // Generate both documents
        const certPath = await generateCertificate(user, project);
        const offerPath = await generateOfferLetter(user, project);
        
        // Update user
        user.courseCompleted = true;
        user.certificateUrl = certPath;
        user.offerLetterUrl = offerPath;
        await user.save();
        
        console.log("Success! Certificate generated at: " + certPath);
        console.log("Offer Letter updated at: " + offerPath);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
