import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);
export const getEnrolledCourses = () => api.get('/users/enrolledCourses');

// Admin APIs
export const getPendingUsers = () => api.get('/admin/users/pending');
export const approveUser = (userId) => api.post(`/admin/users/${userId}/approve`);
export const rejectUser = (userId) => api.post(`/admin/users/${userId}/reject`);
export const updateAnyUser = (userId, data) => api.put(`/admin/users/${userId}`, data);
export const resetUserPassword = (userId, newPassword) => api.post(`/admin/users/${userId}/reset-password`, { password: newPassword });

export const getPendingCourses = () => api.get('/admin/courses/pending');
export const approveCourse = (courseId) => api.post(`/admin/courses/${courseId}/approve`);
export const rejectCourse = (courseId) => api.post(`/admin/courses/${courseId}/reject`);

export default api;
