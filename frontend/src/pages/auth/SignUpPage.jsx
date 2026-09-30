import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../../components/ui/PasswordStrengthMeter";
import { useAuthStore } from "../../store/authStore";

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const navigate = useNavigate();

    const { signup, error, isLoading } = useAuthStore();

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match. Check both fields and try again.");
            return;
        }

        setValidationError("");

        try {
            await signup(email, password, name);
            navigate("/verify-email");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="auth-page min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="auth-layout w-full max-w-6xl">
                <section className="auth-intro hidden lg:flex">
                    <div>
                        <Link to="/" className="auth-brand"><img className="brand-mark" src="/brand-mark.svg" alt="" /> RentFlow</Link>
                        <p className="auth-kicker">Make room for what matters</p>
                        <h1>Find your next chapter, with less friction.</h1>
                        <p className="auth-intro-copy">Join a simple apartment experience for real people, real homes, and smoother days.</p>
                    </div>
                    <div className="auth-stat"><span>02</span><strong>Built around you</strong><small>From first browse to move-in day.</small></div>
                </section>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='auth-card max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden'
            >
                <div className="p-8 pb-0">
                    <Link to="/" className="auth-mobile-brand"><img className="brand-mark" src="/brand-mark.svg" alt="" /> RentFlow</Link>
                    <p className="auth-form-eyebrow">A smoother move starts here</p>
                    <h2 className='auth-title text-3xl font-bold mb-1 text-center'>Create your account</h2>
                    <p className="auth-subtitle text-center mb-6">A clear start to finding your next place.</p>
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

                    {validationError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="auth-alert mb-4 p-3 rounded-lg"
                            role="alert"
                        >
                            <p className="text-sm font-medium">{validationError}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSignUp}>
                        <label className="auth-field-label" htmlFor="signup-name">Full name</label>
                        <Input icon={User} id="signup-name" type='text' placeholder='Your name' autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <label className="auth-field-label" htmlFor="signup-email">Email address</label>
                        <Input icon={Mail} id="signup-email" type='email' placeholder='you@example.com' autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <label className="auth-field-label" htmlFor="signup-password">Password</label>
                        <Input icon={Lock} id="signup-password" type='password' placeholder='At least 8 characters' autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setValidationError(""); }} required />
                        
                        <PasswordStrengthMeter password={password} />

                        <label className="auth-field-label" htmlFor="signup-confirm-password">Confirm password</label>
                        <Input icon={Lock} id="signup-confirm-password" type='password' placeholder='Repeat your password' autoComplete="new-password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(""); }} required aria-invalid={confirmPassword.length > 0 && password !== confirmPassword} />
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                            <p className="-mt-3 text-xs text-rose-300" role="status">Passwords do not match yet.</p>
                        )}

                        <div className="pt-2">
                            <motion.button
                                className='auth-submit w-full py-3 px-4 text-white font-bold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200'
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type='submit'
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader className='w-5 h-5 animate-spin mx-auto' /> : "Create Account"}
                            </motion.button>
                        </div>
                    </form>
                    
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            
                        </div>
                        
                        <div className="mt-2 text-center">
                           
                        </div>
                    </div>
                </div>

                <div className="auth-footer px-8 py-4 flex justify-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
            </div>
        </div>
    );
};

export default SignUpPage;