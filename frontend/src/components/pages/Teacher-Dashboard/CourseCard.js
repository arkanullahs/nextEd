import React, { useState } from 'react';
import { MdEdit, MdDelete, MdPeople, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';
import { startLiveClass, stopLiveClass } from '../../../service/API';
import './CourseCard.css';

const CourseCard = ({ course, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);

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

    const handleStartLive = async () => {
        try {
            const res = await startLiveClass(course._id);
            const roomId = res.data?.liveRoomId;
            if (roomId) {
                window.open(`https://meet.jit.si/${roomId}`, '_blank', 'noopener,noreferrer');
            }
            window.location.reload();
        } catch (e) { alert('Failed to start live class'); }
    };

    const handleStopLive = async () => {
        try {
            await stopLiveClass(course._id);
            window.location.reload();
        } catch (e) { alert('Failed to stop live class'); }
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
        <div className={`dashboard-card course-card ${course.status !== 'approved' ? 'course-pending' : ''}`} title={course.status === 'pending' ? 'Pending approval' : (course.status === 'rejected' ? (course.rejectionReason || 'Rejected') : '')}>
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
                {course.liveRoomId && (
                    <div className="live-indicator">Live class is ON</div>
                )}
                {course.status === 'rejected' && (
                    <div className="rejection-banner" role="alert">
                        {course.rejectionReason || 'Rejected by admin.'}
                    </div>
                )}
                <div className="course-meta">
                    <div className="meta-item"><MdPeople /> {course.__v} students</div>
                    <div className="meta-item"><MdAccessTime /> {course.duration} hours</div>
                    <div className="meta-item"><MdAttachMoney /> {course.price}</div>
                </div>
                <div className="course-tags">
                    <span className="course-category">{course.category}</span>
                    <span className="course-difficulty">{course.difficultyLevel}</span>
                    {course.status === 'pending' && <span className="course-status pending">Pending</span>}
                    {course.status === 'rejected' && <span className="course-status rejected" title={course.rejectionReason || 'Rejected'}>Rejected</span>}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    {!course.liveRoomId ? (
                        <button onClick={handleStartLive} className="edit-btn">Start Live Class</button>
                    ) : (
                        <button onClick={handleStopLive} className="delete-btn">End Live Class</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;