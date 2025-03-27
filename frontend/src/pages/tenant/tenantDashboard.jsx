import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/date";
import { Link } from "react-router-dom";

const TenantDashboard = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className='max-w-4xl w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
        >
            <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text'>
                Tenant Dashboard
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <motion.div
                    className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className='text-xl font-semibold text-green-400 mb-3'>Welcome, {user.name}!</h3>
                    <p className='text-gray-300 mb-2'>Role: {user.role}</p>
                    <p className='text-gray-300'>Last Login: {formatDate(user.lastLogin)}</p>
                </motion.div>

                <motion.div
                    className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className='text-xl font-semibold text-green-400 mb-3'>My Apartment</h3>
                    <p className='text-gray-300'>Unit: #205</p>
                    <p className='text-gray-300'>Building: Emerald Towers</p>
                    <p className='text-gray-300'>Lease Ends: December 31, 2025</p>
                </motion.div>
            </div>

            <h3 className='text-xl font-semibold text-green-400 mb-4'>Quick Actions</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
                {quickLinks.map((link, index) => (
                    <motion.div
                        key={link.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                    >
                        <Link to={link.path}>
                            <div className='p-4 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg border border-gray-700 flex flex-col items-center'>
                                {link.icon}
                                <span className='text-green-400 mt-2'>{link.title}</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 mb-6'
            >
                <h3 className='text-xl font-semibold text-green-400 mb-3'>Recent Notifications</h3>
                {notifications.map((notification, index) => (
                    <div key={index} className='mb-2 pb-2 border-b border-gray-700 last:border-0'>
                        <p className='text-gray-300'>{notification.message}</p>
                        <p className='text-xs text-gray-500'>{notification.date}</p>
                    </div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className='mt-4'
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                    font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                >
                    Logout
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

// Sample quick action links
const quickLinks = [
    {
        title: "Pay Rent",
        path: "/tenant/payments",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    {
        title: "Maintenance",
        path: "/tenant/maintenance",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
        title: "Messages",
        path: "/tenant/messages",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    }
];

// Sample notifications
const notifications = [
    {
        message: "Maintenance request #1248 has been completed",
        date: "March 26, 2025"
    },
    {
        message: "Rent payment due in 5 days",
        date: "March 25, 2025"
    },
    {
        message: "Community event: Pool opening this weekend",
        date: "March 23, 2025"
    }
];

export default TenantDashboard;