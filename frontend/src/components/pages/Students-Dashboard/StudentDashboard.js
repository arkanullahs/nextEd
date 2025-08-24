import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseList from './StudentCourseList';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState({ courses: true, enrolledCourses: true });
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchCourses();
        fetchEnrolledCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/courses`, {
                headers: { 'x-auth-token': token }
            });
            setCourses(response.data);
            setLoading(prev => ({ ...prev, courses: false }));
        } catch (err) {
            setError('Failed to fetch courses');
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/users/enrolledCourses`, {
                headers: { 'x-auth-token': token }
            });
            setEnrolledCourses(response.data);
            setLoading(prev => ({ ...prev, enrolledCourses: false }));
        } catch (err) {
            setError('Failed to fetch enrolled courses');
            setLoading(prev => ({ ...prev, enrolledCourses: false }));
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/courses/${courseId}/enroll`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchEnrolledCourses();
        } catch (err) {
            setError('Failed to enroll in course');
        }
    };

    if (loading.courses || loading.enrolledCourses) {
        return (
            <div className="sd-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) return <div className="sd-error">{error}</div>;

    const availableCourses = courses.filter(course => !enrolledCourses.some(ec => ec._id === course._id));

    return (
        <main className='sd-main-container'>
            <div className="sd-container">
                <h2 className="sd-subtitle">Enrolled Courses</h2>
                <CourseList
                    courses={enrolledCourses}
                    enrolledCourses={enrolledCourses}
                    isEnrolledList={true}
                />
                <h2 className="sd-subtitle">Available Courses</h2>
                <CourseList
                    courses={availableCourses}
                    onEnroll={handleEnroll}
                    enrolledCourses={enrolledCourses}
                    isEnrolledList={false}
                />
            </div>
        </main>
    );
};

export default StudentDashboard;