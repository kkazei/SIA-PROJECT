import React, { useState } from 'react';

const RoomModal = ({ isOpen, onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomName || !roomNumber) {
            setError('All fields are required.');
            return;
        }
        console.log({ roomName, roomNumber, description });
        onClose();
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
                        value={roomName} 
                        onChange={(e) => setRoomName(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Room Name" 
                    />

                    <label className="block text-white mt-3">Room Number</label>
                    <input 
                        type="number" 
                        value={roomNumber} 
                        onChange={(e) => setRoomNumber(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Room Number" 
                    />

                    <label className="block text-white mt-3">Room Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Description" 
                    />

                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    <button 
    type="submit" 
    className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded 
               transition-all duration-300 group hover:bg-black hover:bg-none">
    Create Room
</button>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;