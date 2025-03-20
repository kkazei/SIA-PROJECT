import { useEffect, useState } from "react";
import { FaEllipsisV, FaPlus } from "react-icons/fa";
import { useAnnouncementStore } from "../store/announcementStore";

const Announcement = () => {
    const {
        announcements,
        isLoading,
        error,
        success,
        fetchAnnouncements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        clearSuccess
    } = useAnnouncementStore();
    
    const [menuOpen, setMenuOpen] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
    
    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await deleteAnnouncement(id);
            setMenuOpen(null);
        } catch (error) {
            alert("Failed to delete announcement.");
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
            }

            await updateAnnouncement(currentPost._id, formData);
            setEditModalOpen(false);
        } catch (error) {
            alert("Failed to update announcement.");
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
            alert("Failed to create announcement.");
        }
    };

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <FaPlus className="mr-2" /> New Announcement
                </button>
            </div>
            
            <div className="p-4">
                {success && (
                    <div className="bg-green-500 text-white p-3 rounded-md mb-4 flex justify-between">
                        <p>{success}</p>
                        <button onClick={clearSuccess} className="text-white">✕</button>
                    </div>
                )}
                
                {isLoading && (
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
                                        src={`http://localhost:5000${post.image_path}`} 
                                        alt="Announcement" 
                                        className="w-full h-48 object-cover"
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
                    ) : !isLoading && (
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
                            {currentPost.image_path && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">Current image:</p>
                                    <img 
                                        src={`http://localhost:5000${currentPost.image_path}`} 
                                        alt="Current" 
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
                            >
                                Save
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
                        <div className="flex justify-end space-x-2">
                            <button 
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                                onClick={() => setCreateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                                onClick={handleCreateAnnouncement}
                                disabled={!newPost.title || !newPost.content}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcement;
