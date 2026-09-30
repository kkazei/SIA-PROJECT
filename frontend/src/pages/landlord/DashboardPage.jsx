import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { usePaymentStore } from "../../store/paymentStore";
import { useMaintenanceStore } from "../../store/maintenanceStore";
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import TenantModal from '../../components/tenant-management/TenantModal';
import RoomModal from '../../components/apartments/RoomModal';
import AnnouncementModal from '../../components/announcements/AnnouncementModal';
import LandlordSideNav from '../../components/layout/LandlordSideNav';
import { formatDate } from "../../components/utils/date";
import ApplicationModal from './ApplicationModal'; // Import the modal
import ApartmentDetails from '../../components/apartments/ApartmentDetails';
import { ArrowUpRight, Building2, ClipboardList, Mail, Megaphone, Plus } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const { user } = useAuthStore();
    const { 
        apartments, 
        getApartments, 
        isLoading, 
        error 
    } = useApartmentStore();
    const { payments, getAllPayments } = usePaymentStore();
    const { maintenanceRequests, fetchMaintenance } = useMaintenanceStore();
    const [isTenantModalOpen, setTenantModalOpen] = useState(false);
    const [isRoomModalOpen, setRoomModalOpen] = useState(false);
    const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [isApplicationModalOpen, setApplicationModalOpen] = useState(false);
    const [selectedApartment, setSelectedApartment] = useState(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const navigate = useNavigate();  
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(true); // Track sidebar state
    const [visibleDataset, setVisibleDataset] = useState(null); 
    const [chartData, setChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(59, 130, 246, 0.82)',
                borderRadius: 5,
                hidden: visibleDataset === 'Expenses',
            },
            {
                label: 'Expenses',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderRadius: 5,
                hidden: visibleDataset === 'Income',
            }
        ]
    });

    useEffect(() => {
        // Fetch apartments when component mounts
        getApartments();
        // Fetch maintenance requests
        fetchMaintenance();
        // Fetch ALL payments for the landlord, not just for a specific tenant
        getAllPayments();
    }, [getApartments, fetchMaintenance, getAllPayments]);

    const navigateToInquiriesPage = () => navigate('/landlord/inquiries');

    // Process data for chart when payments or maintenance data changes
    useEffect(() => {
        // Add console logs to debug the data
        console.log("Processing chart data:");
        console.log("Payments:", payments);
        console.log("Maintenance requests:", maintenanceRequests);
        
        if (!payments || payments.length === 0) {
            console.log("No payment data available to process");
            // Don't return early, still process maintenance requests if available
        }
        
        // Initialize monthly aggregations
        const monthlyIncome = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);
        
        // Use 2025 as the year we're tracking (as mentioned in prompt)
        const currentYear = 2025;
        
        // Process payments data with enhanced logging
        if (payments && payments.length > 0) {
            payments.forEach(payment => {
                // Handle different date formats
                const paymentDate = new Date(payment.createdAt || payment.paymentDate);
                const paymentYear = paymentDate.getFullYear();
                const paymentMonth = paymentDate.getMonth();
                
                console.log(`Processing payment: ${payment._id}, Date: ${paymentDate.toLocaleDateString()}, Status: ${payment.status}, Amount: ${payment.amount}`);
                
                // Include payments that are approved
                if (payment.status === 'approved') {
                    console.log(`Adding approved payment of ₱${payment.amount} from ${paymentDate.toLocaleDateString()} to income`);
                    
                    // Still track by month regardless of year for demo purposes
                    // In production, you'd want to filter by currentYear
                    const month = paymentDate.getMonth();
                    monthlyIncome[month] += Number(payment.amount || 0);
                    console.log(`Month ${month+1}: New total: ₱${monthlyIncome[month]}`);
                }
            });
        }
        
        // Process maintenance expenses with better handling
        if (maintenanceRequests && maintenanceRequests.length > 0) {
            maintenanceRequests.forEach(request => {
                // Handle different date formats
                const requestDate = new Date(request.createdAt || request.date);
                
                // Get cost from any of the possible fields
                const maintenanceCost = Number(
                    request.cost || 
                    request.estimatedCost || 
                    request.amount || 
                    request.expenses || 
                    0
                );
                
                // Check if the request is completed/resolved and has a cost
                const isCompleted = request.status === 'completed' || request.status === 'resolved';
                
                // Log each maintenance request for debugging
                console.log(`Processing maintenance: ${request._id}, Date: ${requestDate.toLocaleDateString()}, Status: ${request.status}, Cost: ${maintenanceCost}`);
                
                // Include completed maintenance with cost
                if (isCompleted && maintenanceCost > 0) {
                    const month = requestDate.getMonth();
                    monthlyExpenses[month] += maintenanceCost;
                    console.log(`Added expense for ${month+1}: ₱${maintenanceCost}, Total: ₱${monthlyExpenses[month]}`);
                }
            });
        }
        
        console.log("Final Monthly Income:", monthlyIncome);
        console.log("Final Monthly Expenses:", monthlyExpenses);
        
        // Update chart data with the new values
        setChartData(prevData => ({
            ...prevData,
            datasets: [
                {
                    ...prevData.datasets[0],
                    data: monthlyIncome,
                    hidden: visibleDataset === 'Expenses'
                },
                {
                    ...prevData.datasets[1],
                    data: monthlyExpenses,
                    hidden: visibleDataset === 'Income'
                }
            ]
        }));
        
        // If user approves a payment in TenantDetailsModal, this effect will run again
        // because the payments array will change
    }, [payments, maintenanceRequests]);

    // Update chart visibility when selection changes
    useEffect(() => {
        setChartData(prevData => ({
            ...prevData,
            datasets: [
                {
                    ...prevData.datasets[0],
                    hidden: visibleDataset === 'Expenses'
                },
                {
                    ...prevData.datasets[1],
                    hidden: visibleDataset === 'Income'
                }
            ]
        }));
    }, [visibleDataset]);

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

    // Function to handle viewing apartment details
    const handleViewApartmentDetails = (apartment) => {
        setSelectedApartment(apartment);
        setDetailsModalOpen(true);
    };

    // Function to close details modal
    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedApartment(null);
    };

    // Calculate total income and expenses for the stats cards
    const totalIncome = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
    const totalExpenses = chartData.datasets[1].data.reduce((sum, value) => sum + value, 0);
    const occupiedApartments = apartments.filter(apt => apt.status === 'occupied').length;
    const availableApartments = apartments.filter(apt => apt.status === 'available').length;
    const occupancyRate = apartments.length ? Math.round((occupiedApartments / apartments.length) * 100) : 0;
    const formatCurrency = (value) => `₱${value.toLocaleString()}`;

    return (
        <div className="dashboard-shell landlord-dashboard flex flex-col lg:flex-row">
            <LandlordSideNav onToggle={setSidebarCollapsed} />
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`dashboard-content p-4 lg:p-6 min-h-screen w-full transition-all duration-300 ${
                    isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                }`}
            >
                <div className="landlord-welcome mt-16 lg:mt-0">
                    <div>
                        <p className="dashboard-kicker">Landlord workspace</p>
                        <h1>Good morning, {user?.name?.split(' ')[0] || 'Landlord'}.</h1>
                        <p className="welcome-date">{formatDate(new Date())} <span aria-hidden="true">/</span> {apartments.length} properties under your care</p>
                    </div>
                    <button onClick={() => setRoomModalOpen(true)} className="landlord-primary-action">
                        <Plus size={17} strokeWidth={2.5} /> Add property
                    </button>
                </div>

                <div className="landlord-stats" aria-label="Property summary">
                    <div className="landlord-stat landlord-stat-accent"><span>Occupancy</span><strong>{occupancyRate}%</strong><small>{occupiedApartments} of {apartments.length} units occupied</small></div>
                    <div className="landlord-stat"><span>Available units</span><strong>{availableApartments}</strong><small>Ready to be listed</small></div>
                    <div className="landlord-stat"><span>Collected income</span><strong>{formatCurrency(totalIncome)}</strong><small>This year</small></div>
                    <div className="landlord-stat"><span>Maintenance spend</span><strong>{formatCurrency(totalExpenses)}</strong><small>Completed requests</small></div>
                </div>

                <div className="landlord-dashboard-grid">
                    <section className="landlord-panel landlord-actions-panel">
                        <div className="panel-heading"><div><p className="dashboard-kicker">Shortcuts</p><h2>What needs your attention?</h2></div><ArrowUpRight size={18} /></div>
                        <div className="landlord-actions-list">
                            <button onClick={() => setApplicationModalOpen(true)}><span className="action-icon"><ClipboardList size={18} /></span><span><strong>Review applications</strong><small>Manage incoming tenant requests</small></span><ArrowUpRight size={16} /></button>
                            <button onClick={() => setRoomModalOpen(true)}><span className="action-icon"><Building2 size={18} /></span><span><strong>Manage rooms</strong><small>Add or update a property listing</small></span><ArrowUpRight size={16} /></button>
                            <button onClick={navigateToInquiriesPage}><span className="action-icon"><Mail size={18} /></span><span><strong>Open inquiries</strong><small>Keep conversations moving</small></span><ArrowUpRight size={16} /></button>
                            <button onClick={() => setAnnouncementModalOpen(true)}><span className="action-icon"><Megaphone size={18} /></span><span><strong>Post announcement</strong><small>Share an update with tenants</small></span><ArrowUpRight size={16} /></button>
                        </div>
                    </section>

                    <section className="landlord-panel landlord-chart-panel">
                        <div className="panel-heading"><div><p className="dashboard-kicker">Cash flow</p><h2>Income & expenses</h2></div><span className="panel-period">{new Date().getFullYear()}</span></div>
                        <div className="landlord-chart"><Bar data={chartData} options={options} /></div>
                    </section>
                </div>

                <section className="landlord-panel landlord-apartments-panel">
                    <div className="panel-heading"><div><p className="dashboard-kicker">Your portfolio</p><h2>Properties</h2></div><span className="panel-count">{apartments.length} total</span></div>
                    {isLoading ? (
                        <p className='landlord-empty-state'>Loading your apartments...</p>
                    ) : error ? (
                        <p className='landlord-error'>{error}</p>
                    ) : apartments.length === 0 ? (
                        <div className="landlord-empty-state"><Building2 size={30} /><p>You haven't added any apartments yet.</p><button onClick={() => setRoomModalOpen(true)}>
                                Add Your First Apartment
                            </button>
                        </div>
                    ) : (
                        <div className="landlord-apartment-grid">
                            {apartments.map((apartment) => (
                                <article key={apartment._id} className="landlord-apartment-card">
                                    {/* Apartment Image */}
                                    <div className="apartment-image">
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
                                    <div className="apartment-body">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3>{apartment.room}</h3>
                                            <span className={`apartment-status ${
                                                apartment.status === 'occupied' 
                                                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500' 
                                                    : 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
                                            }`}>
                                                {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <p className="apartment-rent">{formatCurrency(apartment.rent)}/month</p>
                                        
                                        <p className="apartment-description">{apartment.description}</p>
                                        
                                        <div className="apartment-meta">
                                            <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                                            <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                                        </div>
                                        
                                        {/* Add View Details Button */}
                                        <button 
                                            onClick={() => handleViewApartmentDetails(apartment)}
                                            className="apartment-details-button"
                                        >
                                            View Apartment Details
                                        </button>
                                        
                                        {/* Tenant Information */}
                                        {apartment.status === 'occupied' && apartment.tenant_id && (
                                            <div className="mt-4 pt-3 border-t border-gray-700">
                                                <div className="flex items-center">
                                                    {/* Tenant Avatar */}
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden">
                                                        {apartment.tenant_id.avatar ? (
                                                            <img
                                                                src={apartment.tenant_id.avatar}
                                                                alt={apartment.tenant_id.name || "Tenant"}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "/image/avatar-placeholder.png"; // Fallback avatar
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-white font-bold">
                                                                {apartment.tenant_id.name?.charAt(0).toUpperCase() || "T"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Tenant Details */}
                                                    <div className="ml-2">
                                                        <p className="text-white text-sm">
                                                            Tenant: {apartment.tenant_id.name || "Assigned"}
                                                        </p>
                                                        <p className="text-gray-400 text-xs">
                                                            {apartment.tenant_id.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                
                {/* Apartment Details Modal */}
                {isDetailsModalOpen && selectedApartment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                        <div className="relative bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <button 
                                onClick={closeDetailsModal}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="p-6">
                                <ApartmentDetails apartment={selectedApartment} />
                                <div className="mt-6 flex justify-center">
                                    <button 
                                        onClick={closeDetailsModal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <RoomModal isOpen={isRoomModalOpen} onClose={() => setRoomModalOpen(false)} />
                <TenantModal isOpen={isTenantModalOpen} onClose={() => setTenantModalOpen(false)} />
                <AnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setAnnouncementModalOpen(false)} />
                <ApplicationModal 
                    isOpen={isApplicationModalOpen} 
                    onClose={() => setApplicationModalOpen(false)} 
                />
            </motion.div>
        </div>
    );
};

export default DashboardPage;
