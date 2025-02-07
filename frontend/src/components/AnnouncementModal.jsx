import React, { useState } from 'react';

const AnnouncementModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Title and Content are required.');
    
            setTimeout(() => {
                setError('');
            }, 5000);
    
            return;
        }

        console.log({ title, content, file });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 w-5/3 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl text-white font-semibold">Create an Announcement</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">X</button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <label className="block text-white">Post Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Post Title" 
                    />

                    <label className="block text-white mt-3">Post Content</label>
                    <textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Enter Post Content" 
                    />

                    <label className="block text-white mt-3">Upload File</label>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full p-2 border rounded mt-1" 
                    />

                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    <button 
                        type="submit" 
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2
               transition-all duration-300 group hover:bg-black hover:bg-none rounded"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementModal;
