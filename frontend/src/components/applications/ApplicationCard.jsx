import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/date';
import { useApplicationStore } from '../../store/applicationStore';
import { Link } from 'react-router-dom';

const ApplicationCard = ({ application, userRole }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { cancelApplication, isLoading } = useApplicationStore();

    const handleCancel = async () => {
        if (confirm("Are you sure you want to cancel this application?")) {
            await cancelApplication(application._id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            case 'canceled': return 'bg-gray-500';
            default: return 'bg-yellow-500'; // pending
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-green-400">
                            {application.property?.title || 'Property Application'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Submitted on {formatDate(application.createdAt)}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Property</p>
                        <p className="text-sm text-gray-200">
                            {application.property?.address || 'Address not available'}, {application.property?.city || ''}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Move-in Date</p>
                        <p className="text-sm text-gray-200">{formatDate(application.moveInDate)}</p>
                    </div>
                </div>

                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                    >
                        {application.message && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Your Message</p>
                                <p className="text-sm text-gray-300">{application.message}</p>
                            </div>
                        )}
                        
                        {userRole === 'tenant' && application.landlordNotes && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Landlord Notes</p>
                                <p className="text-sm text-gray-300">{application.landlordNotes}</p>
                            </div>
                        )}
                        
                        {application.documents && application.documents.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Submitted Documents</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {application.documents.map((doc, index) => (
                                        <a 
                                            key={index}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-gray-300 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            {doc.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-sm text-green-400 hover:text-green-300 flex items-center"
                    >
                        {isExpanded ? 'Show Less' : 'Show More'}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex gap-2">
                        <Link 
                            to={`/properties/${application.property?._id}`} 
                            className="text-sm px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded"
                        >
                            View Property
                        </Link>
                        
                        {userRole === 'tenant' && application.status === 'pending' && (
                            <button 
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded disabled:opacity-50"
                            >
                                {isLoading ? 'Canceling...' : 'Cancel Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ApplicationCard;