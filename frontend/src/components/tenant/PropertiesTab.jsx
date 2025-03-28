import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Home, Bed, Bath, MapPin, DollarSign, Filter } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const PropertiesTab = ({ properties, propertiesLoading, handleApplyForProperty }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter properties based on search term and filters
  const filteredProperties = properties?.filter(property => {
    // Search term filter
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Price filters
    const matchesMinPrice = filters.minPrice ? property.rentAmount >= parseInt(filters.minPrice) : true;
    const matchesMaxPrice = filters.maxPrice ? property.rentAmount <= parseInt(filters.maxPrice) : true;
    
    // Bedroom and bathroom filters
    const matchesBedrooms = filters.bedrooms ? property.bedrooms >= parseInt(filters.bedrooms) : true;
    const matchesBathrooms = filters.bathrooms ? property.bathrooms >= parseInt(filters.bathrooms) : true;
    
    // Property type filter
    const matchesPropertyType = filters.propertyType ? property.propertyType === filters.propertyType : true;
    
    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesBathrooms && matchesPropertyType;
  });

  if (propertiesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white mb-6">Find Your New Home</h3>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location, property name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            <Filter className="w-5 h-5 mr-2 text-emerald-400" />
            <span className="text-white">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bathrooms</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Any</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({
                  minPrice: "",
                  maxPrice: "",
                  bedrooms: "",
                  bathrooms: "",
                  propertyType: ""
                })}
                className="px-4 py-2 text-gray-300 hover:text-white mr-2"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Property listings */}
      {filteredProperties?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProperties.map(property => (
            <motion.div
              key={property._id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h4 className="text-xl font-semibold text-white mb-2">{property.title}</h4>
                <p className="flex items-center text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 mr-1" /> 
                  {property.street}, {property.city}, {property.state} {property.zip}
                </p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-emerald-400">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>${property.rentAmount}/month</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Bath className="w-4 h-4 mr-1" />
                    <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-4 line-clamp-2">{property.description}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleApplyForProperty(property._id)}
                  className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                  font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700"
                >
                  Apply Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <h4 className="text-xl font-medium text-white mb-2">No properties found</h4>
          <p className="text-gray-400">Try adjusting your search filters to find more options.</p>
        </div>
      )}
    </motion.div>
  );
};

export default PropertiesTab;