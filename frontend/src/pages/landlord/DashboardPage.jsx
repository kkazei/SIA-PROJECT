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
        <div className="flex">
            <LandlordSideNav />
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className='p-6 bg-blue-50 bg-gradient-to-r min-h-screen w-full ml-64'
            >
                <div className='bg-white shadow-md rounded-lg p-6 mt-0'>
                    <h2 className='text-2xl font-bold text-gray-800'>Welcome, {user?.name || 'Landlord'}</h2>
                    <p className='text-gray-600'>{formatDate(new Date())}</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
                    <div className='bg-gray-900 shadow-md rounded-lg p-6'>
                        <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                            <button 
                                onClick={() => setTenantModalOpen(true)}
                                className="p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/person.png" alt="Tenants" className="w-12 h-12"/> 
                                <span className="mt-3 text-lg font-semibold">Tenants</span> 
                            </button>
                            <button 
                                onClick={() => setRoomModalOpen(true)}
                                className="p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/rename.png" alt="Rooms" className="w-12 h-12"/> 
                                <span className="mt-3 text-lg font-semibold">Rooms</span> 
                            </button>
                            <button 
                                onClick={navigateToConcernPage}
                                className='p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full'>
                                <img src="/image/envelope.png" alt="Concerns" className="w-12 h-12"/>
                                <span className='mt-3 text-lg font-semibold'>Concerns</span> 
                            </button>
                            <button 
                                onClick={() => setAnnouncementModalOpen(true)}
                                className="p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                                <img src="/image/announcement.png" alt="Announcements" className="w-12 h-12"/> 
                                <span className="mt-3 text-lg font-semibold">Announcements</span> 
                            </button>
                        </div>
                    </div>

                    <div className='bg-gray-900 shadow-md rounded-lg p-6'>
                        <h3 className="text-xl font-bold text-white">Overview of 2024</h3>
                        <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-inner'>
                            <p className='text-gray-700 text-center'>Income and Expenses</p>
                            <div className='h-60'>
                                <Bar data={data} options={options} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className='bg-blue-900 transition duration-200 text-white p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-lg font-bold'>
                            {apartments.filter(apt => apt.status === 'available').length}
                        </h4>
                        <p>Vacant</p>
                    </div>
                    <div className='bg-green-600 text-white p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-lg font-bold'>
                            {apartments.filter(apt => apt.status === 'occupied').length}
                        </h4>
                        <p>Occupied</p>
                    </div>
                    <div className='bg-green-500 text-white p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-lg font-bold'>
                            ₱{apartments
                                .filter(apt => apt.status === 'occupied')
                                .reduce((total, apt) => total + apt.rent, 0)
                                .toLocaleString()}
                        </h4>
                        <p>Total Income</p>
                    </div>
                    <div className='bg-blue-900 text-white p-4 rounded-lg text-center shadow-md'>
                        <h4 className='text-lg font-bold'>₱39,523</h4>
                        <p>Total Expenses</p>
                    </div>
                </div>

                <div className='bg-gray-900 shadow-md rounded-lg p-6 mt-6'>
                    <h3 className='text-xl font-bold text-white'>Apartment List</h3>
                    {isLoading ? (
                        <p className='text-white'>Loading...</p>
                    ) : error ? (
                        <p className='text-red-500'>{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className='w-full mt-4 border border-gray-300'>
                                <thead>
                                    <tr className='bg-white text-black'>
                                        <th className='p-2 text-left'>Apartment</th>
                                        <th className='p-2 text-left'>Rent</th>
                                        <th className='p-2 text-left'>Description</th>
                                        <th className='p-2 text-left'>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apartments.map((apartment) => (
                                        <tr key={apartment._id} className='border-t'>
                                            <td className='p-2 text-white'>{apartment.room}</td>
                                            <td className='p-2 text-white'>₱{apartment.rent.toLocaleString()}</td>
                                            <td className='p-2 text-white'>{apartment.description}</td>
                                            <td className={`p-2 ${apartment.status === 'occupied' ? 'text-yellow-500' : 'text-green-600'}`}>
                                                {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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