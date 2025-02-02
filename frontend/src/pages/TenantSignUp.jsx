import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const TenantSignUpPage = () => {
    const [tenant_fullname, setUserFullname] = useState("");
    const [tenant_email, setUserEmail] = useState("");
    const [tenant_phone, setUserPhone] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { signupTenant, error, isLoading } = useAuthStore();

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            if (!tenant_fullname || !tenant_email || !password) {
                throw new Error("Please fill all required fields");
            }

            await signupTenant(tenant_email, password, tenant_fullname, tenant_phone);
            navigate("/dashboard"); // Navigate to the dashboard or any other page after successful signup
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >
            <form onSubmit={handleSignUp} className='p-8'>
                <h2 className='text-2xl font-bold text-white mb-6'>Sign Up</h2>
                <Input
                    icon={User}
                    type='text'
                    placeholder='Full Name'
                    value={tenant_fullname}
                    onChange={(e) => setUserFullname(e.target.value)}
                />
                <Input
                    icon={Mail}
                    type='email'
                    placeholder='Email Address'
                    value={tenant_email}
                    onChange={(e) => setUserEmail(e.target.value)}
                />
                <Input
                    icon={Phone}
                    type='text'
                    placeholder='Phone Number'
                    value={tenant_phone}
                    onChange={(e) => setUserPhone(e.target.value)}
                />
                <Input
                    icon={Lock}
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrengthMeter password={password} />
                {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
                    type='submit'
                    disabled={isLoading}
                >
                    {isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Sign Up"}
                </motion.button>
                <p className='text-sm text-gray-400 mt-4'>
                    Already have an account?{" "}
                    <Link to='/login' className='text-green-400 hover:underline'>
                        Log in
                    </Link>
                </p>
            </form>
        </motion.div>
    );
};

export default TenantSignUpPage;