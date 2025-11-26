const db = require('../db');

const getComments = async (req, res) => {
    const { id } = req.params; // market_id
    try {
        const result = await db.query(`
            SELECT c.id, c.content, c.created_at, COALESCE(u.name, 'Unknown User') as user_name, c.user_id
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.market_id = $1
            ORDER BY c.created_at DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

const postComment = async (req, res) => {
    const { id } = req.params; // market_id
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content is required' });
    }

    try {
        const result = await db.query(`
            INSERT INTO comments (market_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, content, created_at
        `, [id, userId, content]);

        const newComment = result.rows[0];
        // Fetch user name to return complete comment object
        const userResult = await db.query('SELECT name FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length > 0) {
            newComment.user_name = userResult.rows[0].name;
        } else {
            console.warn(`User ID ${userId} posted a comment but was not found in DB.`);
            newComment.user_name = 'Unknown User';
        }

        newComment.user_id = userId;

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
};

const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // 1. Fetch the comment to check ownership
        const commentResult = await db.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);

        if (commentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const comment = commentResult.rows[0];

        // 2. Check permissions (Admin OR Owner)
        if (userRole !== 'admin' && comment.user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        // 3. Delete
        await db.query('DELETE FROM comments WHERE id = $1', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

module.exports = {
    getComments,
    postComment,
    deleteComment
};
