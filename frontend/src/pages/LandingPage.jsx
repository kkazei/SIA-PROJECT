import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LandingPage = () => {
    const { isAuthenticated, user } = useAuthStore();

    const getDashboardUrl = () => {
        if (!user) return '/dashboard';
        if (user.role === 'landlord') return '/landlord/dashboard';
        if (user.role === 'tenant') return '/tenant/dashboard';
        return '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header Section */}
            <header className="bg-gray-800 py-4 shadow-md">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                        RENTFLOW
                    </div>
        
                </div>
            </header>

            {/* Hero Section */}
            <motion.section
    className="relative h-screen bg-gray-900 flex items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
>
    <div className="container mx-auto px-6 flex flex-col md:flex-row-reverse items-center">
        {/* Right Image */}
        <div className="md:w-1/2 h-full flex justify-center relative">
            <motion.div
                className="relative w-full h-full"
                initial={{ opacity: 0, scale: 0.9 }} // Initial animation
                animate={{ opacity: 1, scale: 1 }} // Animation on load
                whileHover={{ scale: 1.05 }} // Animation on hover
                transition={{ duration: 1.5 }} // Transition duration
            >
                <img
                    src="/landing.jpeg" 
                    alt="Building"
                    className="rounded-lg shadow-lg object-cover w-full h-full"
                />
            </motion.div>
        </div>

        {/* Vertical Line */}
<div className="hidden md:block w-1 h-80 bg-gray-500 mx-10 relative overflow-hidden">
    {/* Glowing Light */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-vibrantGreen to-emeraldBright animate-glow"></div>
</div>

        {/* Left Content */}
        <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
                FIND YOUR <span className="bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">HOME</span> IN THE CITY
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
                Simplify apartment management for landlords and tenants with our all-in-one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {isAuthenticated ? (
                    <Link
                        to={getDashboardUrl()}
                        className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all text-center"
                    >
                        Go to Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="py-3 px-8 border border-green-500 rounded-lg font-bold hover:bg-green-500/10 transition-colors text-center"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all text-center"
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </div>
    </div>
</motion.section>



            {/* Features Section */}
<section className="py-20 bg-gray-800">
    <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
            Explore Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
                <motion.div
                    key={index}
                    className="bg-gray-900 p-8 rounded-xl border border-gray-700 text-center"
                    whileHover={{ scale: 1.05, boxShadow: "0px 4px 20px rgba(0, 255, 128, 0.3)" }} // Scale up and add shadow on hover
                    transition={{ duration: 0.3 }} // Smooth transition
                >
                    <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-green-400">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                </motion.div>
            ))}
        </div>
    </div>
</section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-10">
                <div className="container mx-auto px-6 text-center">
                    <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4">
                        RentFlow
                    </div>
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} RENTFLOW. All rights reserved.
                    </p>
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