import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { usePropertyStore } from "../../store/propertyStore";
import { useApplicationStore } from "../../store/applicationStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardTabs from "../../components/tenant/DashboardTabs";

const TenantDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { 
        getAllProperties, 
        getMyRentals, 
        properties, 
        myRentals, 
        isLoading: propertiesLoading 
    } = usePropertyStore();
    const { 
        getMyApplications, 
        applications, 
        isLoading: applicationsLoading 
    } = useApplicationStore();
    
    // Local state for active tab
    const [activeTab, setActiveTab] = useState("dashboard");
    
    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === "properties") {
                await getAllProperties();
            } else if (activeTab === "applications") {
                await getMyApplications();
            } else if (activeTab === "rentals") {
                await getMyRentals();
            }
        };
        
        fetchData();
    }, [activeTab, getAllProperties, getMyApplications, getMyRentals]);

    useEffect(() => {
        getMyRentals();
    }, [getMyRentals]);

    const handleLogout = () => {
        logout();
    };
    
    const handleApplyForProperty = (propertyId) => {
        navigate(`/tenant/apply/${propertyId}`);
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-6xl mx-auto mt-10 p-6 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
        >
            <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text'>
                Tenant Dashboard
            </h2>

            <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                myRentals={myRentals}
                applications={applications}
                properties={properties}
                handleLogout={handleLogout}
                handleApplyForProperty={handleApplyForProperty}
                propertiesLoading={propertiesLoading}
                applicationsLoading={applicationsLoading}
            />
        </motion.div>
    );
};

export default TenantDashboard;