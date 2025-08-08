import React, { useEffect, useState } from 'react';
import api from '../../../service/API';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                api.get('/users/admin/users?status=pending'),
                api.get('/courses/admin/pending'),
            ]);
            setPendingUsers(usersRes.data);
            setPendingCourses(coursesRes.data);
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
        <div style={{ paddingTop: 80, paddingInline: 24 }}>
            <h1>Admin Panel</h1>
            <section style={{ marginTop: 24 }}>
                <h2>Pending Users</h2>
                {pendingUsers.length === 0 ? (
                    <p>No pending users</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th align="left">Name</th>
                                <th align="left">Email</th>
                                <th align="left">Role</th>
                                <th align="left">ID Number</th>
                                <th align="left">Actions</th>
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
                                        <button onClick={() => approveUser(u._id)}>Approve</button>
                                        <button onClick={() => resetPassword(u._id)} style={{ marginLeft: 8 }}>Reset Password</button>
                                        <button onClick={() => editUser(u)} style={{ marginLeft: 8 }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section style={{ marginTop: 24 }}>
                <h2>Pending Courses</h2>
                {pendingCourses.length === 0 ? (
                    <p>No pending courses</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th align="left">Title</th>
                                <th align="left">Teacher</th>
                                <th align="left">Category</th>
                                <th align="left">Difficulty</th>
                                <th align="left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCourses.map((c) => (
                                <tr key={c._id}>
                                    <td>{c.title}</td>
                                    <td>{c.teacher}</td>
                                    <td>{c.category}</td>
                                    <td>{c.difficultyLevel}</td>
                                    <td>
                                        <button onClick={() => approveCourse(c._id)}>Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;


