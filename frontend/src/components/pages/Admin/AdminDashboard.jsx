import React, { useEffect, useState } from 'react';
import api from '../../../service/API';
import './admin.css';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingComments, setPendingComments] = useState([]);

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

    const editUser = async (user) => {
        try {
            const firstName = prompt('First name:', user.firstName) ?? user.firstName;
            const lastName = prompt('Last name:', user.lastName) ?? user.lastName;
            const email = prompt('Email:', user.email) ?? user.email;
            const role = prompt('Role (student|teacher|admin):', user.role) ?? user.role;
            const idNumber = prompt('ID Number:', user.idNumber || '') ?? user.idNumber;
            await api.put(`/users/admin/users/${user._id}`, { firstName, lastName, email, role, idNumber });
            // If role became approved via edit, reflect locally
            setPendingUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, firstName, lastName, email, role, idNumber } : u));
            alert('User updated');
        } catch (err) {
            setError('Failed to update user');
        }
    };

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
                                <div key={c._id} className="course-card">
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
                                        <div className="course-actions">
                                            <button className="btn primary" onClick={() => approveCourse(c._id)}>Approve</button>
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
                                    <th>Content</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingComments.map((c) => (
                                    <tr key={c._id}>
                                        <td>{c.course?.title || c.course}</td>
                                        <td>{c.author?.firstName} {c.author?.lastName}</td>
                                        <td>{c.content}</td>
                                        <td>{new Date(c.createdAt).toLocaleString()}</td>
                                        <td>
                                            <button className="btn primary" onClick={() => approveComment(c._id)}>Approve</button>
                                            <button className="btn danger" onClick={() => deleteComment(c._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;


