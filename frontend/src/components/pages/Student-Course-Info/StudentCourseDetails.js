import React, { useState, useEffect, useRef } from 'react';
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
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [seenVideos, setSeenVideos] = useState(new Set());
    const certificateRef = useRef(null);
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
                // load seen videos from localStorage (per user per course)
                try {
                    const profile = await axios.get(`${apiUrl}/users/profile`, { headers: { 'x-auth-token': token } });
                    const name = `${profile.data.firstName} ${profile.data.lastName}`;
                    setUserName(name);
                    setUserId(profile.data._id);
                    const stored = localStorage.getItem(`seen:${profile.data._id}:${response.data._id}`);
                    if (stored) setSeenVideos(new Set(JSON.parse(stored)));
                } catch (_) { /* ignore */ }
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

    const allVideosSeen = course.videos && course.videos.length > 0 && seenVideos.size >= course.videos.length;

    const markVideoSeen = (index) => {
        if (!userId) return;
        if (!seenVideos.has(index)) {
            const next = new Set(seenVideos);
            next.add(index);
            setSeenVideos(next);
            localStorage.setItem(`seen:${userId}:${course._id}`, JSON.stringify(Array.from(next)));
        }
    };

    const handleVideoProgress = (state) => {
        // state.played is 0..1
        if (state.played >= 0.9) {
            markVideoSeen(activeLesson);
        }
    };

    const handleVideoEnded = () => {
        markVideoSeen(activeLesson);
    };

    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
    });

    const generateCertificate = async () => {
        try {
            // Preload background (hosted in public/) to avoid CORS-tainted canvas
            try {
                const bg = new Image();
                bg.crossOrigin = 'anonymous';
                bg.src = `${process.env.PUBLIC_URL}/certificate-bg.png`;
                await new Promise((resolve) => { bg.onload = resolve; bg.onerror = resolve; });
            } catch (_) { /* ignore */ }

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            const html2canvas = window.html2canvas;
            const { jsPDF } = window.jspdf;
            const node = certificateRef.current;
            const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
            const safeTitle = (course.title || 'certificate').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
            pdf.save(`${safeTitle}_certificate.pdf`);
        } catch (e) {
            alert('Failed to generate certificate. Please try again.');
        }
    };

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
                                        onProgress={handleVideoProgress}
                                        onEnded={handleVideoEnded}
                                    />
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                                <button disabled={!allVideosSeen} onClick={generateCertificate} className="cd-cert-btn">
                                    Download Certificate
                                </button>
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
                                        <span className="cd-lesson-title">Lesson {index + 1}{seenVideos.has(index) ? ' • Seen' : ''}</span>
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

            {/* Hidden certificate template */}
            <div style={{ position: 'absolute', left: -99999, top: 0 }}>
                <div ref={certificateRef} className="cd-cert-template">
                    <div className="cd-cert-border" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/certificate-bg.png)` }}>
                        <h2>Certificate of Completion</h2>
                        <p>This certifies that</p>
                        <h1>{userName || 'Student'}</h1>
                        <p>has successfully completed the course</p>
                        <h3>{course.title}</h3>
                        <p className="cd-cert-date">Date: {new Date().toLocaleDateString()}</p>
                        <div className="cd-cert-sign">NextEd</div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CourseDetails;