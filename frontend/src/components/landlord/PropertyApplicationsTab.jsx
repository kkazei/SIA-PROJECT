import ApplicationCard from './ApplicationCard';

const PropertyApplicationsTab = ({ 
  propertyTitle, 
  applications, 
  isLoading, 
  onUpdateStatus, 
  onBack 
}) => {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-600">
          Applications for{" "}
          {propertyTitle || "Property"}
        </h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Properties
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map((application) => (
            <ApplicationCard 
              key={application._id}
              application={application}
              onUpdateStatus={onUpdateStatus}
              detailed={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600">
            You haven't received any applications for this property yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyApplicationsTab;