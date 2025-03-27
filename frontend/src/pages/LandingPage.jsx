import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LandingPage = () => {
    const { isAuthenticated, user } = useAuthStore();

    // Determine the dashboard URL based on user role
    const getDashboardUrl = () => {
        if (!user) return '/dashboard';
        
        if (user.role === 'landlord') {
            return '/landlord/dashboard';
        } else if (user.role === 'tenant') {
            return '/tenant/dashboard';
        } else {
            return '/dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <motion.div 
                className="relative h-screen bg-gradient-to-b from-gray-900 to-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Navigation */}
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                        ApartmentPro
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link 
                                to={getDashboardUrl()}
                                className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="py-2 px-4 hover:text-green-400 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between h-[calc(100vh-80px)]">
                    <motion.div 
                        className="w-full md:w-1/2 mb-16 md:mb-0"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Streamline Your <span className="bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">Property Management</span> Experience
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Simplify apartment management for landlords and tenants with our all-in-one platform
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                to={isAuthenticated ? getDashboardUrl() : "/signup"}
                                className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all text-center"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Sign Up Today'}
                            </Link>
                            <button className="py-3 px-8 border border-green-500 rounded-lg font-bold hover:bg-green-500/10 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                    <motion.div 
                        className="w-full md:w-1/2 flex justify-center"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="w-full max-w-md h-96 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-2xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </motion.div>
                </div>
                
                {/* Scroll indicator */}
                <motion.div 
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </motion.div>

            {/* Features Section */}
            <motion.section 
                className="py-20 bg-gray-800"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                        Powerful Features for Everyone
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <motion.div 
                                key={index}
                                className="bg-gray-900 p-8 rounded-xl border border-gray-700"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-green-400">{feature.title}</h3>
                                <p className="text-gray-300">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section 
                className="py-20 bg-gray-900"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                        Ready to transform your property management?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of property managers and tenants who are already using our platform to streamline their daily operations.
                    </p>
                    <Link 
                        to="/signup"
                        className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all inline-block"
                    >
                        Get Started Today
                    </Link>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4 md:mb-0">
                            ApartmentPro
                        </div>
                        <div className="flex gap-6">
                            <Link to="#" className="text-gray-400 hover:text-green-400 transition-colors">About</Link>
                            <Link to="#" className="text-gray-400 hover:text-green-400 transition-colors">Features</Link>
                            <Link to="#" className="text-gray-400 hover:text-green-400 transition-colors">Pricing</Link>
                            <Link to="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact</Link>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} ApartmentPro. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Feature list
const features = [
    {
        title: "Streamlined Maintenance Requests",
        description: "Submit and track maintenance requests with ease. Landlords can manage tasks efficiently and tenants stay informed about progress.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        title: "Simple Payment Management",
        description: "Pay rent online with secure payment processing. Landlords can track payments, send reminders, and manage financial records all in one place.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        title: "Real-time Communication",
        description: "Built-in messaging system connects tenants and landlords. Receive important notifications and updates about your property or community events.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        )
    }
];

export default LandingPage;