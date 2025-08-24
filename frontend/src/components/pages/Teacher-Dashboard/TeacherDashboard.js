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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;