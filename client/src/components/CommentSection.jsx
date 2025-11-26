import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User, Trash2 } from 'lucide-react';

const CommentSection = ({ marketId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchComments();
        checkUser();
    }, [marketId]);

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/markets/${marketId}/comments`);
            setComments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/markets/${marketId}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to post a comment');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`/api/markets/${marketId}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Add new comment to top of list
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Discussion ({comments.length})
            </h3>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Share your thoughts..." : "Login to join the discussion"}
                        disabled={!user || submitting}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-24 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!user || submitting || !newComment.trim()}
                        className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No comments yet. Be the first to start the discussion!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg group relative">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-indigo-600" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-900 text-sm">{comment.user_name}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                            {user && (user.role === 'admin' || user.id === comment.user_id) && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
