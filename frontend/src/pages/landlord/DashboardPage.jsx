import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import TenantModal from '../../components/TenantModal';
import RoomModal from '../../components/RoomModal';
import AnnouncementModal from '../../components/AnnouncementModal';
import LandlordSideNav from '../../components/layout/LandlordSideNav';
import { formatDate } from "../../components/utils/date";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const { user } = useAuthStore();
    const { 
        apartments, 
        getApartments, 
        isLoading, 
        error 
    } = useApartmentStore();
    const [isTenantModalOpen, setTenantModalOpen] = useState(false);
    const [isRoomModalOpen, setRoomModalOpen] = useState(false);
    const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
    const navigate = useNavigate();  

    useEffect(() => {
        // Fetch apartments when component mounts
        getApartments();
    }, [getApartments]);

    const navigateToConcernPage = () => navigate('/concerns');

    const [visibleDataset, setVisibleDataset] = useState(null); 

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000],
                backgroundColor: 'rgba(34, 197, 94, 0.8)', 
                borderRadius: 5,
                hidden: visibleDataset === 'Expenses', 
            },
            {
                label: 'Expenses',
                data: [5000, 7000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000],
                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                borderRadius: 5,
                hidden: visibleDataset === 'Income', 
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#333',
                    font: { size: 14 },
                    usePointStyle: true,
                    
                },
                onClick: (e, legendItem, legend) => {
                    const clickedLabel = legendItem.text;
                    
                    setVisibleDataset((prev) => {
                        if (prev === clickedLabel) return null; // If clicked again, show both
                        return clickedLabel; // Otherwise, show only the clicked one
                    });
                }
            },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                grid: { display: true, color: 'rgba(200, 200, 200, 0.2)' },
                ticks: { color: '#333' }
            },
            y: {
                beginAtZero: true,
                grid: { display: true, color: 'rgba(200, 200, 200, 0.5)' },
                ticks: { color: '#333' }
            }
        }
    };    

    return (
        <div className="flex flex-col lg:flex-row">
            <LandlordSideNav className="hidden lg:block" />
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className='p-4 lg:p-6 bg-blue-50 bg-gradient-to-r min-h-screen w-full lg:ml-64'
            >
                <div className='bg-white shadow-md rounded-lg p-4 lg:p-6 mt-0'>
                    <h2 className='text-xl lg:text-2xl font-bold text-gray-800'>Welcome, {user?.name || 'Landlord'}</h2>
                    <p className='text-gray-600'>{formatDate(new Date())}</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 lg:mt-6'>
                    <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'>
                        <h3 className="text-lg lg:text-xl font-bold text-white">Quick Actions</h3>
                        <div className='grid grid-cols-2 gap-2 lg:gap-4 mt-4'>
                            <button 
                                onClick={() => setTenantModalOpen(true)}
                                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/person.png" alt="Tenants" className="w-8 h-8 lg:w-12 lg:h-12"/> 
                                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Tenants</span> 
                            </button>
                            <button 
                                onClick={() => setRoomModalOpen(true)}
                                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/rename.png" alt="Rooms" className="w-8 h-8 lg:w-12 lg:h-12"/> 
                                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Rooms</span> 
                            </button>
                            <button 
                                onClick={navigateToConcernPage}
                                className='p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full'>
                                <img src="/image/envelope.png" alt="Concerns" className="w-8 h-8 lg:w-12 lg:h-12"/>
                                <span className='mt-2 lg:mt-3 text-sm lg:text-lg font-semibold'>Concerns</span> 
                            </button>
                            <button 
                                onClick={() => setAnnouncementModalOpen(true)}
                                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/announcement.png" alt="Announcements" className="w-8 h-8 lg:w-12 lg:h-12"/> 
                                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Announcements</span> 
                            </button>
                        </div>
                    </div>

                    <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'>
                        <h3 className="text-lg lg:text-xl font-bold text-white">Overview of 2024</h3>
                        <div className='mt-4 bg-gray-100 p-2 lg:p-4 rounded-lg shadow-inner'>
                            <p className='text-gray-700 text-center'>Income and Expenses</p>
                            <div className='h-40 lg:h-60'>
                                <Bar data={data} options={options} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mt-4 lg:mt-6">
                    <div className='bg-blue-900 transition duration-200 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-sm lg:text-lg font-bold'>
                            {apartments.filter(apt => apt.status === 'available').length}
                        </h4>
                        <p className='text-xs lg:text-base'>Vacant</p>
                    </div>
                    <div className='bg-green-600 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-sm lg:text-lg font-bold'>
                            {apartments.filter(apt => apt.status === 'occupied').length}
                        </h4>
                        <p className='text-xs lg:text-base'>Occupied</p>
                    </div>
                    <div className='bg-green-500 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-sm lg:text-lg font-bold'>
                            ₱{apartments
                                .filter(apt => apt.status === 'occupied')
                                .reduce((total, apt) => total + apt.rent, 0)
                                .toLocaleString()}
                        </h4>
                        <p className='text-xs lg:text-base'>Total Income</p>
                    </div>
                    <div className='bg-blue-900 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-sm lg:text-lg font-bold'>₱39,523</h4>
                        <p className='text-xs lg:text-base'>Total Expenses</p>
                    </div>
                </div>

                <div className='bg-gray-900 shadow-md rounded-lg p-6 mt-6'>
                    <h3 className='text-xl font-bold text-white'>My Apartments</h3>
                    {isLoading ? (
                        <p className='text-white'>Loading your apartments...</p>
                    ) : error ? (
                        <p className='text-red-500'>{error}</p>
                    ) : apartments.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-white">You haven't added any apartments yet.</p>
                            <button 
                                onClick={() => setRoomModalOpen(true)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            >
                                Add Your First Apartment
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {apartments.map((apartment) => (
                                <div key={apartment._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
                                    {/* Apartment Image */}
                                    <div className="h-48 overflow-hidden bg-gray-700">
                                        {apartment.images && apartment.images.length > 0 ? (
                                            <img
                                                key={apartment.images[0]} // Add key to force re-render when URL changes
                                                src={apartment.images[0]}
                                                alt={apartment.room}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/image/apartment-placeholder.jpg";
                                                    e.target.className = "w-16 h-16 opacity-30 m-auto";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                <img 
                                                    src="/image/apartment-placeholder.jpg" 
                                                    alt="Apartment Placeholder" 
                                                    className="w-16 h-16 opacity-30"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Apartment Info */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-lg font-bold text-white">{apartment.room}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                apartment.status === 'occupied' 
                                                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500' 
                                                    : 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
                                            }`}>
                                                {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <p className="text-green-400 font-semibold mb-2">₱{apartment.rent.toLocaleString()}/month</p>
                                        
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{apartment.description}</p>
                                        
                                        <div className="flex justify-between text-sm text-gray-400">
                                            <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                                            <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                                        </div>
                                        
                                        {apartment.status === 'occupied' && apartment.tenant_id && (
                                            <div className="mt-4 pt-3 border-t border-gray-700">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                                        {apartment.tenant_id.name ? apartment.tenant_id.name.charAt(0) : 'T'}
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="text-white text-sm">
                                                            Tenant: {apartment.tenant_id.name || 'Assigned'}
                                                        </p>
                                                        <p className="text-gray-400 text-xs">
                                                            {apartment.tenant_id.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <RoomModal isOpen={isRoomModalOpen} onClose={() => setRoomModalOpen(false)} />
                <TenantModal isOpen={isTenantModalOpen} onClose={() => setTenantModalOpen(false)} />
                <AnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setAnnouncementModalOpen(false)} />
            </motion.div>
        </div>
    );
};

export default DashboardPage;