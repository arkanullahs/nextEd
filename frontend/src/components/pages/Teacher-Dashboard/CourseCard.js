import React, { useState } from 'react';
import { MdEdit, MdDelete, MdPeople, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import CourseForm from '../Teacher-Course-Form/TeacherCourseForm';
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
            </div>
        </div>
    );
};

export default CourseCard;