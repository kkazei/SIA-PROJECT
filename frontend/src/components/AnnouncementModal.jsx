import React, { useState } from "react";

const AnnouncementModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title || !content) {
            setError("Title and Content are required.");
            setTimeout(() => setError(""), 5000);
            return;
        }
    
        setLoading(true);
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (file) formData.append("image", file);
    
        try {
            const response = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                body: formData,
                credentials: "include", // ✅ Ensure cookies (JWT token) are sent
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to create post");
            }
    
            alert("Post created successfully!");
            setTitle("");
            setContent("");
            setFile(null);
            onClose(); // Close modal
        } catch (error) {
            console.error("Error creating post:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 w-1/3 p-6 rounded-lg shadow-lg">
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

                    <label className="block text-white mt-3">Upload Image</label>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full p-2 border rounded mt-1" 
                        accept="image/*"
                    />

                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    <button 
                        type="submit" 
                        className="mt-4 w-full bg-green-600 text-white py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Post"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementModal;
