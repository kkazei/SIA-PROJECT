import React, { useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import Swal from "sweetalert2";
import { FaIdCard, FaFileUpload, FaTimesCircle } from "react-icons/fa";

const ApplyApartmentModal = ({ isOpen, closeModal, apartment }) => {
  const [moveInDate, setMoveInDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [duration, setDuration] = useState(1);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // For multi-step form
  const [showInfo, setShowInfo] = useState(false); // For collapsible info section
  
  // Add state for document uploads
  const [validId, setValidId] = useState(null);
  const [validIdPreview, setValidIdPreview] = useState("");
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [additionalDocsPreview, setAdditionalDocsPreview] = useState([]);

  const { submitApplication, loading, error, message, clearMessages } = useApplicationStore();

  // Calculate minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  // Handle valid ID upload
  const handleValidIdChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({...errors, validId: "File too large. Maximum size is 5MB"});
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors({...errors, validId: "Only JPEG, PNG, or PDF files are allowed"});
      return;
    }
    
    setValidId(file);
    setErrors({...errors, validId: ""});
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setValidIdPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, show a generic preview
      setValidIdPreview("pdf");
    }
  };
  
  // Handle additional documents upload
  const handleAdditionalDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Check if adding these would exceed the limit
    if (additionalDocs.length + files.length > 3) {
      setErrors({...errors, additionalDocs: "Maximum 3 additional documents allowed"});
      return;
    }
    
    // Validate each file
    const invalidFiles = files.filter(file => {
      // Check size
      if (file.size > 5 * 1024 * 1024) return true;
      
      // Check type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) return true;
      
      return false;
    });
    
    if (invalidFiles.length > 0) {
      setErrors({...errors, additionalDocs: "Some files were rejected. Only JPEG, PNG, or PDF files under 5MB are allowed."});
      return;
    }
    
    setAdditionalDocs([...additionalDocs, ...files]);
    setErrors({...errors, additionalDocs: ""});
    
    // Create previews
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setAdditionalDocsPreview(prev => [...prev, {
            file: file.name,
            preview: reader.result,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, add a generic preview
        setAdditionalDocsPreview(prev => [...prev, {
          file: file.name,
          preview: null,
          type: 'pdf'
        }]);
      }
    });
  };
  
  // Remove an additional document
  const removeAdditionalDoc = (index) => {
    setAdditionalDocs(additionalDocs.filter((_, i) => i !== index));
    setAdditionalDocsPreview(additionalDocsPreview.filter((_, i) => i !== index));
  };

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
    
    // Stronger validation for duration
    const durationNum = parseInt(duration, 10);
    if (!duration || isNaN(durationNum) || durationNum < 1) {
      newErrors.duration = "Please enter a valid duration (minimum 1 month)";
    }
    
    // Validate required ID
    if (!validId) {
      newErrors.validId = "Please upload a valid ID";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Create form data to handle file uploads
      const formData = new FormData();
      
      // Make sure apartmentId is a string, not an object
      formData.append('apartmentId', apartment._id.toString());
      formData.append('moveInDate', moveInDate);
      formData.append('phoneNumber', phoneNumber.replace(/[^0-9]/g, '')); 
      formData.append('additionalComments', additionalComments || '');
      
      // Append duration as simple string value - no need for Blob
      // Make absolutely sure the duration is sent as a valid value
      const durationValue = Math.max(1, parseInt(duration, 10) || 1);
      console.log('Duration value before append:', durationValue);
      formData.append('duration', durationValue.toString());
      
      console.log('Checking duration in FormData:', formData.get('duration'));
      
      console.log('Duration being sent:', durationValue);
      
      // Check file name and type before appending
      console.log('Valid ID file:', validId.name, validId.type, validId.size);
      formData.append('validId', validId, validId.name);
      
      // Debug form data
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }
      
      // Append additional documents
      if (additionalDocs.length > 0) {
        additionalDocs.forEach(doc => {
          console.log('Additional doc:', doc.name, doc.type, doc.size);
          formData.append('additionalDocuments', doc, doc.name);
        });
      }
      
      const result = await submitApplication(formData);
      console.log("Submission successful:", result);
      
      // Rest of your success handling code remains the same
      Swal.fire({
        title: "Application Submitted!",
        text: "The landlord will review your application and notify you.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit application:", err);
      
      // Get the specific error message from the response
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || "Failed to submit your application. Please try again.";
      
      // Log the complete error response for better debugging
      console.log("Complete error response:", errorResponse);
      console.log("Error details:", errorMessage);
      
      // Show the specific error message to the user
      Swal.fire({
        title: "Submission Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Rest of the component remains the same...

  if (!isOpen || !apartment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-3">
          <h3 className="text-xl font-medium">Apply for Apartment</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - Same as before */}
            <div>
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-lg">{apartment.room}</h4>
                <p className="text-gray-700">₱{apartment.rent?.toLocaleString()}/month</p>
                {apartment.description && (
                  <p className="text-gray-600 text-sm mt-2">{apartment.description}</p>
                )}
              </div>

              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-sm">
                <h5 className="font-semibold text-blue-800 mb-1">Important information:</h5>
                <ul className="list-disc list-inside text-blue-700 space-y-1 text-xs">
                  <li>Your first rent payment will be due 1 month after your move-in date</li>
                  <li>You can only be assigned to one apartment at a time</li>
                  <li>If approved, pending applications will be automatically withdrawn</li>
                  <li>Your lease duration will determine your contract length</li>
                  <li><strong>A valid government-issued ID is required for all applications</strong></li>
                  <li>Additional supporting documents may strengthen your application</li>
                </ul>
              </div>

              {/* Message displays */}
              {message && (
                <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded text-sm">
                  <div className="flex">
                    <svg className="h-4 w-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="font-medium">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm">
                  <div className="flex">
                    <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Valid ID Preview */}
              {validIdPreview && (
                <div className="mb-4">
                  <h5 className="font-medium text-sm mb-2 text-gray-700">ID Preview:</h5>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    {validIdPreview === "pdf" ? (
                      <div className="flex items-center text-gray-700">
                        <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span>PDF Document</span>
                      </div>
                    ) : (
                      <img src={validIdPreview} alt="ID Preview" className="h-32 object-contain mx-auto" />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column with form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Same fields as before */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Move-in Date*
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={moveInDate}
                      onChange={(e) => {
                        setMoveInDate(e.target.value);
                        setErrors({...errors, moveInDate: ""});
                      }}
                      className={`shadow appearance-none border ${
                        errors.moveInDate ? "border-red-500" : "border-gray-300"
                      } rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline`}
                    />
                    {errors.moveInDate && (
                      <p className="text-red-500 text-xs italic">{errors.moveInDate}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      First rent due: {moveInDate ? 
                        new Date(new Date(moveInDate).setMonth(new Date(moveInDate).getMonth() + 1)).toLocaleDateString() : 
                        'one month after move-in'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Lease Duration (months)*
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => {
                        const value = Math.max(1, parseInt(e.target.value) || 1);
                        setDuration(value);
                        setErrors({...errors, duration: ""});
                      }}
                      className={`shadow appearance-none border ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      } rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline`}
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-xs italic">{errors.duration}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    Contact Number*
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrors({...errors, phoneNumber: ""});
                    }}
                    placeholder="Enter your contact number"
                    className={`shadow appearance-none border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>
                  )}
                </div>
                
                {/* New Valid ID upload field */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    Valid ID (Required)*
                  </label>
                  <div className={`border-2 border-dashed ${errors.validId ? "border-red-400" : "border-gray-300"} rounded-md p-4`}>
                    <div className="flex flex-col items-center justify-center">
                      <FaIdCard className="text-gray-400 text-3xl mb-2" />
                      <p className="mb-2 text-sm text-gray-500">Upload a government-issued ID</p>
                      <p className="mb-2 text-xs text-gray-500">(SSS, PhilHealth, Driver's License, Passport, etc.)</p>
                      <input
                        type="file"
                        id="validId"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleValidIdChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="validId"
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded cursor-pointer"
                      >
                        Select File
                      </label>
                      {validId && (
                        <p className="mt-2 text-xs text-gray-600">
                          Selected: {validId.name} ({(validId.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.validId && (
                    <p className="text-red-500 text-xs italic">{errors.validId}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPEG, PNG, PDF (max 5MB)
                  </p>
                </div>
                
                {/* Additional documents upload field */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    Additional Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <div className="flex flex-col items-center justify-center">
                      <FaFileUpload className="text-gray-400 text-3xl mb-2" />
                      <p className="mb-2 text-sm text-gray-500">Upload supporting documents</p>
                      <p className="mb-2 text-xs text-gray-500">(Employment certificate, payslips, character reference, etc.)</p>
                      <input
                        type="file"
                        id="additionalDocs"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleAdditionalDocsChange}
                        className="hidden"
                        multiple
                      />
                      <label
                        htmlFor="additionalDocs"
                        className={`bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded cursor-pointer ${additionalDocs.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ pointerEvents: additionalDocs.length >= 3 ? 'none' : 'auto' }}
                      >
                        Select Files (Max 3)
                      </label>
                    </div>
                  </div>
                  {errors.additionalDocs && (
                    <p className="text-red-500 text-xs italic">{errors.additionalDocs}</p>
                  )}
                  
                  {/* Additional documents preview */}
                  {additionalDocsPreview.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-xs font-medium text-gray-700">Selected documents:</h6>
                      <div className="mt-2 space-y-2">
                        {additionalDocsPreview.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="flex items-center">
                              {doc.type === 'pdf' ? (
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="text-xs truncate max-w-[160px]">{doc.file}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeAdditionalDoc(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimesCircle />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    rows="2"
                    placeholder="Any additional information you'd like to share"
                    className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1.5 px-4 rounded mr-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-4 rounded focus:outline-none focus:shadow-outline flex items-center text-sm"
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
      </div>
    </div>
  );
};

export default ApplyApartmentModal;