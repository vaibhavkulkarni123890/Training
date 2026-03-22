const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Project = require('./models/Project');

const generateRoadmap = (category, estimatedWeeks) => {
    const phaseTemplates = {
        'Web Development': [
            { title: "Environment & UI Setup", description: "Initialize the React/Next.js project, install dependencies, and build the basic layout/navigation." },
            { title: "Database & API Design", description: "Design the MongoDB models and create Express REST API endpoints for data handling." },
            { title: "Authentication System", description: "Implement user registration, login, JWT authentication, and secure route protection." },
            { title: "Core Feature Development", description: "Build the main application features and business logic components." },
            { title: "State Management", description: "Implement Redux/Context API for global state management and data flow." },
            { title: "API Integration", description: "Connect frontend components with backend APIs and handle data operations." },
            { title: "User Interface Polish", description: "Enhance UI/UX design, add responsive layouts, and improve user interactions." },
            { title: "Advanced Features", description: "Implement advanced functionality like real-time updates, notifications, or third-party integrations." },
            { title: "Payment Integration", description: "Integrate payment gateways, handle transactions, and implement billing logic." },
            { title: "Admin Dashboard", description: "Build administrative interfaces for content management and system monitoring." },
            { title: "Performance Optimization", description: "Optimize application performance, implement caching, and reduce load times." },
            { title: "Security Hardening", description: "Implement security best practices, input validation, and vulnerability fixes." },
            { title: "Testing & Quality Assurance", description: "Write unit tests, integration tests, and perform comprehensive testing." },
            { title: "Deployment Preparation", description: "Configure production environment, set up CI/CD, and prepare deployment scripts." },
            { title: "Documentation & Handover", description: "Create technical documentation, user guides, and project handover materials." },
            { title: "Final Testing & Launch", description: "Perform final testing, bug fixes, and deploy the application to production." },
            { title: "Post-Launch Support", description: "Monitor application performance, handle user feedback, and implement minor improvements." },
            { title: "Feature Enhancements", description: "Add additional features based on user requirements and feedback." },
            { title: "Scalability Improvements", description: "Implement scalability solutions and performance monitoring systems." },
            { title: "Maintenance & Updates", description: "Regular maintenance, security updates, and feature refinements." }
        ],
        'Mobile Development': [
            { title: "UI Kit & Navigation", description: "Set up the React Native environment and design the mobile screens using UI libraries." },
            { title: "Local Storage & State", description: "Implement local data persistence (AsyncStorage/SQLite) and global state management." },
            { title: "User Authentication", description: "Build login/registration screens with biometric authentication and secure token storage." },
            { title: "Core App Features", description: "Develop the main application functionality and user interaction flows." },
            { title: "API Integration", description: "Connect the mobile app to backend services and handle real-time data synchronization." },
            { title: "Native Features", description: "Implement camera, GPS, push notifications, or other native device features." },
            { title: "Offline Functionality", description: "Add offline support, data caching, and sync mechanisms for poor connectivity." },
            { title: "Push Notifications", description: "Implement push notification system with Firebase/OneSignal integration." },
            { title: "Social Features", description: "Add social login, sharing capabilities, and user interaction features." },
            { title: "Media Handling", description: "Implement image/video upload, processing, and gallery functionality." },
            { title: "Performance Optimization", description: "Optimize app performance, reduce bundle size, and improve loading times." },
            { title: "Platform-Specific Features", description: "Implement iOS/Android specific features and platform optimizations." },
            { title: "Testing & Debugging", description: "Perform device testing, debug platform-specific issues, and optimize performance." },
            { title: "App Store Preparation", description: "Prepare app store listings, screenshots, and submission requirements." },
            { title: "Beta Testing", description: "Deploy beta versions, gather user feedback, and implement improvements." },
            { title: "Production Build", description: "Generate production builds, configure app signing, and prepare for release." },
            { title: "App Store Deployment", description: "Submit to app stores, handle review process, and manage release." },
            { title: "Post-Launch Monitoring", description: "Monitor app performance, crash reports, and user analytics." },
            { title: "User Feedback Integration", description: "Implement user feedback, add requested features, and fix reported issues." },
            { title: "Maintenance & Updates", description: "Regular updates, security patches, and feature enhancements." }
        ],
        'AI/ML': [
            { title: "Data Collection & Cleaning", description: "Gather the required datasets and perform exploratory data analysis (EDA) and preprocessing." },
            { title: "Data Exploration & Analysis", description: "Perform statistical analysis, identify patterns, and understand data characteristics." },
            { title: "Feature Engineering", description: "Create relevant features, handle missing values, and prepare data for modeling." },
            { title: "Model Selection & Architecture", description: "Choose appropriate ML/DL architectures and design the model structure." },
            { title: "Model Training & Validation", description: "Train the model using training/validation sets and implement cross-validation." },
            { title: "Hyperparameter Tuning", description: "Optimize model parameters using grid search, random search, or Bayesian optimization." },
            { title: "Model Evaluation & Testing", description: "Evaluate performance using metrics (Accuracy/F1) and test on unseen data." },
            { title: "Model Interpretation", description: "Implement model explainability techniques and analyze feature importance." },
            { title: "API Development", description: "Create a Flask/FastAPI wrapper to serve the model as a usable REST API." },
            { title: "Model Deployment", description: "Deploy the model to cloud platforms and set up serving infrastructure." },
            { title: "Frontend Dashboard", description: "Build a web interface to allow users to interact with the model and visualize results." },
            { title: "Monitoring & Logging", description: "Implement model monitoring, performance tracking, and prediction logging." },
            { title: "A/B Testing Setup", description: "Set up A/B testing framework to compare model versions and performance." },
            { title: "Model Optimization", description: "Optimize model inference speed, memory usage, and deployment efficiency." },
            { title: "Data Pipeline Automation", description: "Automate data preprocessing, feature engineering, and model retraining pipelines." },
            { title: "Production Testing", description: "Test model performance in production environment and handle edge cases." },
            { title: "Documentation & Reporting", description: "Create technical documentation, model cards, and performance reports." },
            { title: "Model Maintenance", description: "Monitor model drift, retrain when necessary, and maintain model performance." },
            { title: "Feature Enhancement", description: "Add new features, improve model accuracy, and expand functionality." },
            { title: "Scalability & Performance", description: "Scale model serving, optimize for high throughput, and improve response times." }
        ],
        'Cybersecurity': [
            { title: "Research & Scope Definition", description: "Define the security objective, research known vulnerabilities (OWASP), and set up the lab environment." },
            { title: "Threat Modeling", description: "Identify potential threats, attack vectors, and create comprehensive threat models." },
            { title: "Tool/Script Development", description: "Develop scripts for network scanning, packet analysis, or encryption using Python/Node." },
            { title: "Vulnerability Assessment", description: "Implement logic to detect attack patterns or perform automated security checks." },
            { title: "Security Testing Framework", description: "Build automated security testing tools and vulnerability scanning capabilities." },
            { title: "Penetration Testing", description: "Conduct controlled penetration testing and document security weaknesses." },
            { title: "Security Hardening", description: "Develop defensive mechanisms like rule engines, firewalls, or secure key management." },
            { title: "Incident Response System", description: "Create incident detection, response procedures, and automated alert systems." },
            { title: "Encryption Implementation", description: "Implement strong encryption protocols, key management, and secure communication." },
            { title: "Access Control Systems", description: "Build role-based access control, authentication, and authorization mechanisms." },
            { title: "Security Monitoring", description: "Implement continuous security monitoring, log analysis, and threat detection." },
            { title: "Compliance Framework", description: "Ensure compliance with security standards (ISO 27001, NIST, etc.)." },
            { title: "Security Audit Tools", description: "Develop automated security audit tools and compliance checking systems." },
            { title: "Forensics Capabilities", description: "Implement digital forensics tools for incident investigation and evidence collection." },
            { title: "Security Training Module", description: "Create security awareness training and phishing simulation systems." },
            { title: "Logging & Reporting", description: "Implement detailed security audit logs and generate professional vulnerability reports." },
            { title: "Security Dashboard", description: "Build comprehensive security dashboard with real-time threat visualization." },
            { title: "Integration Testing", description: "Test security integrations, validate defense mechanisms, and verify protection levels." },
            { title: "Documentation & Procedures", description: "Create security procedures, incident response playbooks, and technical documentation." },
            { title: "Maintenance & Updates", description: "Regular security updates, threat intelligence integration, and system maintenance." }
        ],
        'Data Engineering': [
            { title: "Source Identification & Analysis", description: "Identify data sources (APIs/Files/DBs) and analyze data structure and quality." },
            { title: "Architecture Design", description: "Design the data pipeline architecture, storage solutions, and processing frameworks." },
            { title: "Data Ingestion Pipeline", description: "Build automated scripts to ingest data from various sources into central storage." },
            { title: "Data Validation & Quality", description: "Implement data quality checks, validation rules, and error handling mechanisms." },
            { title: "Transformation Logic (ETL)", description: "Implement cleaning, normalization, and transformation logic using Python/SQL." },
            { title: "Data Storage Optimization", description: "Optimize data storage, implement partitioning, and design efficient schemas." },
            { title: "Real-time Processing", description: "Implement stream processing for real-time data ingestion and transformation." },
            { title: "Data Catalog & Lineage", description: "Build data catalog, track data lineage, and implement metadata management." },
            { title: "Quality Monitoring", description: "Implement automated data quality monitoring, anomaly detection, and alerting." },
            { title: "Performance Optimization", description: "Optimize pipeline performance, implement caching, and reduce processing time." },
            { title: "Scheduling & Orchestration", description: "Implement workflow scheduling, dependency management, and pipeline orchestration." },
            { title: "Error Handling & Recovery", description: "Build robust error handling, retry mechanisms, and data recovery procedures." },
            { title: "Security & Compliance", description: "Implement data security, encryption, access controls, and compliance measures." },
            { title: "Monitoring & Alerting", description: "Set up comprehensive monitoring, logging, and alerting for pipeline health." },
            { title: "Visualization & API", description: "Expose the processed data via REST APIs and build analytics dashboards." },
            { title: "Testing & Validation", description: "Implement data pipeline testing, validation frameworks, and quality assurance." },
            { title: "Documentation & Training", description: "Create technical documentation, user guides, and team training materials." },
            { title: "Scalability Implementation", description: "Implement auto-scaling, load balancing, and high-availability solutions." },
            { title: "Performance Tuning", description: "Fine-tune performance, optimize resource usage, and improve efficiency." },
            { title: "Maintenance & Support", description: "Ongoing maintenance, updates, and support for data pipeline operations." }
        ],
        'DevOps': [
            { title: "Infrastructure Analysis", description: "Analyze the application requirements and design the CI/CD or monitoring architecture." },
            { title: "Environment Setup", description: "Set up development, staging, and production environments with proper configurations." },
            { title: "Containerization & Config", description: "Create Dockerfiles and configure environment variables/secrets for the services." },
            { title: "Version Control & Branching", description: "Implement Git workflows, branching strategies, and code review processes." },
            { title: "CI/CD Pipeline Development", description: "Build automated CI/CD pipelines (GitHub Actions/Jenkins) for builds and deployments." },
            { title: "Testing Automation", description: "Implement automated testing pipelines, unit tests, integration tests, and quality gates." },
            { title: "Infrastructure as Code", description: "Implement IaC using Terraform/CloudFormation for reproducible infrastructure." },
            { title: "Monitoring & Alerting", description: "Implement health checks, resource monitoring (Prometheus), and alert triggers." },
            { title: "Logging & Observability", description: "Set up centralized logging, distributed tracing, and observability tools." },
            { title: "Security Integration", description: "Implement security scanning, vulnerability assessment, and compliance checks." },
            { title: "Database Management", description: "Automate database deployments, migrations, and backup/recovery procedures." },
            { title: "Load Balancing & Scaling", description: "Implement load balancers, auto-scaling policies, and high-availability solutions." },
            { title: "Performance Optimization", description: "Optimize application performance, implement caching, and resource optimization." },
            { title: "Disaster Recovery", description: "Implement backup strategies, disaster recovery plans, and business continuity." },
            { title: "Configuration Management", description: "Implement configuration management, secret management, and environment parity." },
            { title: "Scaling & Reliability", description: "Develop rollback strategies, auto-scaling logic, and performance dashboards." },
            { title: "Cost Optimization", description: "Implement cost monitoring, resource optimization, and budget management." },
            { title: "Documentation & Runbooks", description: "Create operational documentation, runbooks, and troubleshooting guides." },
            { title: "Team Training & Handover", description: "Train team members, create knowledge transfer, and establish operational procedures." },
            { title: "Continuous Improvement", description: "Implement feedback loops, performance metrics, and continuous improvement processes." }
        ]
    };

    const templates = phaseTemplates[category] || phaseTemplates['Web Development'];
    const phases = [];
    
    // Generate phases based on estimated weeks
    for (let i = 0; i < estimatedWeeks; i++) {
        const phaseNumber = i + 1;
        const templateIndex = i % templates.length;
        const template = templates[templateIndex];
        
        phases.push({
            step: `Phase ${phaseNumber}: ${template.title}`,
            description: template.description
        });
    }
    
    return phases;
};

