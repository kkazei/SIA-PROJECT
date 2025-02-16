import { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";

const Announcement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/posts", { withCredentials: true });
            setAnnouncements(res.data.data);
        } catch (err) {
            setError("Failed to load announcements.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/posts/${id}`, { withCredentials: true });
            fetchAnnouncements();
        } catch (error) {
            alert("Failed to delete announcement.");
        }
    };

    const handleEdit = (post) => {
        setCurrentPost(post);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const formData = new FormData();
            formData.append("title", currentPost.title);
            formData.append("content", currentPost.content);
            if (currentPost.image) {
                formData.append("image", currentPost.image);
            }

            await axios.put(`http://localhost:5000/api/posts/${currentPost._id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            fetchAnnouncements();
            setEditModalOpen(false);
            setMenuOpen(null);
            setSuccessMessage("Announcement successfully updated!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            alert("Failed to update announcement.");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Announcements</h2>
            {successMessage && <div className="bg-green-500 text-white p-2 rounded mb-4">{successMessage}</div>}
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcements.length > 0 ? (
                    announcements.map((post) => (
                        <div key={post._id} className="relative bg-white shadow-md rounded-lg p-4">
                            <div className="absolute top-2 right-2">
                                <button onClick={() => setMenuOpen(menuOpen === post._id ? null : post._id)}>
                                    <FaEllipsisV className="text-gray-600 hover:text-gray-800 cursor-pointer" />
                                </button>
                                {menuOpen === post._id && (
                                    <div className="absolute right-0 bg-white shadow-md border rounded-md w-28 py-1">
                                        <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleEdit(post)}>
                                            Edit
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={() => handleDelete(post._id)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            {post.image_path && (
                                <img src={`http://localhost:5000${post.image_path}`} alt="Announcement" className="w-full h-40 object-cover rounded-md mb-3" />
                            )}
                            <h3 className="text-xl font-semibold">{post.title}</h3>
                            <p className="text-gray-600">{post.content}</p>
                        </div>
                    ))
                ) : (
                    <p>No announcements available.</p>
                )}
            </div>
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>
                        <input type="text" className="w-full p-2 border rounded mb-2" value={currentPost.title} onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })} />
                        <textarea className="w-full p-2 border rounded mb-2" value={currentPost.content} onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })} />
                        <input type="file" className="w-full p-2 border rounded mb-2" onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.files[0] })} />
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditModalOpen(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcement;
