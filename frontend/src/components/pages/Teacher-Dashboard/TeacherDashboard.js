import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';
import CourseCard from './CourseCard';
import { FaPlus, FaChalkboardTeacher, FaBook, FaUsers, FaClock } from 'react-icons/fa';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [activeComments, setActiveComments] = useState({ open: false, course: null, comments: [], newComment: '' });
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${apiUrl}/courses/teacher`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setCourses(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch courses');
            setIsLoading(false);
        }
    };

    const handleAddCourse = async (courseData) => {
        try {
            const response = await axios.post(`${apiUrl}/courses`, courseData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setCourses([...courses, response.data]);
            setShowAddCourse(false);
        } catch (err) {
            setError('Failed to add course');
        }
    };

    const handleUpdateCourse = async (id, courseData) => {
        try {
            const response = await axios.put(`${apiUrl}/courses/${id}`, courseData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setCourses(courses.map(course => course._id === id ? response.data : course));
        } catch (err) {
            setError('Failed to update course');
        }
    };

    const handleDeleteCourse = async (id) => {
        try {
            await axios.delete(`${apiUrl}/courses/${id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setCourses(courses.filter(course => course._id !== id));
        } catch (err) {
            setError('Failed to delete course');
        }
    };

    const openComments = async (course) => {
        try {
            const res = await axios.get(`${apiUrl}/courses/${course._id}/comments`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setActiveComments({ open: true, course, comments: res.data, newComment: '' });
        } catch (e) {
            setError('Failed to load comments');
        }
    };

    const postComment = async () => {
        try {
            if (!activeComments.newComment.trim()) return;
            const res = await axios.post(`${apiUrl}/courses/${activeComments.course._id}/comments`, { content: activeComments.newComment }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setActiveComments(prev => ({ ...prev, comments: [res.data, ...prev.comments], newComment: '' }));
        } catch (e) { setError('Failed to post comment'); }
    };

    if (isLoading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className='navfix'>
            <div className="teacher-dashboard">
                <header className="dashboard-header">
                    <h1 className="dashboard-title"><FaChalkboardTeacher /> Teacher Dashboard</h1>
                    <button className="add-course-btn" onClick={() => setShowAddCourse(!showAddCourse)}>
                        <FaPlus /> {showAddCourse ? 'Cancel' : 'Add New Course'}
                    </button>
                </header>

                <div className="dashboard-grid">
                    <div className="dashboard-card summary-card">
                        <div className="summary-item">
                            <FaBook className="summary-icon" />
                            <div className="summary-info">
                                <h3>{courses.length}</h3>
                                <p>Total Courses</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FaUsers className="summary-icon" />
                            <div className="summary-info">
                                <h3>{courses.reduce((sum, course) => sum + course.__v, 0)}</h3>
                                <p>Total Students</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FaClock className="summary-icon" />
                            <div className="summary-info">
                                <h3>{courses.reduce((sum, course) => sum + course.duration, 0)}</h3>
                                <p>Total Hours</p>
                            </div>
                        </div>
                    </div>

                    {showAddCourse && (
                        <div className="dashboard-card form-card">
                            <CourseForm onSubmit={handleAddCourse} />
                        </div>
                    )}

                    {courses.map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onUpdate={handleUpdateCourse}
                            onDelete={handleDeleteCourse}
                            onComments={() => openComments(course)}
                        />
                    ))}
                </div>
                {activeComments.open && (
                    <div className="dashboard-card form-card" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#fff', padding: 16, borderRadius: 12, width: 'min(720px, 92vw)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Comments: {activeComments.course.title}</h3>
                                <button onClick={() => setActiveComments({ open: false, course: null, comments: [], newComment: '' })}>Close</button>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <textarea value={activeComments.newComment} onChange={(e) => setActiveComments(prev => ({ ...prev, newComment: e.target.value }))} placeholder="Write a comment..." style={{ width: '100%', minHeight: 80 }} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button onClick={postComment} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px' }}>Post</button>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {activeComments.comments.map(c => (
                                    <li key={c._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                                        <div style={{ fontWeight: 600 }}>{c.author?.firstName} {c.author?.lastName} <span style={{ color: '#666', fontWeight: 400 }}>({c.author?.role})</span></div>
                                        <div>{c.content}</div>
                                        {!c.isApproved && <div style={{ color: '#a16207', fontSize: 12 }}>Pending approval</div>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;