import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useParams, Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import { Lock, KeyRound, Loader } from "lucide-react";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "../../components/auth/PasswordStrengthMeter";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetPassword, error, isLoading, message } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        try {
            await resetPassword(token, password);

            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error resetting password");
        }
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
                        <KeyRound className="text-white h-8 w-8" />
                    </div>
                    <h2 className='text-3xl font-bold mb-1 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                        Reset Password
                    </h2>
                    <p className="text-gray-400 text-center mb-6">Create a new secure password</p>
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
                    
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg"
                        >
                            <p className="text-green-400 text-sm font-medium">{message}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            icon={Lock}
                            type='password'
                            placeholder='New Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mb-2"
                        />
                        
                        <PasswordStrengthMeter password={password} />

                        <Input
                            icon={Lock}
                            type='password'
                            placeholder='Confirm New Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-2"
                        />

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                                font-bold rounded-lg shadow-lg hover:from-green-600
                                hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                                focus:ring-offset-gray-900 transition-all duration-200'
                                type='submit'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader className='w-5 h-5 animate-spin mx-auto' />
                                ) : (
                                    "Set New Password"
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-4 bg-gray-900 bg-opacity-70 flex justify-center">
                    <p className="text-sm text-gray-400">
                        Remember your password?{" "}
                        <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
export default ResetPasswordPage;