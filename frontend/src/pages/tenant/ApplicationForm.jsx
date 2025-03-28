import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../store/propertyStore';
import { useApplicationStore } from '../../store/applicationStore';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/date';

const ApplicationForm = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { getPropertyById, currentProperty, isLoading: propertyLoading } = usePropertyStore();
    const { submitApplication, isLoading: submitting, error, clearError } = useApplicationStore();
    
    const [formData, setFormData] = useState({
        moveInDate: '',
        message: '',
        documents: []
    });
    
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                await getPropertyById(propertyId);
            } catch (error) {
                console.error("Error fetching property", error);
                // Redirect if property not found
                navigate('/tenant/dashboard');
            }
        };
        
        fetchProperty();
        // Clear form errors when component unmounts
        return () => clearError();
    }, [propertyId, getPropertyById, navigate, clearError]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Format the data for API
            const applicationData = {
                propertyId,
                moveInDate: formData.moveInDate,
                message: formData.message,
                documents: [] // Can be enhanced for file uploads
            };
            
            await submitApplication(applicationData);
            navigate('/tenant/dashboard', { state: { success: true, message: 'Application submitted successfully!' } });
        } catch (error) {
            console.error("Error submitting application:", error);
            // Error is handled by the store already
        }
    };
    
    if (propertyLoading) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }
    
    if (!currentProperty) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-gray-900 rounded-xl border border-gray-800">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Property Not Found</h2>
                <p className="text-gray-300 mb-6">
                    Sorry, the property you're looking for couldn't be found.
                </p>
                <button 
                    onClick={() => navigate('/tenant/dashboard')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto mt-10 p-8 bg-gray-900 rounded-xl border border-gray-800"
        >
            <h2 className="text-2xl font-bold text-green-400 mb-6">
                Application for {currentProperty.title}
            </h2>
            
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Property</p>
                        <p className="font-medium text-white">{currentProperty.title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="font-medium text-white">
                            {currentProperty.address}, {currentProperty.city}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Monthly Rent</p>
                        <p className="font-medium text-white">${currentProperty.rentAmount}/month</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Property Type</p>
                        <p className="font-medium text-white">{currentProperty.propertyType}</p>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-300 mb-1">
                        Desired Move-In Date*
                    </label>
                    <input
                        type="date"
                        id="moveInDate"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleChange}
                        required
                        min={formatDate(new Date(), 'yyyy-MM-dd')}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                
                <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                        Message to Landlord (Optional)
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Introduce yourself and explain why you're interested in this property..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                
                {/* Document upload can be implemented here */}
                
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 rounded hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ApplicationForm;