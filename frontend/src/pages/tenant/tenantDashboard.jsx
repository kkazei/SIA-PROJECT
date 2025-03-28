import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { usePropertyStore } from "../../store/propertyStore";
import { useApplicationStore } from "../../store/applicationStore";
import { formatDate } from "../../utils/date";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import ApplicationCard from "../../components/applications/ApplicationCard";

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
    
    // Search and filtering state
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        bedrooms: "",
        bathrooms: "",
        propertyType: ""
    });
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    
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

    // Filter properties based on search and filter criteria
    useEffect(() => {
        if (!properties) return;
        
        let results = [...properties];
        
        // Apply search term
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            results = results.filter(property => 
                property.title.toLowerCase().includes(term) || 
                property.address.toLowerCase().includes(term) || 
                property.city.toLowerCase().includes(term) ||
                property.description.toLowerCase().includes(term)
            );
        }
        
        // Apply filters
        if (filters.minPrice && !isNaN(filters.minPrice)) {
            results = results.filter(property => property.rentAmount >= Number(filters.minPrice));
        }
        
        if (filters.maxPrice && !isNaN(filters.maxPrice)) {
            results = results.filter(property => property.rentAmount <= Number(filters.maxPrice));
        }
        
        if (filters.bedrooms) {
            results = results.filter(property => property.bedrooms >= Number(filters.bedrooms));
        }
        
        if (filters.bathrooms) {
            results = results.filter(property => property.bathrooms >= Number(filters.bathrooms));
        }
        
        if (filters.propertyType && filters.propertyType !== "all") {
            results = results.filter(property => property.propertyType === filters.propertyType);
        }
        
        setFilteredProperties(results);
    }, [properties, searchTerm, filters]);

    const handleLogout = () => {
        logout();
    };
    
    const handleApplyForProperty = (propertyId) => {
        navigate(`/tenant/apply/${propertyId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilters({
            minPrice: "",
            maxPrice: "",
            bedrooms: "",
            bathrooms: "",
            propertyType: ""
        });
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

            <Tabs 
                defaultValue="dashboard" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="w-full mb-6">
                    <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
                    <TabsTrigger value="rentals" className="flex-1">My Rentals</TabsTrigger>
                    <TabsTrigger value="properties" className="flex-1">Find Properties</TabsTrigger>
                    <TabsTrigger value="applications" className="flex-1">My Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                        <motion.div
                            className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className='text-xl font-semibold text-green-400 mb-3'>Welcome, {user.name}!</h3>
                            <p className='text-gray-300 mb-2'>Role: {user.role}</p>
                            <p className='text-gray-300'>Email: {user.email}</p>
                        </motion.div>

                        <motion.div
                            className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className='text-xl font-semibold text-green-400 mb-3'>Housing Summary</h3>
                            {myRentals && myRentals.length > 0 ? (
                                <>
                                    <p className='text-gray-300'>
                                        You are currently renting {myRentals.length} propert{myRentals.length === 1 ? 'y' : 'ies'}
                                    </p>
                                    <p className='text-gray-300'>
                                        Current residence: {myRentals[0]?.title || 'N/A'}
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab("rentals")}
                                        className='mt-3 text-green-400 hover:text-green-300 text-sm flex items-center'
                                    >
                                        View all rentals
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className='text-gray-300'>You're not currently renting any properties</p>
                                    <button 
                                        onClick={() => setActiveTab("properties")}
                                        className='mt-3 text-green-400 hover:text-green-300 text-sm flex items-center'
                                    >
                                        Browse available properties
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </motion.div>

                        <motion.div
                            className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className='text-xl font-semibold text-green-400 mb-3'>Application Status</h3>
                            {applications.length > 0 ? (
                                <>
                                    <p className='text-gray-300'>
                                        You have {applications.length} active application(s)
                                    </p>
                                    <p className='text-gray-300'>
                                        Latest application: {applications[0]?.status || 'N/A'}
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab("applications")}
                                        className='mt-3 text-green-400 hover:text-green-300 text-sm flex items-center'
                                    >
                                        View all applications
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <p className='text-gray-300'>No active applications</p>
                            )}
                        </motion.div>
                        
                        <motion.div
                            className='p-5 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className='text-xl font-semibold text-green-400 mb-3'>Next Payment</h3>
                            {myRentals && myRentals.length > 0 ? (
                                <>
                                    <p className='text-gray-300 mb-1'>
                                        Property: {myRentals[0]?.title || 'N/A'}
                                    </p>
                                    <p className='text-gray-300 mb-1'>
                                        Amount: ${myRentals[0]?.rentAmount || 'N/A'}/month
                                    </p>
                                    <p className='text-gray-300'>
                                        Due date: {myRentals[0]?.leaseStart ? new Date(new Date(myRentals[0].leaseStart).setMonth(new Date().getMonth() + 1)).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <button 
                                        onClick={() => navigate('/tenant/payments')}
                                        className='mt-3 text-green-400 hover:text-green-300 text-sm flex items-center'
                                    >
                                        Make a payment
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <p className='text-gray-300'>No active leases</p>
                            )}
                        </motion.div>
                    </div>

                    <h3 className='text-xl font-semibold text-green-400 mb-4'>Quick Actions</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                        {quickLinks.map((link, index) => (
                            <motion.div
                                key={link.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                {link.onClick ? (
                                    <button 
                                        onClick={() => link.onClick(setActiveTab)}
                                        className="block w-full h-full"
                                    >
                                        <div className='p-4 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg border border-gray-700 flex flex-col items-center h-full'>
                                            {link.icon}
                                            <span className='text-green-400 mt-2 text-center'>{link.title}</span>
                                        </div>
                                    </button>
                                ) : (
                                    <Link to={link.path} className="block">
                                        <div className='p-4 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg border border-gray-700 flex flex-col items-center h-full'>
                                            {link.icon}
                                            <span className='text-green-400 mt-2 text-center'>{link.title}</span>
                                        </div>
                                    </Link>
                                )}
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
                </TabsContent>

                <TabsContent value="rentals">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">My Current Rentals</h3>
                        <p className="text-gray-300 mb-4">
                            Properties you are currently renting
                        </p>
                        
                        {propertiesLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                        ) : myRentals && myRentals.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {myRentals.map(property => (
                                    <RentalCard 
                                        key={property._id} 
                                        property={property} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <p className="text-gray-400 mb-2">You're not currently renting any properties</p>
                                <button 
                                    onClick={() => setActiveTab("properties")}
                                    className="text-green-400 hover:text-green-300 font-medium"
                                >
                                    Browse available properties
                                </button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="properties">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">Available Properties</h3>
                        <p className="text-gray-300 mb-4">
                            Browse available properties and submit applications
                        </p>
                        
                        {/* Search and Filter UI */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row gap-3 mb-3">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search by name, address, or city..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-green-500 pl-10"
                                    />
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button 
                                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center justify-center min-w-[120px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filters {Object.values(filters).some(v => v !== "") && "•"}
                                </button>
                            </div>
                            
                            {/* Filter options */}
                            {isFilterMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-gray-800 p-4 rounded-md mb-4 border border-gray-700"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    name="minPrice"
                                                    placeholder="Min $"
                                                    value={filters.minPrice}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    name="maxPrice"
                                                    placeholder="Max $"
                                                    value={filters.maxPrice}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Bedrooms</label>
                                            <select
                                                name="bedrooms"
                                                value={filters.bedrooms}
                                                onChange={handleFilterChange}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                            >
                                                <option value="">Any</option>
                                                <option value="1">1+</option>
                                                <option value="2">2+</option>
                                                <option value="3">3+</option>
                                                <option value="4">4+</option>
                                                <option value="5">5+</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Bathrooms</label>
                                            <select
                                                name="bathrooms"
                                                value={filters.bathrooms}
                                                onChange={handleFilterChange}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                            >
                                                <option value="">Any</option>
                                                <option value="1">1+</option>
                                                <option value="2">2+</option>
                                                <option value="3">3+</option>
                                                <option value="4">4+</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Property Type</label>
                                        <select
                                            name="propertyType"
                                            value={filters.propertyType}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="condo">Condo</option>
                                            <option value="townhouse">Townhouse</option>
                                            <option value="studio">Studio</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 text-gray-300 hover:text-white mr-2"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        
                        {/* Results summary */}
                        {!propertiesLoading && (
                            <div className="mb-4 flex justify-between items-center">
                                <p className="text-gray-400">
                                    Found {filteredProperties.length} properties
                                </p>
                                <div className="flex items-center">
                                    <span className="text-gray-400 text-sm mr-2">Sort by:</span>
                                    <select 
                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFilteredProperties(prev => {
                                                const sorted = [...prev];
                                                if (value === "price_low") {
                                                    sorted.sort((a, b) => a.rentAmount - b.rentAmount);
                                                } else if (value === "price_high") {
                                                    sorted.sort((a, b) => b.rentAmount - a.rentAmount);
                                                }
                                                return sorted;
                                            });
                                        }}
                                    >
                                        <option value="price_low">Price (Low to High)</option>
                                        <option value="price_high">Price (High to Low)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        {/* Properties grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {propertiesLoading ? (
                                <div className="col-span-full flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                </div>
                            ) : filteredProperties.length > 0 ? (
                                filteredProperties.map(property => (
                                    <PropertyCard 
                                        key={property._id} 
                                        property={property} 
                                        onApply={() => handleApplyForProperty(property._id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-400 mb-2">No properties match your criteria</p>
                                    <button 
                                        onClick={clearFilters}
                                        className="text-green-400 hover:text-green-300 font-medium"
                                    >
                                        Clear filters and try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="applications">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">My Applications</h3>
                        <p className="text-gray-300 mb-4">
                            Track the status of your property applications
                        </p>
                        
                        {applicationsLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                        ) : applications.length > 0 ? (
                            <div className="space-y-6">
                                {applications.map(application => (
                                    <ApplicationCard 
                                        key={application._id} 
                                        application={application} 
                                        userRole="tenant" 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-400 mb-2">You haven't submitted any applications yet</p>
                                <button 
                                    onClick={() => setActiveTab("properties")}
                                    className="text-green-400 hover:text-green-300 font-medium"
                                >
                                    Browse available properties
                                </button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

const PropertyCard = ({ property, onApply }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col h-full"
        >
            <div className="h-48 bg-gray-700 relative">
                {property.images && property.images.length > 0 ? (
                    <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    ${property.rentAmount}/mo
                </div>
            </div>
            
            <div className="p-4 flex-grow">
                <h3 className="text-xl font-semibold text-green-400 mb-1">{property.title}</h3>
                <p className="text-gray-300 text-sm mb-2">{property.address}, {property.city}</p>
                
                <div className="flex items-center text-gray-400 text-sm mb-3 space-x-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {property.propertyType}
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                        {property.bedrooms} BR
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {property.bathrooms} BA
                    </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {property.description}
                </p>
            </div>
            
            <div className="p-4 pt-0 mt-auto">
                <div className="flex space-x-2">
                    <Link 
                        to={`/properties/${property._id}`} 
                        className="flex-1 py-2 text-center text-green-400 border border-green-400 rounded-md hover:bg-green-400/10 transition-colors"
                    >
                        View Details
                    </Link>
                    <button 
                        onClick={() => onApply(property._id)}
                        className="flex-1 py-2 text-center bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const RentalCard = ({ property }) => {
    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
            <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto">
                    {property.images && property.images.length > 0 ? (
                        <img 
                            src={property.images[0]} 
                            alt={property.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    )}
                </div>
                
                <div className="p-6 md:w-2/3">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-green-400 mb-2">{property.title}</h3>
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Current Rental
                        </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{property.address}, {property.city}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-gray-400">Property Type</p>
                            <p className="text-sm text-white">{property.propertyType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Monthly Rent</p>
                            <p className="text-sm text-white font-semibold">${property.rentAmount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Bedrooms</p>
                            <p className="text-sm text-white">{property.bedrooms}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Bathrooms</p>
                            <p className="text-sm text-white">{property.bathrooms}</p>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-green-400 font-semibold mb-2">Lease Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-400">Move-in Date</p>
                                <p className="text-sm text-white">{formatDate(property.occupiedSince)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Lease Start</p>
                                <p className="text-sm text-white">{formatDate(property.leaseStart)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Lease End</p>
                                <p className="text-sm text-white">{formatDate(property.leaseEnd)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                        <Link 
                            to={`/properties/${property._id}`} 
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                        >
                            View Details
                        </Link>
                        <Link 
                            to="/tenant/maintenance" 
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                        >
                            Request Maintenance
                        </Link>
                        <Link 
                            to="/tenant/payments" 
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                            Make a Payment
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const quickLinks = [
    {
        title: "My Rentals",
        path: "#",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        onClick: (setTab) => setTab("rentals")
    },
    {
        title: "Find Properties",
        path: "#",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        onClick: (setTab) => setTab("properties")
    },
    {
        title: "My Applications",
        path: "#",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        onClick: (setTab) => setTab("applications")
    },
    {
        title: "Maintenance",
        path: "/tenant/maintenance",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
];

const notifications = [
    {
        message: "Maintenance request #1248 has been completed",
        date: "March 26, 2025"
    },
    {
        message: "Application for Emerald Towers has been approved!",
        date: "March 25, 2025"
    },
    {
        message: "Community event: Pool opening this weekend",
        date: "March 23, 2025"
    }
];

export default TenantDashboard;