const projects = [
    // ─── Web Development (12 projects) ───────────────────────────────
    { title: "E-Commerce Platform", description: "Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, checkout with payment gateway integration, order management, and admin dashboard.", techStack: ["React", "Node.js", "Express", "MongoDB", "Stripe/Razorpay"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 16, learningOutcomes: ["Full-stack architecture", "Payment integration", "State management", "Database design"], planRequired: "Foundation" },
    { title: "Real-Time Chat Application", description: "Develop a real-time messaging app with WebSocket support, user authentication, group chats, file sharing, message encryption, and online status indicators.", techStack: ["React", "Socket.io", "Node.js", "MongoDB", "Redis"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 14, learningOutcomes: ["WebSocket protocols", "Real-time data sync", "Encryption basics", "Scalable architecture"], planRequired: "Foundation" },
    { title: "Project Management Tool", description: "Create a Trello/Jira-like project management app with Kanban boards, task assignment, deadlines, team collaboration, time tracking, and reporting.", techStack: ["React", "Node.js", "PostgreSQL", "Socket.io", "Chart.js"], difficulty: "Expert", category: "Web Development", estimatedWeeks: 20, learningOutcomes: ["Complex state management", "Real-time collaboration", "Data visualization", "Role-based access"], planRequired: "Advanced" },
    { title: "Social Media Dashboard", description: "Build a social media analytics dashboard that aggregates data from multiple platforms, displays metrics, generates reports, and provides engagement insights.", techStack: ["React", "D3.js", "Node.js", "MongoDB", "REST APIs"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 16, learningOutcomes: ["API integration", "Data visualization", "Dashboard design", "OAuth flows"], planRequired: "Foundation" },
    { title: "Learning Management System (LMS)", description: "Develop a comprehensive LMS with course creation, video hosting, quizzes, progress tracking, student enrollment, certificates, and instructor dashboard.", techStack: ["React", "Node.js", "MongoDB", "AWS S3", "FFmpeg"], difficulty: "Expert", category: "Web Development", estimatedWeeks: 22, learningOutcomes: ["File upload/streaming", "Complex RBAC", "Progress tracking algorithms", "Certificate generation"], planRequired: "Advanced" },
    { title: "Job Portal Platform", description: "Create a job portal with employer and candidate profiles, job listings with filters, resume upload, application tracking, and email notifications.", techStack: ["React", "Node.js", "MongoDB", "Elasticsearch", "Nodemailer"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 16, learningOutcomes: ["Search engine integration", "File handling", "Email automation", "Multi-role system"], planRequired: "Foundation" },
    { title: "Blog Platform with CMS", description: "Build a Medium-like blog platform with rich text editor, categories, tags, comments, SEO optimization, analytics, and content management system.", techStack: ["Next.js", "Node.js", "MongoDB", "Cloudinary", "Draft.js"], difficulty: "Intermediate", category: "Web Development", estimatedWeeks: 12, learningOutcomes: ["SSR/SSG concepts", "Rich text editors", "SEO optimization", "Image optimization"], planRequired: "Foundation" },
    { title: "Healthcare Appointment System", description: "Develop a telemedicine platform for booking doctor appointments, video consultations, prescription management, patient records, and payment processing.", techStack: ["React", "Node.js", "MongoDB", "WebRTC", "Razorpay"], difficulty: "Expert", category: "Web Development", estimatedWeeks: 20, learningOutcomes: ["Video conferencing", "HIPAA considerations", "Scheduling algorithms", "Payment integration"], planRequired: "Advanced" },
    { title: "Restaurant Ordering System", description: "Create a food ordering platform with menu management, real-time order tracking, delivery assignment, customer reviews, and admin analytics.", techStack: ["React", "Node.js", "MongoDB", "Socket.io", "Google Maps API"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 16, learningOutcomes: ["Geolocation services", "Real-time tracking", "Order state machines", "Review systems"], planRequired: "Foundation" },
    { title: "Online Auction Platform", description: "Build a real-time auction system with bidding engine, countdown timers, user wallets, bid history, anti-sniping protection, and payment settlement.", techStack: ["React", "Node.js", "MongoDB", "Socket.io", "Razorpay"], difficulty: "Expert", category: "Web Development", estimatedWeeks: 18, learningOutcomes: ["Real-time bidding", "Concurrency handling", "Timer-based logic", "Transaction safety"], planRequired: "Advanced" },
    { title: "Event Management Platform", description: "Develop a platform for creating events, selling tickets, managing venues, attendee check-in with QR codes, and post-event analytics.", techStack: ["React", "Node.js", "MongoDB", "QRCode.js", "Chart.js"], difficulty: "Advanced", category: "Web Development", estimatedWeeks: 16, learningOutcomes: ["QR code generation", "Ticketing systems", "Analytics dashboards", "Venue management"], planRequired: "Foundation" },
    { title: "Multi-Vendor Marketplace", description: "Create a marketplace where multiple vendors can list products, manage inventory, process orders, handle disputes, and view sales analytics.", techStack: ["React", "Node.js", "MongoDB", "Razorpay", "Redis"], difficulty: "Expert", category: "Web Development", estimatedWeeks: 22, learningOutcomes: ["Multi-tenancy", "Commission systems", "Dispute resolution", "Inventory management"], planRequired: "Advanced" },

    // ─── Mobile Development (10 projects) ────────────────────────────
    { title: "Fitness Tracking App", description: "Build a fitness app with workout plans, exercise tracking, calorie counter, progress charts, social sharing, and push notifications.", techStack: ["React Native", "Node.js", "MongoDB", "Firebase", "Chart.js"], difficulty: "Advanced", category: "Mobile Development", estimatedWeeks: 16, learningOutcomes: ["Mobile UI/UX", "Push notifications", "Health data handling", "Charts in mobile"], planRequired: "Foundation" },
    { title: "Expense Tracker App", description: "Develop a personal finance app with expense logging, budget setting, category analysis, recurring transactions, export to CSV, and visual reports.", techStack: ["React Native", "SQLite", "Node.js", "Chart.js"], difficulty: "Intermediate", category: "Mobile Development", estimatedWeeks: 12, learningOutcomes: ["Local storage", "Financial calculations", "Data export", "Mobile charts"], planRequired: "Foundation" },
    { title: "Food Delivery App", description: "Create an Uber Eats-like food delivery app with restaurant listings, menu browsing, cart, real-time order tracking, and driver assignment.", techStack: ["React Native", "Node.js", "MongoDB", "Socket.io", "Google Maps"], difficulty: "Expert", category: "Mobile Development", estimatedWeeks: 20, learningOutcomes: ["GPS tracking", "Real-time updates", "Multi-role app", "Map integration"], planRequired: "Advanced" },
    { title: "Language Learning App", description: "Build an interactive language learning app with flashcards, quizzes, speech recognition, progress tracking, leaderboards, and daily streaks.", techStack: ["React Native", "Node.js", "MongoDB", "Speech API", "Firebase"], difficulty: "Advanced", category: "Mobile Development", estimatedWeeks: 16, learningOutcomes: ["Speech recognition", "Gamification", "Streak algorithms", "Spaced repetition"], planRequired: "Foundation" },
    { title: "Real Estate Listing App", description: "Develop a property listing app with map-based search, virtual tours, mortgage calculator, saved properties, and agent messaging.", techStack: ["React Native", "Node.js", "MongoDB", "Mapbox", "Firebase"], difficulty: "Advanced", category: "Mobile Development", estimatedWeeks: 16, learningOutcomes: ["Map integration", "Filter systems", "Image galleries", "In-app messaging"], planRequired: "Foundation" },
    { title: "Travel Planner App", description: "Create a travel planning app with itinerary builder, hotel/flight booking integration, expense splitting, weather forecasts, and offline maps.", techStack: ["React Native", "Node.js", "MongoDB", "REST APIs", "AsyncStorage"], difficulty: "Expert", category: "Mobile Development", estimatedWeeks: 20, learningOutcomes: ["API aggregation", "Offline support", "Complex state", "Itinerary algorithms"], planRequired: "Advanced" },
    { title: "Social Networking App", description: "Build a social networking app with profiles, posts, likes, comments, follow system, stories, push notifications, and content moderation.", techStack: ["React Native", "Node.js", "MongoDB", "Firebase", "Cloudinary"], difficulty: "Expert", category: "Mobile Development", estimatedWeeks: 22, learningOutcomes: ["Social graph", "Content moderation", "Feed algorithms", "Media handling"], planRequired: "Advanced" },
    { title: "Habit Tracker App", description: "Develop a habit tracking app with daily goals, streak tracking, reminder notifications, analytics dashboard, and motivational quotes.", techStack: ["React Native", "Node.js", "MongoDB", "Local Notifications"], difficulty: "Intermediate", category: "Mobile Development", estimatedWeeks: 10, learningOutcomes: ["Local notifications", "Streak logic", "Mobile analytics", "Motivational UX"], planRequired: "Foundation" },
    { title: "Parking Finder App", description: "Create a parking spot finder with real-time availability, reservation system, QR-based entry/exit, payment integration, and navigation.", techStack: ["React Native", "Node.js", "MongoDB", "Google Maps", "Razorpay"], difficulty: "Advanced", category: "Mobile Development", estimatedWeeks: 16, learningOutcomes: ["Geolocation", "Real-time availability", "QR codes", "Payment in mobile"], planRequired: "Foundation" },
    { title: "Study Group App", description: "Build a collaborative study app with group creation, shared notes, flashcard decks, quiz battles, video study rooms, and progress leaderboards.", techStack: ["React Native", "Node.js", "MongoDB", "WebRTC", "Socket.io"], difficulty: "Expert", category: "Mobile Development", estimatedWeeks: 20, learningOutcomes: ["Video rooms", "Collaborative editing", "Gamification", "Real-time sync"], planRequired: "Advanced" },

    // ─── AI/ML (12 projects) ─────────────────────────────────────────
    { title: "Sentiment Analysis Dashboard", description: "Build a web dashboard that performs sentiment analysis on product reviews, tweets, or news articles using NLP models with visual analytics.", techStack: ["Python", "Flask", "React", "NLTK/spaCy", "Chart.js"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 14, learningOutcomes: ["NLP fundamentals", "Text preprocessing", "Model deployment", "Data visualization"], planRequired: "Foundation" },
    { title: "Image Classification API", description: "Develop a deep learning image classification system with model training, REST API deployment, batch processing, and confidence scoring.", techStack: ["Python", "TensorFlow/PyTorch", "Flask", "Docker", "React"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 16, learningOutcomes: ["CNN architectures", "Transfer learning", "Model serving", "API design"], planRequired: "Foundation" },
    { title: "Recommendation Engine", description: "Create a recommendation system for products/movies using collaborative filtering and content-based approaches with a web interface.", techStack: ["Python", "Scikit-learn", "Flask", "React", "MongoDB"], difficulty: "Expert", category: "AI/ML", estimatedWeeks: 18, learningOutcomes: ["Recommendation algorithms", "Matrix factorization", "A/B testing", "Evaluation metrics"], planRequired: "Advanced" },
    { title: "Chatbot with NLP", description: "Build an intelligent chatbot using NLP and intent classification that can handle customer queries, FAQs, and escalation to human agents.", techStack: ["Python", "Rasa/Dialogflow", "React", "Node.js", "MongoDB"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 16, learningOutcomes: ["Intent classification", "Entity extraction", "Dialog management", "Conversational UX"], planRequired: "Foundation" },
    { title: "Fraud Detection System", description: "Develop a machine learning system for detecting fraudulent transactions with anomaly detection, real-time scoring, and alert dashboard.", techStack: ["Python", "Scikit-learn", "XGBoost", "Flask", "React"], difficulty: "Expert", category: "AI/ML", estimatedWeeks: 18, learningOutcomes: ["Anomaly detection", "Imbalanced datasets", "Feature engineering", "Real-time scoring"], planRequired: "Advanced" },
    { title: "Object Detection System", description: "Build a real-time object detection system using YOLO/SSD with video stream processing, bounding box visualization, and detection logging.", techStack: ["Python", "PyTorch", "OpenCV", "Flask", "React"], difficulty: "Expert", category: "AI/ML", estimatedWeeks: 20, learningOutcomes: ["Object detection models", "Video processing", "GPU optimization", "Real-time inference"], planRequired: "Advanced" },
    { title: "Stock Price Predictor", description: "Create a stock price prediction system using time series analysis and LSTM networks with historical data visualization and backtesting.", techStack: ["Python", "TensorFlow", "Pandas", "Flask", "React", "Plotly"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 16, learningOutcomes: ["Time series analysis", "LSTM networks", "Financial data", "Backtesting strategies"], planRequired: "Foundation" },
    { title: "Medical Image Analysis", description: "Develop a deep learning system for analyzing medical images (X-rays/MRI) with disease classification, heatmap visualization, and doctor dashboard.", techStack: ["Python", "TensorFlow", "Flask", "React", "Grad-CAM"], difficulty: "Expert", category: "AI/ML", estimatedWeeks: 22, learningOutcomes: ["Medical imaging", "Grad-CAM visualization", "Model interpretability", "Healthcare AI ethics"], planRequired: "Advanced" },
    { title: "Text Summarization Tool", description: "Build an automatic text summarization tool supporting both extractive and abstractive methods with a web interface for document upload.", techStack: ["Python", "Transformers", "Flask", "React", "Hugging Face"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 14, learningOutcomes: ["Transformer models", "Text summarization", "Model fine-tuning", "API deployment"], planRequired: "Foundation" },
    { title: "Voice Assistant", description: "Create a voice-controlled assistant with speech recognition, intent understanding, task execution, and text-to-speech response generation.", techStack: ["Python", "SpeechRecognition", "pyttsx3", "Flask", "React"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 16, learningOutcomes: ["Speech recognition", "Text-to-speech", "Intent systems", "Audio processing"], planRequired: "Foundation" },
    { title: "Fake News Detector", description: "Build a fake news detection system using NLP and machine learning to classify news articles as real or fake with confidence scores.", techStack: ["Python", "Scikit-learn", "BERT", "Flask", "React"], difficulty: "Advanced", category: "AI/ML", estimatedWeeks: 14, learningOutcomes: ["Text classification", "BERT fine-tuning", "Feature engineering", "Model evaluation"], planRequired: "Foundation" },
    { title: "Autonomous Drone Navigation", description: "Develop a simulation-based autonomous drone navigation system using reinforcement learning with obstacle avoidance and path planning.", techStack: ["Python", "PyTorch", "OpenAI Gym", "AirSim", "React"], difficulty: "Expert", category: "AI/ML", estimatedWeeks: 24, learningOutcomes: ["Reinforcement learning", "Simulation environments", "Path planning", "Reward engineering"], planRequired: "Advanced" },

    // ─── Cybersecurity (11 projects) ─────────────────────────────────
    { title: "Network Vulnerability Scanner", description: "Build a network vulnerability scanner that discovers hosts, scans ports, identifies services, detects known vulnerabilities, and generates reports.", techStack: ["Python", "Scapy", "Nmap", "Flask", "React"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 16, learningOutcomes: ["Network scanning", "Vulnerability detection", "Port analysis", "Report generation"], planRequired: "Foundation" },
    { title: "Web Application Firewall (WAF)", description: "Develop a WAF that detects and blocks common web attacks (SQLi, XSS, CSRF) with rule engine, logging, and admin dashboard.", techStack: ["Node.js", "Express", "React", "MongoDB", "Redis"], difficulty: "Expert", category: "Cybersecurity", estimatedWeeks: 20, learningOutcomes: ["Attack patterns", "Rule engines", "Request filtering", "Security logging"], planRequired: "Advanced" },
    { title: "Password Manager", description: "Create a secure password manager with AES-256 encryption, master password, password generator, breach checking, and browser extension.", techStack: ["React", "Node.js", "MongoDB", "CryptoJS", "Chrome Extension API"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 16, learningOutcomes: ["Encryption/decryption", "Key management", "Browser extensions", "Secure storage"], planRequired: "Foundation" },
    { title: "SIEM Dashboard", description: "Build a Security Information and Event Management dashboard that aggregates logs, detects anomalies, generates alerts, and visualizes threats.", techStack: ["Python", "Elasticsearch", "Kibana", "Flask", "React"], difficulty: "Expert", category: "Cybersecurity", estimatedWeeks: 22, learningOutcomes: ["Log aggregation", "Anomaly detection", "Alert systems", "Threat visualization"], planRequired: "Advanced" },
    { title: "Phishing Detection System", description: "Develop a system that analyzes emails and URLs to detect phishing attempts using ML classification, URL analysis, and email header inspection.", techStack: ["Python", "Scikit-learn", "Flask", "React", "URLLib"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 14, learningOutcomes: ["Phishing indicators", "URL analysis", "Email parsing", "ML classification"], planRequired: "Foundation" },
    { title: "Encrypted File Sharing", description: "Create an end-to-end encrypted file sharing platform with secure key exchange, file versioning, access controls, and audit logging.", techStack: ["React", "Node.js", "MongoDB", "CryptoJS", "S3"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 16, learningOutcomes: ["E2E encryption", "Key exchange protocols", "Access control", "Audit logging"], planRequired: "Foundation" },
    { title: "Intrusion Detection System", description: "Build a network intrusion detection system using packet analysis and ML-based anomaly detection with real-time alerting and visualization.", techStack: ["Python", "Scapy", "Scikit-learn", "Flask", "React"], difficulty: "Expert", category: "Cybersecurity", estimatedWeeks: 20, learningOutcomes: ["Packet analysis", "Network anomalies", "ML for security", "Real-time processing"], planRequired: "Advanced" },
    { title: "Security Audit Tool", description: "Develop an automated security audit tool that checks web applications for common vulnerabilities (OWASP Top 10) and generates compliance reports.", techStack: ["Python", "Selenium", "Flask", "React", "ReportLab"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 16, learningOutcomes: ["OWASP Top 10", "Automated testing", "Compliance reporting", "Web security basics"], planRequired: "Foundation" },
    { title: "Digital Forensics Toolkit", description: "Create a digital forensics toolkit for file recovery, metadata analysis, hash verification, timeline reconstruction, and evidence chain management.", techStack: ["Python", "Flask", "React", "SQLite", "Hashlib"], difficulty: "Expert", category: "Cybersecurity", estimatedWeeks: 22, learningOutcomes: ["File forensics", "Metadata analysis", "Hash verification", "Evidence handling"], planRequired: "Advanced" },
    { title: "Secure Messaging Platform", description: "Build a secure messaging platform with end-to-end encryption, disappearing messages, two-factor authentication, and anti-screenshot protection.", techStack: ["React", "Node.js", "MongoDB", "Signal Protocol", "WebRTC"], difficulty: "Expert", category: "Cybersecurity", estimatedWeeks: 20, learningOutcomes: ["Signal protocol", "2FA implementation", "Secure key management", "Privacy by design"], planRequired: "Advanced" },
    { title: "Honeypot System", description: "Develop a honeypot system that simulates vulnerable services to attract and log attacker behavior with threat intelligence reporting.", techStack: ["Python", "Docker", "Flask", "MongoDB", "React"], difficulty: "Advanced", category: "Cybersecurity", estimatedWeeks: 16, learningOutcomes: ["Honeypot design", "Attacker behavior", "Threat intelligence", "Docker networking"], planRequired: "Foundation" },

    // ─── Data Engineering (10 projects) ──────────────────────────────
    { title: "ETL Pipeline Builder", description: "Build a visual ETL pipeline builder with drag-and-drop interface, data source connectors, transformation rules, scheduling, and monitoring.", techStack: ["React", "Node.js", "PostgreSQL", "Apache Airflow", "D3.js"], difficulty: "Expert", category: "Data Engineering", estimatedWeeks: 20, learningOutcomes: ["ETL concepts", "Pipeline orchestration", "Data transformations", "Monitoring systems"], planRequired: "Advanced" },
    { title: "Real-Time Analytics Dashboard", description: "Create a real-time analytics dashboard processing streaming data with live charts, custom metrics, alerts, and historical comparison.", techStack: ["React", "Node.js", "Apache Kafka", "InfluxDB", "D3.js"], difficulty: "Expert", category: "Data Engineering", estimatedWeeks: 20, learningOutcomes: ["Stream processing", "Time-series databases", "Real-time visualization", "Kafka concepts"], planRequired: "Advanced" },
    { title: "Data Quality Monitor", description: "Develop a data quality monitoring system that validates data integrity, detects anomalies, tracks data lineage, and generates quality reports.", techStack: ["Python", "Flask", "React", "PostgreSQL", "Great Expectations"], difficulty: "Advanced", category: "Data Engineering", estimatedWeeks: 16, learningOutcomes: ["Data quality metrics", "Anomaly detection", "Data lineage", "Validation frameworks"], planRequired: "Foundation" },
    { title: "Log Analysis Platform", description: "Build a centralized log analysis platform with log ingestion, parsing, search, visualization, pattern detection, and alerting.", techStack: ["Python", "Elasticsearch", "React", "Node.js", "Logstash"], difficulty: "Advanced", category: "Data Engineering", estimatedWeeks: 16, learningOutcomes: ["Log parsing", "Search indexing", "Pattern recognition", "Alert configuration"], planRequired: "Foundation" },
    { title: "Data Warehouse Dashboard", description: "Create a data warehousing solution with star/snowflake schema design, OLAP queries, dimensional modeling, and executive dashboards.", techStack: ["Python", "PostgreSQL", "dbt", "React", "Chart.js"], difficulty: "Expert", category: "Data Engineering", estimatedWeeks: 20, learningOutcomes: ["Dimensional modeling", "OLAP queries", "dbt transformations", "Executive reporting"], planRequired: "Advanced" },
    { title: "Web Scraping Pipeline", description: "Develop an automated web scraping pipeline with scheduler, proxy rotation, captcha handling, data cleaning, and storage with API access.", techStack: ["Python", "Scrapy", "Flask", "MongoDB", "React"], difficulty: "Advanced", category: "Data Engineering", estimatedWeeks: 14, learningOutcomes: ["Web scraping ethics", "Anti-bot evasion", "Data cleaning", "Pipeline scheduling"], planRequired: "Foundation" },
    { title: "API Analytics Platform", description: "Build a platform that monitors API usage, tracks performance metrics, detects anomalies, generates usage reports, and manages rate limits.", techStack: ["Node.js", "React", "Redis", "MongoDB", "Chart.js"], difficulty: "Advanced", category: "Data Engineering", estimatedWeeks: 16, learningOutcomes: ["API monitoring", "Performance metrics", "Rate limiting", "Usage analytics"], planRequired: "Foundation" },
    { title: "Data Migration Tool", description: "Create a data migration tool supporting multiple database types with schema mapping, data transformation, validation, and rollback capabilities.", techStack: ["Node.js", "React", "PostgreSQL", "MongoDB", "MySQL"], difficulty: "Expert", category: "Data Engineering", estimatedWeeks: 18, learningOutcomes: ["Schema mapping", "Data transformation", "Migration strategies", "Rollback mechanisms"], planRequired: "Advanced" },
    { title: "Survey Analytics Platform", description: "Develop a survey creation and analytics platform with form builder, response collection, statistical analysis, and exportable reports.", techStack: ["React", "Node.js", "MongoDB", "D3.js", "PDFKit"], difficulty: "Intermediate", category: "Data Engineering", estimatedWeeks: 12, learningOutcomes: ["Form builders", "Statistical analysis", "Report generation", "Data export"], planRequired: "Foundation" },
    { title: "Data Catalog System", description: "Build a data catalog system for discovering, documenting, and governing data assets with metadata management, search, and access controls.", techStack: ["React", "Node.js", "PostgreSQL", "Elasticsearch", "Docker"], difficulty: "Expert", category: "Data Engineering", estimatedWeeks: 20, learningOutcomes: ["Metadata management", "Data governance", "Search systems", "Access control"], planRequired: "Advanced" },

    // ─── DevOps (10 projects) ────────────────────────────────────────
    { title: "CI/CD Pipeline Dashboard", description: "Build a CI/CD pipeline dashboard that visualizes build status, test results, deployment history, and provides rollback capabilities.", techStack: ["React", "Node.js", "Docker", "GitHub Actions", "MongoDB"], difficulty: "Advanced", category: "DevOps", estimatedWeeks: 16, learningOutcomes: ["CI/CD concepts", "Docker containers", "Build automation", "Deployment strategies"], planRequired: "Foundation" },
    { title: "Container Orchestration Platform", description: "Create a simplified container management platform with deployment, scaling, health monitoring, resource management, and logging.", techStack: ["React", "Node.js", "Docker", "Kubernetes", "Prometheus"], difficulty: "Expert", category: "DevOps", estimatedWeeks: 22, learningOutcomes: ["Kubernetes basics", "Container management", "Health monitoring", "Resource optimization"], planRequired: "Advanced" },
    { title: "Infrastructure Monitoring Tool", description: "Develop a monitoring tool that tracks server health, CPU/memory usage, disk space, network metrics, and sends alerts on threshold breaches.", techStack: ["React", "Node.js", "MongoDB", "Socket.io", "Chart.js"], difficulty: "Advanced", category: "DevOps", estimatedWeeks: 16, learningOutcomes: ["System metrics", "Alerting systems", "Real-time monitoring", "Threshold management"], planRequired: "Foundation" },
    { title: "Deployment Automation Tool", description: "Build a deployment automation tool with environment management, configuration templating, rollback support, and deployment history.", techStack: ["Node.js", "React", "Docker", "Ansible", "MongoDB"], difficulty: "Expert", category: "DevOps", estimatedWeeks: 20, learningOutcomes: ["Deployment automation", "Configuration management", "Environment isolation", "Rollback strategies"], planRequired: "Advanced" },
    { title: "Service Uptime Monitor", description: "Create a service uptime monitoring tool with HTTP/TCP checks, response time tracking, status pages, incident management, and SMS alerts.", techStack: ["Node.js", "React", "MongoDB", "Twilio", "Chart.js"], difficulty: "Advanced", category: "DevOps", estimatedWeeks: 14, learningOutcomes: ["Health checks", "Incident management", "Status page design", "SMS integration"], planRequired: "Foundation" },
    { title: "Configuration Management System", description: "Develop a centralized configuration management system with version control, environment isolation, secrets management, and audit logging.", techStack: ["Node.js", "React", "MongoDB", "Redis", "CryptoJS"], difficulty: "Expert", category: "DevOps", estimatedWeeks: 18, learningOutcomes: ["Config management", "Secrets handling", "Version control", "Audit trails"], planRequired: "Advanced" },
    { title: "Log Aggregation System", description: "Build a centralized log aggregation system that collects logs from multiple services, provides search, filtering, and real-time streaming.", techStack: ["Node.js", "React", "Elasticsearch", "Redis", "Socket.io"], difficulty: "Advanced", category: "DevOps", estimatedWeeks: 16, learningOutcomes: ["Log management", "Full-text search", "Stream processing", "Multi-service architecture"], planRequired: "Foundation" },
    { title: "GitOps Dashboard", description: "Create a GitOps dashboard that syncs infrastructure state with Git repositories, tracks changes, manages approvals, and provides drift detection.", techStack: ["React", "Node.js", "MongoDB", "GitHub API", "Docker"], difficulty: "Expert", category: "DevOps", estimatedWeeks: 20, learningOutcomes: ["GitOps principles", "Infrastructure as Code", "Drift detection", "Approval workflows"], planRequired: "Advanced" },
    { title: "Serverless Function Manager", description: "Develop a platform for managing serverless functions with deployment, monitoring, version management, cold start optimization, and cost tracking.", techStack: ["React", "Node.js", "AWS Lambda", "MongoDB", "Chart.js"], difficulty: "Advanced", category: "DevOps", estimatedWeeks: 16, learningOutcomes: ["Serverless architecture", "Function management", "Cold start optimization", "Cost analysis"], planRequired: "Foundation" },
    { title: "Cloud Cost Optimizer", description: "Build a cloud cost optimization tool that analyzes resource usage, identifies waste, suggests rightsizing, and tracks spending trends.", techStack: ["React", "Node.js", "MongoDB", "AWS SDK", "D3.js"], difficulty: "Expert", category: "DevOps", estimatedWeeks: 20, learningOutcomes: ["Cloud cost management", "Resource optimization", "Usage analytics", "Recommendation engines"], planRequired: "Advanced" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding');

        // Clear existing projects
        await Project.deleteMany({});
        console.log('Cleared existing projects');

        // Insert all projects
        const projectsWithRoadmaps = projects.map(p => ({
            ...p,
            roadmap: generateRoadmap(p.category, p.estimatedWeeks)
        }));
        const result = await Project.insertMany(projectsWithRoadmaps);
        console.log(`✅ Seeded ${result.length} projects successfully!`);

        // Print summary
        const categories = {};
        result.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        console.log('\nProject breakdown:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
