const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const { generateOfferLetter, generateCertificate } = require('./services/documentService');

const testProductionDocuments = async () => {
    try {
        console.log('🔗 Connecting to production database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a test user or create one
        let testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                planType: 'Foundation',
                paymentStatus: 'paid'
            });
            await testUser.save();
            console.log('✅ Created test user');
        } else {
            console.log('✅ Found existing test user');
        }

        // Get a sample project
        const project = await Project.findOne({ category: 'Web Development' });
        if (!project) {
            console.log('❌ No projects found');
            return;
        }
        console.log('✅ Found test project:', project.title);

        // Test offer letter generation
        console.log('📄 Generating offer letter...');
        const offerLetterPath = await generateOfferLetter(testUser, project);
        console.log('✅ Offer letter generated:', offerLetterPath);

        // Test certificate generation
        console.log('🏆 Generating certificate...');
        const certificatePath = await generateCertificate(testUser, project);
        console.log('✅ Certificate generated:', certificatePath);

        // Update user with document paths
        testUser.offerLetterUrl = offerLetterPath;
        testUser.certificateUrl = certificatePath;
        testUser.courseCompleted = true;
        await testUser.save();
        console.log('✅ User updated with document URLs');

        // Test file existence
        const fs = require('fs');
        const path = require('path');
        
        const offerFilePath = path.join(__dirname, 'documents', offerLetterPath.replace('/documents/', ''));
        const certFilePath = path.join(__dirname, 'documents', certificatePath.replace('/documents/', ''));
        
        console.log('📁 Checking file existence...');
        console.log('Offer letter exists:', fs.existsSync(offerFilePath));
        console.log('Certificate exists:', fs.existsSync(certFilePath));
        
        if (fs.existsSync(offerFilePath)) {
            console.log('Offer letter size:', fs.statSync(offerFilePath).size, 'bytes');
        }
        if (fs.existsSync(certFilePath)) {
            console.log('Certificate size:', fs.statSync(certFilePath).size, 'bytes');
        }

        console.log('🎉 Document generation test completed successfully!');
        console.log('📋 Test Results:');
        console.log('  - User ID:', testUser._id);
        console.log('  - Offer Letter URL:', offerLetterPath);
        console.log('  - Certificate URL:', certificatePath);
        console.log('  - Production URLs:');
        console.log('    - https://training-ct72.onrender.com' + offerLetterPath);
        console.log('    - https://training-ct72.onrender.com' + certificatePath);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

testProductionDocuments();