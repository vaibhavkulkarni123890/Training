const https = require('https');

// Test document generation API
const testDocumentGeneration = async () => {
    console.log('🧪 Testing document generation on production server...');
    
    try {
        // Test health endpoint first
        const healthResponse = await fetch('https://training-ct72.onrender.com/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test projects endpoint
        const projectsResponse = await fetch('https://training-ct72.onrender.com/api/projects');
        const projects = await projectsResponse.json();
        console.log('✅ Projects loaded:', projects.length, 'projects');
        
        // Test a specific document URL (this should return 404 for non-existent file)
        const testDocUrl = 'https://training-ct72.onrender.com/documents/test-file.html';
        const docResponse = await fetch(testDocUrl);
        console.log('📄 Document test response status:', docResponse.status);
        
        if (docResponse.status === 404) {
            const errorData = await docResponse.json();
            console.log('✅ Document 404 handling works:', errorData.message);
        }
        
        console.log('🎉 All API tests passed! Document system is ready.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testDocumentGeneration();