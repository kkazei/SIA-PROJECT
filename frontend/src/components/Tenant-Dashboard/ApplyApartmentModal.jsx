import React, { useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import Swal from "sweetalert2"; // Import SweetAlert2

const ApplyApartmentModal = ({ isOpen, closeModal, apartment }) => {
  const [moveInDate, setMoveInDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [errors, setErrors] = useState({});

  const { submitApplication, loading, error, message, clearMessages } = useApplicationStore();

  // Calculate minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    const phoneRegex = /^\d{10,11}$/;
    if (!moveInDate) newErrors.moveInDate = "Please select a move-in date";
    if (!phoneNumber) {
      newErrors.phoneNumber = "Please provide a contact number";
    } else if (!phoneRegex.test(phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number (10-11 digits)";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await submitApplication({
        apartmentId: apartment._id,
        moveInDate,
        phoneNumber,
        additionalComments
      });
      
      // Show success alert
      Swal.fire({
        title: "Application Submitted!",
        text: "The landlord will review your application and notify you of their decision.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Close modal after successful submission
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      // Show error alert
      Swal.fire({
        title: "Submission Failed",
        text: "Failed to submit your application. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });

      console.error("Failed to submit application:", err);
    }
  };

  if (!isOpen || !apartment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Apply for Apartment</h3>
          <button onClick={closeModal} className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-lg">{apartment.room}</h4>
            <p className="text-gray-700">₱{apartment.rent?.toLocaleString()}/month</p>
            {apartment.description && (
              <p className="text-gray-600 text-sm mt-2">{apartment.description}</p>
            )}
          </div>

          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-sm">
            <h5 className="font-semibold text-blue-800 mb-2">Important information:</h5>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Your first rent payment will be due 1 month after your move-in date</li>
              <li>You can only be assigned to one apartment at a time</li>
              <li>If this application is approved, any other pending applications will be automatically withdrawn</li>
            </ul>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
              <div className="flex">
                <svg className="h-5 w-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">{message}</p>
                  <p className="text-sm mt-1">
                    The landlord will review your application and notify you of their decision. 
                    If approved, you'll be expected to move in on {moveInDate ? new Date(moveInDate).toLocaleDateString() : 'your selected date'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex">
                <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-red-700">{error}</p>
                  {error.includes('already have a pending application') && (
                    <p className="text-sm text-red-600 mt-1">
                      You can view your existing applications from the dashboard.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Desired Move-in Date*
              </label>
              <input
                type="date"
                min={today}
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className={`shadow appearance-none border ${
                  errors.moveInDate ? "border-red-500" : "border-gray-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
              {errors.moveInDate && (
                <p className="text-red-500 text-xs italic">{errors.moveInDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                First month's rent will be due on {moveInDate ? 
                  new Date(new Date(moveInDate).setMonth(new Date(moveInDate).getMonth() + 1)).toLocaleDateString() : 
                  'the date 1 month after your move-in date'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Contact Number*
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your contact number"
                className={`shadow appearance-none border ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid phone number that the landlord can contact you on
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Additional Comments
              </label>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows="3"
                placeholder="Any additional information you'd like to share"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyApartmentModal;