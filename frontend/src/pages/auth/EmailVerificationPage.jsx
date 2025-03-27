import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { MailCheck, Loader } from "lucide-react";

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(0);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const { error, isLoading, verifyEmail } = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle pasted content
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);

            // Focus on the last non-empty input or the first empty one
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            newCode[index] = value;
            setCode(newCode);

            // Move focus to the next input field if value is entered
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        try {
            await verifyEmail(verificationCode);
            navigate("/");
            toast.success("Email verified successfully");
        } catch (error) {
            console.log(error);
        }
    };

    const handleResendCode = async () => {
        if (resendTimeout > 0) return;

        setResendLoading(true);
        try {
            // Call your resend code function here
            // await resendVerificationCode();
            toast.success("A new verification code has been sent to your email");
            
            // Set a 60-second timeout before allowing another resend
            setResendTimeout(60);
            const timer = setInterval(() => {
                setResendTimeout((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            toast.error("Failed to resend verification code");
        } finally {
            setResendLoading(false);
        }
    };

    // Auto submit when all fields are filled
    useEffect(() => {
        if (code.every((digit) => digit !== "")) {
            handleSubmit(new Event("submit"));
        }
    }, [code]);

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
                        <MailCheck className="text-white h-8 w-8" />
                    </div>
                    <h2 className='text-3xl font-bold mb-1 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                        Verify Your Email
                    </h2>
                    <p className="text-gray-400 text-center mb-6">Enter the 6-digit code sent to your email</p>
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

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='flex justify-between gap-2'>
                            {code.map((digit, index) => (
                                <motion.input
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type='text'
                                    maxLength='6'
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className='w-full h-14 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
                                />
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type='submit'
                            disabled={isLoading || code.some((digit) => !digit)}
                            className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                            font-bold rounded-lg shadow-lg hover:from-green-600
                            hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                            focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50'
                        >
                            {isLoading ? (
                                <Loader className='w-5 h-5 animate-spin mx-auto' />
                            ) : (
                                "Verify Email"
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResendCode}
                            disabled={resendLoading || resendTimeout > 0}
                            className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="w-3 h-3 animate-spin mr-2" />
                                    Sending...
                                </span>
                            ) : resendTimeout > 0 ? (
                                `Resend code in ${resendTimeout}s`
                            ) : (
                                "Didn't receive a code? Resend"
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-8 py-4 bg-gray-900 bg-opacity-70 flex justify-center">
                    <p className="text-sm text-gray-400">
                        Wrong email?{" "}
                        <Link to="/signup" className="text-green-400 hover:text-green-300 font-medium">
                            Go back to signup
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerificationPage;