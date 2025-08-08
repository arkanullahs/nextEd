import React, { useState } from 'react';
import { MdEdit, MdDelete, MdPeople, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';
import './CourseCard.css';

const CourseCard = ({ course, onUpdate, onDelete, onComments }) => {
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
        <div className="dashboard-card course-card">
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
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="edit-btn" onClick={handleEdit}>Edit</button>
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="edit-btn" onClick={onComments}>Comments</button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;