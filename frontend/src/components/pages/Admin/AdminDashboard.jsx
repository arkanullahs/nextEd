import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser, rejectUser, getPendingCourses, approveCourse, rejectCourse, updateAnyUser, resetUserPassword, adminUpdateCourse } from '../../../service/API';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [error, setError] = useState('');
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [userForm, setUserForm] = useState(null);
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [courseForm, setCourseForm] = useState(null);
    const [wylInput, setWylInput] = useState('');
    const [videoInput, setVideoInput] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectContext, setRejectContext] = useState({ type: null, id: null });
    const [rejectReason, setRejectReason] = useState('');

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
    const openRejectUser = (id) => { setRejectContext({ type: 'user', id }); setRejectReason(''); setRejectModalOpen(true); };
    const handleApproveCourse = async (id) => { await approveCourse(id); fetchAll(); };
    const openRejectCourse = (id) => { setRejectContext({ type: 'course', id }); setRejectReason(''); setRejectModalOpen(true); };

    const handleUpdateUser = async (id, data) => { await updateAnyUser(id, data); fetchAll(); };
    const handleUpdateCourse = async (id, data) => { await adminUpdateCourse(id, data); fetchAll(); };

    const openEditUser = (u) => {
        setUserForm({ _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, governmentIdUrl: u.governmentIdUrl || '' });
        setUserModalOpen(true);
    };
    const submitEditUser = async () => {
        await handleUpdateUser(userForm._id, { firstName: userForm.firstName, lastName: userForm.lastName, email: userForm.email, role: userForm.role, governmentIdUrl: userForm.governmentIdUrl });
        setUserModalOpen(false);
    };
    const openEditCourse = (c) => {
        setCourseForm({ _id: c._id, title: c.title, price: c.price, duration: c.duration, description: c.description || '', imageUrl: c.imageUrl || '', whatYouWillLearn: Array.isArray(c.whatYouWillLearn) ? [...c.whatYouWillLearn] : [], videos: Array.isArray(c.videos) ? [...c.videos] : [] });
        setWylInput('');
        setVideoInput('');
        setCourseModalOpen(true);
    };
    const submitEditCourse = async () => {
        const cleanedVideos = (courseForm.videos || []).map(v => (v || '').trim()).filter(v => v.length > 0);
        const cleanedWyl = (courseForm.whatYouWillLearn || []).map(t => (t || '').trim()).filter(t => t.length > 0);
        await handleUpdateCourse(courseForm._id, { title: courseForm.title, price: Number(courseForm.price), duration: Number(courseForm.duration), description: courseForm.description, imageUrl: courseForm.imageUrl, whatYouWillLearn: cleanedWyl, videos: cleanedVideos });
        setCourseModalOpen(false);
    };
    const submitReject = async () => {
        if (rejectContext.type === 'user') { await rejectUser(rejectContext.id, rejectReason); }
        if (rejectContext.type === 'course') { await rejectCourse(rejectContext.id, rejectReason); }
        setRejectModalOpen(false);
        setRejectContext({ type: null, id: null });
        setRejectReason('');
        fetchAll();
    };
    const handleResetPassword = async (id) => { const pwd = prompt('New password'); if (pwd) { await resetUserPassword(id, pwd); alert('Password reset.'); } };

    return (
        <main style={{ padding: 24, background: '#f6f8fb', minHeight: '100vh' }}>
            <h2 style={{ margin: 0, padding: '8px 0 16px', fontWeight: 800 }}>Admin Dashboard</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <section style={cardStyles.section}>
                <div style={cardStyles.headerRow}>
                    <h3 style={cardStyles.title}>Pending Users</h3>
                </div>
                {pendingUsers.length === 0 ? <p>No pending users.</p> : (
                    <table style={tableStyles.table}>
                        <thead>
                            <tr>
                                <th style={tableStyles.th}>Name</th>
                                <th style={tableStyles.th}>Email</th>
                                <th style={tableStyles.th}>Role</th>
                                <th style={tableStyles.th}>Gov ID</th>
                                <th style={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(u => (
                                <tr key={u._id}>
                                    <td style={tableStyles.td}>{u.firstName} {u.lastName}</td>
                                    <td style={tableStyles.td}>{u.email}</td>
                                    <td style={tableStyles.td}><span style={pill(u.role)}>{u.role}</span></td>
                                    <td style={tableStyles.td}>{u.governmentIdUrl ? <a href={u.governmentIdUrl} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                                    <td style={tableStyles.td}>
                                        <div style={cardStyles.actionsRow}>
                                            <button onClick={() => handleApproveUser(u._id)} style={btn.success}>Approve</button>
                                            <button onClick={() => openRejectUser(u._id)} style={btn.danger}>Reject</button>
                                            <button onClick={() => openEditUser(u)} style={btn.secondary}>Edit</button>
                                            <button onClick={() => handleResetPassword(u._id)} style={btn.warning}>Reset Password</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section style={cardStyles.section}>
                <div style={cardStyles.headerRow}>
                    <h3 style={cardStyles.title}>Pending Courses</h3>
                </div>
                {pendingCourses.length === 0 ? <p>No pending courses.</p> : (
                    <table style={tableStyles.table}>
                        <thead>
                            <tr>
                                <th style={tableStyles.th}>Title</th>
                                <th style={tableStyles.th}>Teacher</th>
                                <th style={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCourses.map(c => (
                                <tr key={c._id}>
                                    <td style={tableStyles.td}>{c.title}</td>
                                    <td style={tableStyles.td}>{c.teacher}</td>
                                    <td style={tableStyles.td}>
                                        <div style={cardStyles.actionsRow}>
                                            <button onClick={() => handleApproveCourse(c._id)} style={btn.success}>Approve</button>
                                            <button onClick={() => openRejectCourse(c._id)} style={btn.danger}>Reject</button>
                                            <button onClick={() => openEditCourse(c)} style={btn.secondary}>Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Modals */}
            {userModalOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3>Edit User</h3>
                        <div style={modalStyles.formRow}><label>First Name</label><input value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Last Name</label><input value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Email</label><input value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Role</label>
                            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div style={modalStyles.formRow}><label>Gov ID URL</label><input value={userForm.governmentIdUrl} onChange={e => setUserForm({ ...userForm, governmentIdUrl: e.target.value })} /></div>
                        <div style={modalStyles.actions}>
                            <button onClick={() => setUserModalOpen(false)}>Cancel</button>
                            <button onClick={submitEditUser}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {courseModalOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3>Edit Course</h3>
                        <div style={modalStyles.formRow}><label>Title</label><input value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Price</label><input type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Duration (hrs)</label><input type="number" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Description</label><textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>Image URL</label><input value={courseForm.imageUrl} onChange={e => setCourseForm({ ...courseForm, imageUrl: e.target.value })} /></div>
                        <div style={modalStyles.formRow}><label>What You Will Learn</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input value={wylInput} onChange={e => setWylInput(e.target.value)} placeholder="Add item" />
                                <button onClick={() => { if (wylInput.trim()) { setCourseForm({ ...courseForm, whatYouWillLearn: [...courseForm.whatYouWillLearn, wylInput.trim()] }); setWylInput(''); } }} type="button">Add</button>
                            </div>
                            {courseForm.whatYouWillLearn.length > 0 && (
                                <ul style={listStyles.ul}>
                                    {courseForm.whatYouWillLearn.map((item, idx) => (
                                        <li key={idx} style={listStyles.li}>
                                            <span>{item}</span>
                                            <button type="button" onClick={() => setCourseForm({ ...courseForm, whatYouWillLearn: courseForm.whatYouWillLearn.filter((_, i) => i !== idx) })}>Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div style={modalStyles.formRow}><label>Video URLs</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input value={videoInput} onChange={e => setVideoInput(e.target.value)} placeholder="Add video URL" />
                                <button onClick={() => { if (videoInput.trim()) { setCourseForm({ ...courseForm, videos: [...courseForm.videos, videoInput.trim()] }); setVideoInput(''); } }} type="button">Add</button>
                            </div>
                            {courseForm.videos.length > 0 && (
                                <ul style={listStyles.ul}>
                                    {courseForm.videos.map((url, idx) => (
                                        <li key={idx} style={listStyles.li}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{url}</span>
                                            <button type="button" onClick={() => setCourseForm({ ...courseForm, videos: courseForm.videos.filter((_, i) => i !== idx) })}>Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div style={modalStyles.actions}>
                            <button onClick={() => setCourseModalOpen(false)} style={btn.secondary}>Cancel</button>
                            <button onClick={submitEditCourse} style={btn.success}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {rejectModalOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3>Rejection Reason</h3>
                        <div style={modalStyles.formRow}><label>Reason</label><textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide a clear reason" /></div>
                        <div style={modalStyles.actions}>
                            <button onClick={() => setRejectModalOpen(false)} style={btn.secondary}>Cancel</button>
                            <button onClick={submitReject} style={btn.danger}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminDashboard;

const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: {
        background: '#fff', borderRadius: 8, padding: 20, width: 'min(600px, 92vw)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    formRow: {
        display: 'flex', flexDirection: 'column', marginBottom: 12
    },
    actions: {
        display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8
    }
};

const tableStyles = {
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
    th: { textAlign: 'left', background: '#f3f6fa', padding: '12px 14px', fontWeight: 700, fontSize: 13, color: '#5b6b7a', borderBottom: '1px solid #e6ecf2' },
    td: { padding: '12px 14px', fontSize: 14, color: '#2d3a46', borderBottom: '1px solid #eef3f7' }
};

const cardStyles = {
    section: { marginTop: 24, background: 'transparent' },
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { fontWeight: 800, margin: 0 }
};

const btnBase = { border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 };
const btn = {
    success: { ...btnBase, background: '#e6f7ef', color: '#0f766e' },
    danger: { ...btnBase, background: '#ffe8e6', color: '#b91c1c' },
    secondary: { ...btnBase, background: '#eef2f7', color: '#1f2937' },
    warning: { ...btnBase, background: '#fff7e6', color: '#8a6d3b' }
};

const listStyles = {
    ul: { listStyle: 'none', padding: 0, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 },
    li: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f9fbfc', border: '1px solid #e8eef5', borderRadius: 6, padding: '6px 8px' }
};

function pill(role) {
    const map = { student: { bg: '#e6f7ff', color: '#0369a1' }, teacher: { bg: '#e6ffe6', color: '#166534' }, admin: { bg: '#f0f0f0', color: '#111827' } };
    const cfg = map[role] || map.student;
    return { background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '4px 10px', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' };
}


