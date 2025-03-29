import { useEffect, useState } from "react";
import { FaEllipsisV, FaPlus } from "react-icons/fa";
import { useAnnouncementStore } from "../../store/announcementStore";

const Announcement = () => {
    // Updated property names to match your announcementStore
    const {
        announcements,
        loading,             // Changed from isLoading
        error,
        message,             // Changed from success
        getAnnouncements,    // Changed from fetchAnnouncements
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        clearMessage         // Changed from clearSuccess
    } = useAnnouncementStore();
    
    const [menuOpen, setMenuOpen] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
    
    useEffect(() => {
        getAnnouncements();  // Changed from fetchAnnouncements
    }, [getAnnouncements]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await deleteAnnouncement(id);
            setMenuOpen(null);
        } catch (error) {
            console.error("Failed to delete announcement:", error);
        }
    };

    const handleEdit = (post) => {
        setCurrentPost({
            ...post,
            image: null // Reset image file input
        });
        setEditModalOpen(true);
        setMenuOpen(null);
    };

    const handleSaveEdit = async () => {
        try {
            const formData = new FormData();
            formData.append("title", currentPost.title);
            formData.append("content", currentPost.content);
            
            if (currentPost.image) {
                formData.append("image", currentPost.image);
            } else if (currentPost.image_path) {
                // If image wasn't changed, pass the existing path
                formData.append("image_path", currentPost.image_path);
            }

            await updateAnnouncement(currentPost._id, formData);
            setEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update announcement:", error);
        }
    };
    
    const handleCreateAnnouncement = async () => {
        try {
            const formData = new FormData();
            formData.append("title", newPost.title);
            formData.append("content", newPost.content);
            
            if (newPost.image) {
                formData.append("image", newPost.image);
            }
            
            await createAnnouncement(formData);
            setCreateModalOpen(false);
            setNewPost({ title: "", content: "", image: null });
        } catch (error) {
            console.error("Failed to create announcement:", error);
        }
    };

    return (
        <div className="p-5">
            <div className="relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
                    <button 
                        onClick={() => setCreateModalOpen(true)}
                        className="hidden sm:flex bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <FaPlus className="mr-2" /> New Announcement
                    </button>
                </div>

                {/* Mobile Button */}
<button 
    onClick={() => setCreateModalOpen(true)}
    className="sm:hidden fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-lg"
>
    <FaPlus className="mr-2" /> New Announcement
</button>
            </div>
            
            <div className="p-4">
                {message && ( // Changed from success
                    <div className="bg-green-500 text-white p-3 rounded-md mb-4 flex justify-between">
                        <p>{message}</p>
                        <button onClick={clearMessage} className="text-white">✕</button>
                    </div>
                )}
                
                {loading && ( // Changed from isLoading
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.length > 0 ? (
                        announcements.map((post) => (
                            <div key={post._id} className="relative bg-white shadow-md rounded-lg overflow-hidden">
                                {post.image_path && (
                                    <img 
                                        src={post.image_path.startsWith('http') 
                                            ? post.image_path 
                                            : `http://localhost:5000${post.image_path}`
                                        } 
                                        alt="Announcement" 
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="p-4">
                                    <div className="absolute top-2 right-2 z-10">
                                        <button 
                                            onClick={() => setMenuOpen(menuOpen === post._id ? null : post._id)}
                                            className="bg-white rounded-full p-2 shadow-md"
                                        >
                                            <FaEllipsisV className="text-gray-600" />
                                        </button>
                                        {menuOpen === post._id && (
                                            <div className="absolute right-0 bg-white shadow-md border rounded-md w-28 py-1">
                                                <button 
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" 
                                                    onClick={() => handleEdit(post)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" 
                                                    onClick={() => handleDelete(post._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                    <p className="text-gray-600 mb-2">{post.content}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : !loading && ( // Changed from isLoading
                        <div className="col-span-full text-center p-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No announcements available.</p>
                            <button 
                                onClick={() => setCreateModalOpen(true)}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                                Create your first announcement
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Title</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded" 
                                value={currentPost.title} 
                                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })} 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Content</label>
                            <textarea 
                                className="w-full p-2 border rounded min-h-[100px]" 
                                value={currentPost.content} 
                                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })} 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Image</label>
                            <input 
                                type="file" 
                                className="w-full p-2 border rounded" 
                                onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.files[0] })} 
                            />
                            {currentPost.image_path && !currentPost.image && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">Current image:</p>
                                    <img 
                                        src={currentPost.image_path.startsWith('http') 
                                            ? currentPost.image_path 
                                            : `http://localhost:5000${currentPost.image_path}`
                                        }
                                        alt="Current" 
                                        className="h-20 object-cover rounded" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML += '<p class="text-sm text-red-500">Image not found</p>';
                                        }}
                                    />
                                </div>
                            )}
                            {currentPost.image && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">New image preview:</p>
                                    <img 
                                        src={URL.createObjectURL(currentPost.image)} 
                                        alt="New" 
                                        className="h-20 object-cover rounded" 
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button 
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                                onClick={handleSaveEdit}
                                disabled={loading} // Changed from isLoading
                            >
                                {loading ? 'Saving...' : 'Save'} {/* Changed from isLoading */}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Title</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded" 
                                value={newPost.title} 
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Content</label>
                            <textarea 
                                className="w-full p-2 border rounded min-h-[100px]" 
                                value={newPost.content} 
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Image (Optional)</label>
                            <input 
                                type="file" 
                                className="w-full p-2 border rounded" 
                                onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })} 
                                accept="image/*"
                            />
                            {newPost.image && (
                                <div className="mt-2">
                                    <img 
                                        src={URL.createObjectURL(newPost.image)} 
                                        alt="Preview" 
                                        className="h-20 object-cover rounded" 
                                    />
                                </div>
                            )}
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <div className="flex justify-end space-x-2">
                            <button 
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                                onClick={() => setCreateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center min-w-[100px]" 
                                onClick={handleCreateAnnouncement}
                                disabled={loading || !newPost.title || !newPost.content} // Changed from isLoading
                            >
                                {loading ? ( // Changed from isLoading
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcement;