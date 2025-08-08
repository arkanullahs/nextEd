import React, { useState, useRef } from 'react';
import { MdEdit, MdDelete, MdPeople, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';
import './CourseCard.css';

const CourseCard = ({ course, onUpdate, onDelete, onComments, onLiveUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isStartingLive, setIsStartingLive] = useState(false);
    const [roomNameInput, setRoomNameInput] = useState(course.liveSession?.roomName || '');
    const [showTeacherLive, setShowTeacherLive] = useState(false);
    const liveIframeRef = useRef(null);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleUpdate = (updatedData) => {
        onUpdate(course._id, updatedData);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            onDelete(course._id);
        }
    };

    const toggleLive = async () => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const token = localStorage.getItem('token');
            if (!course.liveSession?.isLive) {
                setIsStartingLive(true);
                const res = await fetch(`${apiUrl}/courses/${course._id}/live/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ roomName: roomNameInput && roomNameInput.trim() ? roomNameInput.trim() : undefined })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data || 'Failed to start live');
                onLiveUpdated && onLiveUpdated(course._id, data.liveSession);
                // auto-open the room after starting
                setShowTeacherLive(true);
                // sync input with assigned room name if server generated a default
                if (!roomNameInput && data?.liveSession?.roomName) {
                    setRoomNameInput(data.liveSession.roomName);
                }
            } else {
                const res = await fetch(`${apiUrl}/courses/${course._id}/live/stop`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data || 'Failed to stop live');
                onLiveUpdated && onLiveUpdated(course._id, data.liveSession);
                setShowTeacherLive(false);
            }
        } catch (e) {
            alert(e.message || 'Action failed');
        } finally {
            setIsStartingLive(false);
        }
    };

    if (isEditing) {
        return (
            <div className="dashboard-card form-card">
                <CourseForm
                    onSubmit={handleUpdate}
                    initialData={course}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div
            className="dashboard-card course-card"
            style={{ gridColumn: course.liveSession?.isLive ? 'span 2' : undefined }}
        >
            <div className="course-card-image">
                <img src={course.imageUrl} alt={course.title} />
                <div className="course-card-actions">
                    <button onClick={handleEdit} className="edit-btn" aria-label="Edit course">
                        <MdEdit />
                    </button>
                    <button onClick={handleDelete} className="delete-btn" aria-label="Delete course">
                        <MdDelete />
                    </button>
                </div>
            </div>
            <div className="course-card-content">
                <h2 className="course-title">{course.title}</h2>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                    <div className="meta-item"><MdPeople /> {course.__v} students</div>
                    <div className="meta-item"><MdAccessTime /> {course.duration} hours</div>
                    <div className="meta-item"><MdAttachMoney /> {course.price}</div>
                </div>
                <div className="course-tags">
                    <span className="course-category">{course.category}</span>
                    <span className="course-difficulty">{course.difficultyLevel}</span>
                </div>
                {!course.isApproved && (
                    <div className="approval-status" style={{ marginTop: '8px', color: '#dc2626', fontWeight: '600' }}>
                        {course.rejectionReason ? `Rejected: ${course.rejectionReason}` : 'Waiting for admin approval'}
                    </div>
                )}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="edit-btn" onClick={handleEdit}>Edit</button>
                        <button className="delete-btn" onClick={handleDelete}>Delete</button>
                        <button className="edit-btn" onClick={onComments}>Comments</button>
                        {!course.liveSession?.isLive && (
                            <>
                                <input
                                    value={roomNameInput}
                                    onChange={(e) => setRoomNameInput(e.target.value)}
                                    placeholder="Room name (optional)"
                                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
                                />
                                <button className="edit-btn" onClick={toggleLive} disabled={isStartingLive}>
                                    Start Live
                                </button>
                            </>
                        )}
                        {course.liveSession?.isLive && (
                            <>
                                <button className="edit-btn" onClick={() => setShowTeacherLive(v => !v)}>
                                    {showTeacherLive ? 'Hide Room' : 'Open Room'}
                                </button>
                                <button className="delete-btn" onClick={toggleLive} disabled={isStartingLive}>
                                    Stop Live
                                </button>
                            </>
                        )}
                    </div>
                    {course.liveSession?.isLive && (
                        <div style={{ fontSize: 12, color: '#065f46' }}>
                            Live room: {course.liveSession.roomName}
                        </div>
                    )}
                    {course.liveSession?.isLive && showTeacherLive && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        const el = liveIframeRef.current;
                                        if (!el) return;
                                        const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                                        if (fn) fn.call(el);
                                    }}
                                >
                                    Fullscreen
                                </button>
                            </div>
                            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                                <iframe
                                    ref={liveIframeRef}
                                    title="Teacher Live Room"
                                    allow="camera; microphone; fullscreen; display-capture; clipboard-write"
                                    allowFullScreen
                                    src={`https://meet.jit.si/${encodeURIComponent(course.liveSession.roomName || `course_${course._id}`)}#userInfo.displayName=%22${encodeURIComponent('Teacher')}%22`}
                                    style={{ width: '100%', height: 520, border: 0 }}
                                />
                            </div>
                            <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>Powered by Jitsi Meet</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;