import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, FileText, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const mainBenefits = [
        { icon: <Award className="text-primary" />, title: "Industry Certification", desc: "Recognized certificates that validate your practical skills to employers." },
        { icon: <FileText className="text-primary" />, title: "Real-world Projects", desc: "Work on actual industry problems rather than just tutorial exercises." },
        { icon: <TrendingUp className="text-primary" />, title: "Performance Analytics", desc: "Weekly evaluation reports on your progress, strengths, and areas for growth." },
        { icon: <Shield className="text-primary" />, title: "Advanced Plagiarism Detection System", desc: "Our system ensures your work is original and high-quality." }
    ];

    const studentGets = [
        "Personalized Project Roadmap",
        "Weekly Progress Evaluation",
        "Technical Feedback & Optimization",
        "Certificate of Completion",
        "Advanced Plagiarism Detection System",
        "Independent Project Implementation"
    ];

    const sampleProjects = [
        { title: "AI Chatbot with NLP", tag: "AI/ML", desc: "Build a conversational agent using modern NLP techniques." },
        { title: "Sentiment Analysis Dashboard", tag: "Data Science", desc: "Analyze social media trends and visualize real-time sentiments." },
        { title: "Full-stack SaaS App", tag: "Web Dev", desc: "Develop a multi-tenant application with auth and payments." },
        { title: "Real-time Analytics Dashboard", tag: "Data Eng", desc: "Process and display live streaming data streams." }
    ];

    const steps = [
        { title: "Enroll & choose project", desc: "Select a project that matches your career goals and interests." },
        { title: "Follow structured roadmap", desc: "Get a week-by-week implementation guide for your project." },
        { title: "Submit weekly reports", desc: "Document your progress and technical implementation details." },
        { title: "Get evaluation", desc: "Receive dynamic feedback and plagiarism-checked scores." },
        { title: "Complete & Unlock", desc: "Finish the phases and receive your industry-recognized certificate." }
    ];

    const outcomes = [
        { title: "Production-level project", desc: "Create a GitHub-ready application using industry best practices." },
        { title: "Deployable App", desc: "Ship your work to a live production environment." },
        { title: "Independent Portfolio", desc: "Showcase original work that makes you stand out to employers." },
        { title: "Certificate", desc: "A formal validation of your project completion and skills." }
    ];

    return (
        <div className="home-page overflow-x-hidden">
            {/* Hero Section */}
            <section className="section hero-bg min-h-[90vh] flex items-center bg-[radial-gradient(circle_at_top_right,#e0f2fe_0%,#ffffff_100%)]">
                <div className="container mx-auto px-4 sm:px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="badge bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-bold text-xs mb-4 inline-block">
                                INDEPENDENT TRAINING PROGRAM
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                                Build <span className="text-blue-600 bg-clip-text">Real-World Projects</span> That Matter
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 mb-6 max-w-xl">
                                Join TVP IT Solutions for a structured, project-based training experience. You will independently build 1 major project with weekly evaluations and advanced plagiarism detection.
                            </p>
                            <p className="text-sm text-slate-400 mb-10 max-w-xl italic">
                                This is a project-based training program focused on building real-world applications. Fully independent training.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="btn btn-primary w-full sm:w-auto text-center py-4 px-8 text-lg">
                                    Enroll Now
                                </Link>
                                <a href="#what-you-get" className="btn btn-outline w-full sm:w-auto text-center py-4 px-8 text-lg">
                                    What You Get
                                </a>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative hidden md:block"
                        >
                            <div className="glass-card p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl">
                                <div className="flex gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="font-mono text-slate-800 space-y-2">
                                    <p className="text-blue-600 font-bold">// Your journey:</p>
                                    <p>const status = "Building";</p>
                                    <p>const project = "Production-Level App";</p>
                                    <p>const confidence = Infinity;</p>
                                    <p className="pt-4">if (projectComplete) {"{"}</p>
                                    <p className="pl-6">certificate.unlock();</p>
                                    <p>{"}"}</p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="absolute -top-5 -right-5 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-2"
                            >
                                <Zap className="text-yellow-500" size={20} /> <span className="font-bold">Build. Evaluate. Certify.</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section (Step-based) */}
            <section id="how-it-works" className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 md:px-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="text-blue-600">Works</span></h2>
                        <p className="text-slate-600">A clear, structured path from enrollment to certification.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative text-center">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg relative z-10">
                                    {idx + 1}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
                                )}
                                <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                                <p className="text-sm text-slate-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Get Section */}
            <section id="what-you-get" className="py-20">
                <div className="container mx-auto px-4 sm:px-6 md:px-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="text-blue-600">Students Get</span></h2>
                        <p className="text-slate-600">Everything you need to independently build and ship a real-world project.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {mainBenefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="mb-6">{benefit.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sample Projects Section */}
                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold mb-2">Explore <span className="text-blue-600">Sample Projects</span></h3>
                            <p className="text-slate-500">A glimpse into the production-level applications you'll build.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sampleProjects.map((proj, idx) => (
                                <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded-md mb-3 inline-block">
                                        {proj.tag}
                                    </span>
                                    <h4 className="font-bold mb-2">{proj.title}</h4>
                                    <p className="text-xs text-slate-500">{proj.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Outcome Section */}
                    <div className="mb-20 bg-blue-600 rounded-[2rem] p-10 md:p-16 text-white text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">Your <span className="text-blue-200">Outcome</span> After Completion</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {outcomes.map((outcome, idx) => (
                                <div key={idx}>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle size={28} />
                                    </div>
                                    <h4 className="font-bold mb-3">{outcome.title}</h4>
                                    <p className="text-blue-100 text-sm">{outcome.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="p-10 md:p-16 rounded-[2rem] bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to start building?</h2>
                                <p className="text-blue-100 mb-8 text-lg">Enroll now and start your project-based training journey with TVP IT Solutions.</p>
                                <Link to="/login" className="btn bg-white text-blue-600 hover:bg-slate-100 py-4 px-10 text-lg font-bold">
                                    Enroll Now
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {studentGets.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm font-medium">
                                        <CheckCircle size={18} className="text-blue-200" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 sm:px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-800 pb-16 mb-12">
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-white">TVP IT Solutions</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Project-based independent training programs that build real-world skills through hands-on development.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
                                <li><a href="/programs" className="hover:text-blue-400 transition-colors">Programs</a></li>
                                <li><a href="/login" className="hover:text-blue-400 transition-colors">Student Login</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Info</h4>
                            <p className="text-slate-400 text-sm">
                                Email: <a href="mailto:contact@threatviper.com" className="text-blue-400">contact@threatviper.com</a>
                            </p>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 text-xs">&copy; 2026 TVP IT Solutions. Part of ThreatViper Networks. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
