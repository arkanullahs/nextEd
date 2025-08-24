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
    const [isPending, setIsPending] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [liveRoomId, setLiveRoomId] = useState(null);
    const [unenrollOpen, setUnenrollOpen] = useState(false);
    const [confirmStep, setConfirmStep] = useState(1);
    const handleUnenroll = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/courses/${courseId}/enroll`, { unenroll: true }, {
                headers: { 'x-auth-token': token }
            });
            window.location.href = '/student-dashboard';
        } catch (e) {
            setError('Failed to unenroll.');
        }
    };

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiUrl}/courses/getOneCourse/${courseId}`, {
                    headers: { 'x-auth-token': token }
                });
                setCourse(response.data);
                setIsPending(response.data.status === 'pending');
                setLiveRoomId(response.data.liveRoomId || null);
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
            <div className="cd-back-out">
                <Link to="/student-dashboard" className="cd-back-link">
                    <FiArrowLeft /> Back to Courses
                </Link>
            </div>
            <div className="cd-course-details">
                <div className="cd-header">
                    <div className="cd-header-top">
                        <h1 className="cd-title">{course.title}</h1>
                        <button onClick={() => { setConfirmStep(1); setUnenrollOpen(true); }} className="cd-unenroll-btn">Unenroll</button>
                    </div>
                    <p className="cd-description">{course.description}</p>
                    {isPending && (
                        <div className="cd-banner" role="status">
                            This course is currently under edit/review. You can continue viewing the previous approved content.
                        </div>
                    )}
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
                            {liveRoomId && (
                                <div className="cd-live-wrapper">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0 }}>Live Class</h3>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => {
                                                const iframe = document.querySelector('#jitsi-live');
                                                if (iframe && iframe.requestFullscreen) iframe.requestFullscreen();
                                            }}>Fullscreen</button>
                                            <button onClick={() => window.open(`https://meet.jit.si/${liveRoomId}`, '_blank', 'noopener,noreferrer')}>Open in tab</button>
                                        </div>
                                    </div>
                                    <div className="cd-live-iframe">
                                        <iframe
                                            id="jitsi-live"
                                            title="live-class"
                                            src={`https://meet.jit.si/${liveRoomId}`}
                                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                                            style={{ width: '100%', height: 500, border: 0, borderRadius: 8 }}
                                        />
                                    </div>
                                </div>
                            )}
                            {!liveRoomId && (
                                <div className="cd-live-wrapper" style={{ background: '#f9fafb' }}>
                                    <h3 style={{ marginTop: 0 }}>No live class currently</h3>
                                    <p style={{ marginBottom: 0 }}>
                                        {course.liveSessionsCount > 0 ? (
                                            <>Previous live classes: {course.liveSessionsCount}{course.lastLiveEndedAt ? ` (last ended ${new Date(course.lastLiveEndedAt).toLocaleString()})` : ''}</>
                                        ) : (
                                            'No live classes have been held yet.'
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {unenrollOpen && (
                <div className="cd-modal-overlay">
                    <div className="cd-modal">
                        <h3>Unenroll from this course</h3>
                        {confirmStep === 1 && (
                            <>
                                <p>Are you sure you want to unenroll? You may lose access to course content.</p>
                                <div className="cd-modal-actions">
                                    <button className="cd-btn-secondary" onClick={() => setUnenrollOpen(false)}>Cancel</button>
                                    <button className="cd-btn-danger" onClick={() => setConfirmStep(2)}>Yes, continue</button>
                                </div>
                            </>
                        )}
                        {confirmStep === 2 && (
                            <>
                                <p>Please confirm again to unenroll. This action cannot be undone.</p>
                                <div className="cd-modal-actions">
                                    <button className="cd-btn-secondary" onClick={() => setUnenrollOpen(false)}>Cancel</button>
                                    <button className="cd-btn-danger" onClick={handleUnenroll}>Confirm Unenroll</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default CourseDetails;