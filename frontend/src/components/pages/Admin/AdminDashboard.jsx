import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser, rejectUser, getPendingCourses, approveCourse, rejectCourse, updateAnyUser, resetUserPassword } from '../../../service/API';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [error, setError] = useState('');

    const fetchAll = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                getPendingUsers(),
                getPendingCourses()
            ]);
            setPendingUsers(usersRes.data);
            setPendingCourses(coursesRes.data);
        } catch (e) {
            setError('Failed to load admin data');
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleApproveUser = async (id) => { await approveUser(id); fetchAll(); };
    const handleRejectUser = async (id) => { await rejectUser(id); fetchAll(); };
    const handleApproveCourse = async (id) => { await approveCourse(id); fetchAll(); };
    const handleRejectCourse = async (id) => { await rejectCourse(id); fetchAll(); };

    const handleUpdateUser = async (id, data) => { await updateAnyUser(id, data); fetchAll(); };
    const handleResetPassword = async (id) => { const pwd = prompt('New password'); if (pwd) { await resetUserPassword(id, pwd); alert('Password reset.'); } };

    return (
        <main style={{ padding: 24 }}>
            <h2>Admin Dashboard</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <section style={{ marginTop: 24 }}>
                <h3>Pending Users</h3>
                {pendingUsers.length === 0 ? <p>No pending users.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Gov ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(u => (
                                <tr key={u._id}>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td>{u.governmentIdUrl ? <a href={u.governmentIdUrl} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                                    <td>
                                        <button onClick={() => handleApproveUser(u._id)}>Approve</button>
                                        <button onClick={() => handleRejectUser(u._id)} style={{ marginLeft: 8 }}>Reject</button>
                                        <button onClick={() => handleUpdateUser(u._id, { firstName: prompt('First name', u.firstName) || u.firstName })} style={{ marginLeft: 8 }}>Edit</button>
                                        <button onClick={() => handleResetPassword(u._id)} style={{ marginLeft: 8 }}>Reset Password</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section style={{ marginTop: 24 }}>
                <h3>Pending Courses</h3>
                {pendingCourses.length === 0 ? <p>No pending courses.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Teacher</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCourses.map(c => (
                                <tr key={c._id}>
                                    <td>{c.title}</td>
                                    <td>{c.teacher}</td>
                                    <td>
                                        <button onClick={() => handleApproveCourse(c._id)}>Approve</button>
                                        <button onClick={() => handleRejectCourse(c._id)} style={{ marginLeft: 8 }}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
};

export default AdminDashboard;


