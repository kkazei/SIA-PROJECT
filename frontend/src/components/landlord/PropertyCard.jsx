import { motion } from 'framer-motion';
import PropertyLeaseInfo from './PropertyLeaseInfo';

const PropertyCard = ({ property, onEdit, onDelete, onViewApplications, onUpdateLease }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Property Image */}
      <div className="h-48 overflow-hidden relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
            }}
          />
        ) : (
          <div className="bg-gray-200 h-full flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${property.isOccupied ? 'bg-blue-500' : 'bg-green-500'}`}>
          {property.isOccupied ? 'Occupied' : 'Available'}
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
        <p className="text-gray-700 mb-2 line-clamp-2">{property.description}</p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Location:</span> {property.city}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Type:</span> {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
        </p>
        <div className="flex justify-between mb-2">
          <p className="text-gray-600">
            <span className="font-medium">Bedrooms:</span> {property.bedrooms}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Bathrooms:</span> {property.bathrooms}
          </p>
        </div>
        <p className="text-green-600 font-bold text-lg mb-3">
          ₱{property.rentAmount.toLocaleString()}/month
        </p>
        
        {/* Add Lease Information if property is occupied */}
        {property.isOccupied && property.tenant && (
          <PropertyLeaseInfo 
            property={property} 
            onUpdateLease={onUpdateLease} 
          />
        )}
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => onEdit(property)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex-1"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(property._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex-1"
            disabled={property.isOccupied}
            title={property.isOccupied ? "Cannot delete an occupied property" : ""}
          >
            Delete
          </button>
          <button 
            onClick={() => onViewApplications(property._id)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex-1"
          >
            Applications
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;