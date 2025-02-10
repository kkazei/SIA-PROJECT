import React, { useState } from 'react';
import { useApartmentStore } from '../store/apartmentStore';

const RoomModal = ({ isOpen, onClose }) => {
    const { createApartment, isLoading, error, message } = useApartmentStore();
    const [room, setRoom] = useState('');
    const [rent, setRent] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!room || !rent || !description) {
            setFormError('All fields are required.');
            return;
        }
        try {
            await createApartment(room, rent, description);
            alert('Apartment created successfully');
            onClose();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert('Error creating apartment');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 w-1/3 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-white font-semibold">Create a Room</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">X</button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <label className="block text-white">Room Name</label>
                    <input 
                        type="text" 
                        value={room} 
                        onChange={(e) => setRoom(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Room Name" 
                    />

                    <label className="block text-white mt-3">Rent</label>
                    <input 
                        type="number" 
                        value={rent} 
                        onChange={(e) => setRent(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Rent" 
                    />

                    <label className="block text-white mt-3">Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Description" 
                    />

                    {formError && <p className="text-red-500 mt-2">{formError}</p>}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {message && <p className="text-green-500 mt-2">{message}</p>}

                    <button 
                        type="submit" 
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded 
                                   transition-all duration-300 group hover:bg-black hover:bg-none"
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