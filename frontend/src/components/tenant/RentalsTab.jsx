import { motion } from "framer-motion";
import { Home, Calendar, DollarSign, FileText } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const RentalsTab = ({ myRentals, propertiesLoading }) => {
  if (propertiesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-white">My Rentals</h3>
        <span className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
          {myRentals?.length || 0} Active
        </span>
      </div>

      {myRentals && myRentals.length > 0 ? (
        <div className="space-y-6">
          {myRentals.map((rental, index) => (
            <motion.div
              key={rental._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  {rental.images && rental.images.length > 0 ? (
                    <img 
                      src={rental.images[0]} 
                      alt={rental.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded">
                    Active
                  </div>
                </div>
                
                <div className="p-5 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      {rental.title}
                    </h4>
                    <p className="text-gray-400 mb-4">
                      {rental.address}, {rental.city}, {rental.state}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                        <div>
                          <p className="text-xs text-gray-400">Lease Period</p>
                          <p className="text-sm text-white">
                            {new Date(rental.leaseStart).toLocaleDateString()} - 
                            {new Date(rental.leaseEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
                        <div>
                          <p className="text-xs text-gray-400">Monthly Rent</p>
                          <p className="text-sm text-white">${rental.rentAmount}/mo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 
                    text-white text-sm rounded-lg">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Make Payment
                    </button>
                    <button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700
                    text-white text-sm rounded-lg">
                      <FileText className="w-4 h-4 mr-1" />
                      View Lease
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Home className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No active rentals</h3>
          <p className="text-gray-400 mb-6">You don't have any active rental properties</p>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            Browse Available Properties
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RentalsTab;