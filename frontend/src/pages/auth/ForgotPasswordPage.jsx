import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/ui/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { isLoading, forgotPassword, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='max-w-md w-full bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700'
            >
                {/* Logo/Header Section */}
                <div className="p-8 pb-0">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Mail className="text-white h-8 w-8" />
                    </div>
                    <h2 className='text-3xl font-bold mb-1 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                        Forgot Password
                    </h2>
                    <p className="text-gray-400 text-center mb-6">We'll help you recover your account</p>
                </div>

                <div className="p-8 pt-4">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg"
                        >
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit}>
                            <p className='text-gray-300 mb-6 text-center'>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <Input
                                icon={Mail}
                                type='email'
                                placeholder='Email Address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mb-6"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                                font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200'
                                type='submit'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader className='w-5 h-5 animate-spin mx-auto' />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <div className="mx-auto h-16 w-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                                <Mail className="text-green-400 h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-green-400 mb-2">Check Your Email</h3>
                            <p className="text-gray-300 mb-6">
                                We've sent a password reset link to <span className="font-medium text-white">{email}</span>
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                If you don't see the email, check your spam folder or request another link below.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsSubmitted(false)}
                                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Send Again
                            </motion.button>
                        </motion.div>
                    )}
                </div>

                <div className="px-8 py-4 bg-gray-900 bg-opacity-70 flex justify-center">
                    <Link 
                        to="/login" 
                        className="text-sm text-gray-400 hover:text-green-300 flex items-center font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;