import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, User } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, isLoading, error } = useAuthStore();

// In your login component
const handleLogin = async (e) => {
	e.preventDefault();
	
	try {
	  const result = await login(email, password);
	  
	  if (result.needsEmailVerification) {
		navigate('/verify-email');
	  } else if (result.needsRoleSelection) {
		navigate('/role-selection');
	  } else {
		navigate('/'); // Or whatever your main app route is
	  }
	} catch (error) {
	  console.error('Login error:', error);
	}
  };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
            >
                {/* Logo/Header Section */}
                <div className="p-8 pb-0">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <User className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold mb-1 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                        Welcome Back
                    </h2>
                    <p className="text-gray-400 text-center mb-6">Sign in to your account</p>
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

                    <form onSubmit={handleLogin}>
                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-4"
                        />

                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-2"
                        />

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    name="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm text-green-400 hover:text-green-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Sign In"
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLoginButton />
                        </div>
                    </div>
                </div>
                <div className="px-8 py-4 bg-gray-900 bg-opacity-70 flex justify-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-green-400 hover:text-green-300 font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;