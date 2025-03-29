import React, { useState, useEffect } from "react";
import { useAnnouncementStore } from "../store/announcementStore";

const AnnouncementModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [localError, setLocalError] = useState("");
    
    // Get store functions and state - match property names with your store
    const { 
        createAnnouncement, 
        loading, // was isLoading in modal
        error, 
        message, // was success in modal
        clearMessage // was clearError in modal
    } = useAnnouncementStore();

    // Clear messages when opening/closing modal
    useEffect(() => {
        if (isOpen) {
            clearMessage();
            setLocalError("");
        }
    }, [isOpen, clearMessage]);

    // Auto-close on successful creation
    useEffect(() => {
        if (message && message.includes('successfully')) {
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        // Optional: Add file validation here
        if (selectedFile) {
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setLocalError("Please select an image file (JPEG, PNG, GIF)");
                e.target.value = ''; // Clear the input
                return;
            }
            
            // Check file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setLocalError("Image size should be less than 5MB");
                e.target.value = ''; // Clear the input
                return;
            }
        }
        
        setFile(selectedFile);
        setLocalError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Form validation
        if (!title || !content) {
            setLocalError("Title and Content are required.");
            setTimeout(() => setLocalError(""), 5000);
            return;
        }
    
        // Build form data
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (file) formData.append("image", file);
    
        try {
            // Use the store action
            await createAnnouncement(formData);
            
            // Clear form on success - we'll let the useEffect handle closing the modal
            setTitle("");
            setContent("");
            setFile(null);
        } catch (err) {
            // Error handling is managed by the store
            console.error("Error creating announcement:", err);
        }
    };
    
    // Hide modal if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h2 className="text-xl text-white font-semibold">Create an Announcement</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Announcement Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" 
                            placeholder="Enter title" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Content</label>
                        <textarea 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white min-h-[100px]" 
                            placeholder="Enter announcement content" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Image (Optional)</label>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" 
                            accept="image/*"
                        />
                        {file && (
                            <div className="mt-2 p-1 bg-gray-800 border border-gray-700 rounded flex items-center">
                                <span className="text-white text-xs truncate flex-1 px-1">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="ml-2 text-gray-400 hover:text-white p-1"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className="p-2 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-300 text-sm mb-4">
                            {message}
                        </div>
                    )}

                    {(localError || error) && (
                        <div className="p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm mb-4">
                            {localError || error}
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : "Create Announcement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementModal;