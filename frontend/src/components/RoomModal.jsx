import React, { useState, useEffect } from 'react';
import { useApartmentStore } from '../store/apartmentStore';

const RoomModal = ({ isOpen, onClose }) => {
    const { createApartment, isLoading, error, message, clearMessages } = useApartmentStore();
    const [room, setRoom] = useState('');
    const [rent, setRent] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');

    // Clear form and errors when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            clearMessages();
            setFormError('');
        }
    }, [isOpen, clearMessages]);

    // Clear form after successful creation
    useEffect(() => {
        if (message && message.includes('success')) {
            setRoom('');
            setRent('');
            setDescription('');
            setFormError('');
            
            // Auto-close after successful creation with a small delay
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Validate inputs
        if (!room || !rent || !description) {
            setFormError('All fields are required.');
            return;
        }
        
        // Validate rent is a positive number
        if (isNaN(rent) || parseFloat(rent) <= 0) {
            setFormError('Rent must be a positive number.');
            return;
        }
        
        try {
            // Create apartment data object with proper types
            const apartmentData = {
                room: room.trim(),
                rent: parseFloat(rent),
                description: description.trim()
            };
            
            await createApartment(apartmentData);
            
            // Don't need to alert here since we'll show the success message from the store
            // and auto-close with the useEffect above
        } catch (err) {
            // Error is already handled by the store and displayed in the UI
            console.error('Error creating apartment:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h2 className="text-white text-xl font-semibold">Create a Room</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-200 text-lg font-bold"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
                        <label className="block text-white mb-1">Room Name</label>
                        <input 
                            type="text" 
                            value={room} 
                            onChange={(e) => setRoom(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                            placeholder="Enter Room Name" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white mb-1">Rent (₱)</label>
                        <input 
                            type="number" 
                            value={rent} 
                            onChange={(e) => setRent(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                            placeholder="Enter Rent Amount" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white mb-1">Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24" 
                            placeholder="Enter Description" 
                        />
                    </div>

                    {formError && (
                        <div className="bg-red-900 text-white p-2 rounded mb-4">
                            {formError}
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-900 text-white p-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    {message && (
                        <div className="bg-green-900 text-white p-2 rounded mb-4">
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`mt-2 w-full py-2 rounded transition-all duration-300 font-medium
                                   ${isLoading 
                                      ? 'bg-gray-600 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;