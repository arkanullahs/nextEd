import React, { useEffect, useState } from 'react';
import api from '../../../service/API';
import './admin.css';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingComments, setPendingComments] = useState([]);
    const [reviewCourse, setReviewCourse] = useState(null);
    const [editUserModal, setEditUserModal] = useState(null);
    const [rejectCommentModal, setRejectCommentModal] = useState(null);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes, commentsRes] = await Promise.all([
                api.get('/users/admin/users?status=pending'),
                api.get('/courses/admin/pending'),
                api.get('/courses/admin/comments/pending'),
            ]);
            setPendingUsers(usersRes.data);
            setPendingCourses(coursesRes.data);
            setPendingComments(commentsRes.data);
        } catch (err) {
            setError('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const approveUser = async (id) => {
        try {
            await api.put(`/users/admin/users/${id}/approve`);
            setPendingUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err) {
            setError('Failed to approve user');
        }
    };

    const approveCourse = async (id) => {
        try {
            await api.put(`/courses/admin/${id}/approve`);
            setPendingCourses((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            setError('Failed to approve course');
        }
    };

    const approveComment = async (id) => {
        try {
            await api.put(`/courses/admin/comments/${id}/approve`);
            setPendingComments((prev) => prev.filter((c) => c._id !== id));
        } catch (err) { setError('Failed to approve comment'); }
    };

    const deleteComment = async (id) => {
        try {
            await api.delete(`/courses/admin/comments/${id}`);
            setPendingComments((prev) => prev.filter((c) => c._id !== id));
        } catch (err) { setError('Failed to delete comment'); }
    };

    const rejectCourse = async (id) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        try {
            await api.put(`/courses/admin/${id}/reject`, { reason });
            setPendingCourses((prev) => prev.filter((c) => c._id !== id));
        } catch (err) { setError('Failed to reject course'); }
    };

    const rejectComment = (comment) => setRejectCommentModal({ _id: comment._id, content: comment.content, course: comment.course, author: comment.author, reason: '' });

    const editUser = (user) => setEditUserModal(user);

    const resetPassword = async (id) => {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;
        try {
            await api.put(`/users/admin/users/${id}/reset-password`, { newPassword });
            alert('Password reset successfully');
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    if (loading) return <div style={{ paddingTop: 80, textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ paddingTop: 80, textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Panel</h1>
                <div>
                    <button className="btn" onClick={fetchData}>Refresh</button>
                </div>
            </header>
            <div className="admin-grid">
                <section className="admin-card">
                    <h2>Pending Users</h2>
                    {pendingUsers.length === 0 ? (
                        <p className="muted">No pending users</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>ID Number</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.firstName} {u.lastName}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>{u.idNumber || '-'}</td>
                                        <td>
                                            <button className="btn primary" onClick={() => approveUser(u._id)}>Approve</button>
                                            <button className="btn" onClick={() => resetPassword(u._id)}>Reset Password</button>
                                            <button className="btn" onClick={() => editUser(u)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <section className="admin-card">
                    <h2>Pending Courses</h2>
                    {pendingCourses.length === 0 ? (
                        <p className="muted">No pending courses</p>
                    ) : (
                        <div className="course-cards">
                            {pendingCourses.map((c) => (
                                <div key={c._id} className="course-card" onClick={() => setReviewCourse(c)} style={{ cursor: 'pointer' }}>
                                    <img src={c.imageUrl} alt={c.title} />
                                    <div className="course-body">
                                        <h3>{c.title}</h3>
                                        <p className="course-meta">{c.category} • {c.difficultyLevel}</p>
                                        <p className="course-meta">By: {c.teacher?.firstName} {c.teacher?.lastName} ({c.teacher?.email})</p>
                                        <p className="course-desc">{c.description}</p>
                                        <div className="what-you-learn">
                                            {(c.whatYouWillLearn || []).slice(0, 6).map((w, i) => (
                                                <span key={i} className="chip">{w}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="admin-card">
                    <h2>Pending Comments</h2>
                    {pendingComments.length === 0 ? (
                        <p className="muted">No pending comments</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Author</th>
                                    <th>Role</th>
                                    <th>Content</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingComments
                                    .sort((a, b) => (a.author?.role || '').localeCompare(b.author?.role || ''))
                                    .map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.course?.title || c.course}</td>
                                            <td>{c.author?.firstName} {c.author?.lastName}</td>
                                            <td>{c.author?.role || '-'}</td>
                                            <td>{c.content}</td>
                                            <td>{new Date(c.createdAt).toLocaleString()}</td>
                                            <td>
                                                <button className="btn primary" onClick={() => approveComment(c._id)}>Approve</button>
                                                <button className="btn" onClick={() => rejectComment(c)}>Reject</button>
                                                <button className="btn danger" onClick={() => deleteComment(c._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>

            {reviewCourse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: 'min(900px, 95vw)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3>Review Course</h3>
                            <button className="btn" onClick={() => setReviewCourse(null)}>Close</button>
                        </div>
                        <div className="dashboard-card form-card review-modal" style={{ boxShadow: 'none', border: 'none' }}>
                            <CourseForm initialData={reviewCourse} readOnly onCancel={() => setReviewCourse(null)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="btn" onClick={() => rejectCourse(reviewCourse._id)}>Reject</button>
                            <button className="btn primary" onClick={() => approveCourse(reviewCourse._id)}>Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {editUserModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: 'min(560px, 95vw)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3>Edit User</h3>
                            <button className="btn" onClick={() => setEditUserModal(null)}>Close</button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const { _id, firstName, lastName, email, role, idNumber } = editUserModal;
                                await api.put(`/users/admin/users/${_id}`, { firstName, lastName, email, role, idNumber });
                                setPendingUsers((prev) => prev.map(u => u._id === _id ? { ...u, firstName, lastName, email, role, idNumber } : u));
                                setEditUserModal(null);
                            } catch (err) { setError('Failed to update user'); }
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <input placeholder="First name" value={editUserModal.firstName || ''} onChange={(e) => setEditUserModal(prev => ({ ...prev, firstName: e.target.value }))} />
                                <input placeholder="Last name" value={editUserModal.lastName || ''} onChange={(e) => setEditUserModal(prev => ({ ...prev, lastName: e.target.value }))} />
                                <input placeholder="Email" value={editUserModal.email || ''} onChange={(e) => setEditUserModal(prev => ({ ...prev, email: e.target.value }))} style={{ gridColumn: 'span 2' }} />
                                <select value={editUserModal.role || 'student'} onChange={(e) => setEditUserModal(prev => ({ ...prev, role: e.target.value }))}>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <input placeholder="ID Number" value={editUserModal.idNumber || ''} onChange={(e) => setEditUserModal(prev => ({ ...prev, idNumber: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                                <button type="button" className="btn" onClick={() => setEditUserModal(null)}>Cancel</button>
                                <button className="btn primary" type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {rejectCommentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: 'min(560px, 95vw)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3>Reject Comment</h3>
                            <button className="btn" onClick={() => setRejectCommentModal(null)}>Close</button>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <div style={{ marginBottom: 6, color: '#555' }}>Course: {rejectCommentModal.course?.title || rejectCommentModal.course}</div>
                            <div style={{ marginBottom: 6, color: '#555' }}>Author: {rejectCommentModal.author?.firstName} {rejectCommentModal.author?.lastName} ({rejectCommentModal.author?.role})</div>
                            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 8 }}>{rejectCommentModal.content}</div>
                        </div>
                        <textarea placeholder="Reason for rejection" value={rejectCommentModal.reason} onChange={(e) => setRejectCommentModal(prev => ({ ...prev, reason: e.target.value }))} style={{ width: '100%', minHeight: 80 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <button className="btn" onClick={() => setRejectCommentModal(null)}>Cancel</button>
                            <button className="btn danger" onClick={async () => {
                                if (!rejectCommentModal.reason.trim()) return;
                                try {
                                    await api.put(`/courses/admin/comments/${rejectCommentModal._id}/reject`, { reason: rejectCommentModal.reason });
                                    setPendingComments(prev => prev.filter(c => c._id !== rejectCommentModal._id));
                                    setRejectCommentModal(null);
                                } catch (err) { setError('Failed to reject comment'); }
                            }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;


