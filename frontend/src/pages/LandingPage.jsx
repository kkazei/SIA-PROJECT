import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";

const LandingPage = () => {
    const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    const images = [
        "image/landing.jpeg",
        "image/landing2.jpeg",
        "image/landing3.jpeg",
    ];

    // PWA installation event handling
    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Update UI to show install button
            setIsInstallable(true);
        });

        window.addEventListener('appinstalled', () => {
            // Log install to analytics
            console.log('PWA was installed');
            setIsInstallable(false);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    // Automatically transition to the next image every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [images.length]);                                                                                            

    const getDashboardUrl = () => {
        // Use isCheckingAuth instead of authLoading
        if (isCheckingAuth) {
            return '#'; // Prevent navigation while loading
        }
        
        // Check if authenticated first, then check role
        if (!isAuthenticated || !user) {
            return '/login'; // Redirect to login if not authenticated
        }
        
        // Add null check with optional chaining
        switch(user?.role) {
            case 'landlord':
                return '/landlord/dashboard';
            case 'tenant':
                return '/tenant/dashboard';
            default:
                return '/login'; // Safer fallback - no generic dashboard
        }
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
                    {/* Right Image Carousel */}
                    <div className="md:w-1/2 h-full flex flex-col justify-center relative">
                        <motion.div
                            className="relative w-full h-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.5 }}
                        >
                            <img
                                src={images[currentImageIndex]}
                                alt="Building"
                                className="rounded-lg shadow-lg object-cover w-full h-full"
                            />
                        </motion.div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full ${
                                        currentImageIndex === index
                                            ? "bg-green-500"
                                            : "bg-gray-500"
                                    }`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Vertical Line */}
                    <div className="hidden md:block w-1 h-80 bg-gray-500 mx-10 relative overflow-hidden">
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
                                <>
                                    <Link
                                        to={getDashboardUrl()}
                                        className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all text-center"
                                    >
                                        Go to Dashboard
                                    </Link>
                                    {isInstallable && (
                                        <button
                                            onClick={handleInstallClick}
                                            className="py-3 px-8 border border-green-500 rounded-lg font-bold hover:bg-green-500/10 transition-colors text-center flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Install App
                                        </button>
                                    )}
                                </>
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
                                    {isInstallable && (
                                        <button
                                            onClick={handleInstallClick}
                                            className="py-3 px-8 border border-green-500 rounded-lg font-bold hover:bg-green-500/10 transition-colors text-center flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Install App
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Rest of your component */}
        </div>
    );
};

export default LandingPage;