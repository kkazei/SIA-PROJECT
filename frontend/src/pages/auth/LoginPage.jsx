import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { getRolePath } from '../../utils/roleRouting';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

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
        navigate(getRolePath(useAuthStore.getState().user?.role), { replace: true });
	  }
	} catch (error) {
	  console.error('Login error:', error);
	}
  };

    return (
        <div className="auth-page min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="auth-layout w-full max-w-6xl">
                <section className="auth-intro hidden lg:flex">
                    <div>
                        <Link to="/" className="auth-brand"><span className="brand-mark">S</span> SIA Living</Link>
                        <p className="auth-kicker">A better way to find home</p>
                        <h1>Come back to a place that feels like yours.</h1>
                        <p className="auth-intro-copy">Keep your apartment search, applications, payments, and conversations in one calm, connected space.</p>
                    </div>
                    <div className="auth-stat"><span>01</span><strong>One home base</strong><small>Everything you need, close at hand.</small></div>
                </section>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="auth-card max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Logo/Header Section */}
                <div className="p-8 pb-0">
                    <div className="auth-icon mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <User className="text-white h-8 w-8" />
                    </div>
                    <h2 className="auth-title text-3xl font-bold mb-1 text-center">
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
                                            className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-gray-600 rounded bg-gray-700"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="auth-link text-sm transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="auth-submit w-full py-3 px-4 text-white font-bold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200"
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
                                <span className="auth-or px-2 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLoginButton />
                        </div>
                    </div>
                </div>
                <div className="auth-footer px-8 py-4 flex justify-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="auth-link font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;