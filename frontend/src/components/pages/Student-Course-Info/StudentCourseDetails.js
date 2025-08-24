import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { FiClock, FiDollarSign, FiCheckCircle, FiArrowLeft, FiBook, FiAward } from 'react-icons/fi';
import './StudentCourseDetails.css';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiUrl}/courses/getOneCourse/${courseId}`, {
                    headers: { 'x-auth-token': token }
                });
                setCourse(response.data);
                if (response.data.videos.length > 0) {
                    setVideoUrl(response.data.videos[0]);
                }
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching course details:', err);
                setError('Failed to fetch course details');
                setIsLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    if (isLoading) {
        return (
            <div className="cd-loading-container">
                <div className="cd-loader"></div>
            </div>
        );
    }

    if (error) return <div className="cd-error">{error}</div>;
    if (!course) return null;

    return (
        <main className='cd-main'>
            <div className="cd-course-details">
                <div className="cd-header">
                    <Link to="/student-dashboard" className="cd-back-link">
                        <FiArrowLeft /> Back to Courses
                    </Link>
                    <h1 className="cd-title">{course.title}</h1>
                    <p className="cd-description">{course.description}</p>
                    <div className="cd-info">
                        <span className="cd-info-item cd-duration"><FiClock /> {course.duration} hours</span>
                        <span className="cd-info-item cd-price"><FiDollarSign /> {course.price}</span>
                        <span className="cd-info-item cd-category"><FiBook /> {course.category}</span>
                        <span className="cd-info-item cd-difficulty"><FiAward /> {course.difficultyLevel}</span>
                    </div>
                </div>

                <div className="cd-main-content">
                    <div className="cd-left-column">
                        <img className="cd-image" src={course.imageUrl} alt={course.title} />

                        <div className="cd-what-you-learn">
                            <h3>What You Will Learn</h3>
                            <ul>
                                {course.whatYouWillLearn.map((item, index) => (
                                    <li key={index}><FiCheckCircle /> {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="cd-instructor">
                            <h3>Instructor</h3>
                            <p>Teacher ID: {course.teacher}</p>
                        </div>
                    </div>

                    <div className="cd-right-column">
                        <div className="cd-video-player">
                            <h3>Course Content</h3>
                            <div className="cd-video-container">
                                {videoUrl && (
                                    <ReactPlayer
                                        url={videoUrl}
                                        controls
                                        width='100%'
                                        height='400px'
                                        className="cd-react-player"
                                    />
                                )}
                            </div>
                            <div className="cd-video-list">
                                {course.videos.map((video, index) => (
                                    <button
                                        key={index}
                                        className={`cd-video-button ${activeLesson === index ? 'active' : ''}`}
                                        onClick={() => {
                                            setVideoUrl(video);
                                            setActiveLesson(index);
                                        }}
                                    >
                                        <span className="cd-lesson-number">{index + 1}</span>
                                        <span className="cd-lesson-title">Lesson {index + 1}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CourseDetails;