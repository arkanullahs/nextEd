import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiDollarSign, FiAward, FiBook } from 'react-icons/fi';
import './StudentCourseList.css';

const CourseList = ({ courses, onEnroll, enrolledCourses, isEnrolledList }) => {
    return (
        <div className="cl-course-list">
            {courses.map(course => (
                <div className="cl-course-card" key={course._id}>
                    <img className="cl-course-image" src={course.imageUrl} alt={course.title} />
                    <div className="cl-course-content">
                        <h2 className="cl-course-title">{course.title}</h2>
                        <p className="cl-course-description">{course.description}</p>
                        <div className="cl-course-tags">
                            <span className="cl-course-category">
                                <FiBook /> {course.category}
                            </span>
                            <span className="cl-course-difficulty">
                                <FiAward /> {course.difficultyLevel}
                            </span>
                        </div>
                        <div className="cl-course-details">
                            <div className="cl-course-duration-price">
                                <span className="cl-course-duration">
                                    <FiClock /> {course.duration} hours
                                </span>
                                <span className="cl-course-price">
                                    <FiDollarSign /> {course.price}
                                </span>
                            </div>
                        </div>
                        <div className="cl-button-container">
                            {!isEnrolledList && !enrolledCourses.some(c => c._id === course._id) ? (
                                <button className="cl-enroll-button" onClick={() => onEnroll(course._id)}>
                                    Enroll
                                </button>
                            ) : (
                                <Link to={`/courses/getOneCourse/${course._id}`} className="cl-view-button-link">
                                    <button className="cl-view-button">View Course</button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
