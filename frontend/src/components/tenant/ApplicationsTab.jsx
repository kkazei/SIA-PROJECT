import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const ApplicationsTab = ({ applications, applicationsLoading, setActiveTab }) => {
  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get status badge style
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (applicationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold text-white mb-6">My Applications</h3>
      
      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <motion.div
              key={application._id}
              whileHover={{ scale: 1.01 }}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-white mb-2 sm:mb-0">{application.property?.title || "Property"}</h4>
                  {getStatusBadge(application.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 mb-2">
                      <span className="text-gray-500">Application ID: </span>
                      {application._id}
                    </p>
                    <p className="text-gray-400 mb-2 flex items-center">
                      <CalendarClock className="w-4 h-4 mr-2 text-emerald-400" />
                      <span className="text-gray-500 mr-2">Applied on:</span>
                      {formatDate(application.createdAt)}
                    </p>
                    {application.lastUpdated && (
                      <p className="text-gray-400 mb-2">
                        <span className="text-gray-500 mr-2">Last updated:</span>
                        {formatDate(application.lastUpdated)}
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Application Details</h5>
                    <ul className="space-y-1 text-gray-400">
                      <li>
                        <span className="text-gray-500 mr-2">Income:</span>
                        ${application.income}
                      </li>
                      <li>
                        <span className="text-gray-500 mr-2">Occupation:</span>
                        {application.occupation}
                      </li>
                      {application.moveInDate && (
                        <li>
                          <span className="text-gray-500 mr-2">Move-in date:</span>
                          {formatDate(application.moveInDate)}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {application.feedback && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <h5 className="text-white font-medium mb-1">Landlord Feedback</h5>
                    <p className="text-gray-300">{application.feedback}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Handle viewing application details
                      // You can add a route to view full application details
                    }}
                    className="flex items-center py-2 px-4 bg-gray-700 text-emerald-400 
                    font-medium rounded-lg hover:bg-gray-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-xl font-medium text-white mb-2">No applications found</h4>
          <p className="text-gray-400 mb-4">You haven't submitted any rental applications yet.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("properties")}
            className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-medium rounded-lg hover:from-green-600 hover:to-emerald-700"
          >
            Browse Properties
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsTab;