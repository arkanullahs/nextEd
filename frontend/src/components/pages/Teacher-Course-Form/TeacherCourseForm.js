import React, { useState } from 'react';
import {
    FaBook, FaLayerGroup, FaChartBar, FaDollarSign, FaClock, FaVideo, FaPlus, FaTrash, FaRegImage
} from 'react-icons/fa';
import { MdCheck, MdCancel } from 'react-icons/md';

import './TeacherCourseForm.css';

const CourseForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
        title: '',
        description: '',
        category: '',
        difficultyLevel: '',
        price: '',
        duration: '',
        whatYouWillLearn: [],
        videos: []
    });
    const [videoInput, setVideoInput] = useState('');
    const [whatYouWillLearnInput, setWhatYouWillLearnInput] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleVideoChange = (e) => {
        setVideoInput(e.target.value);
    };

    const handleWhatYouWillLearnChange = (e) => {
        setWhatYouWillLearnInput(e.target.value);
    };

    const addWhatYouWillLearn = () => {
        if (whatYouWillLearnInput.trim()) {
            setFormData({ ...formData, whatYouWillLearn: [...formData.whatYouWillLearn, whatYouWillLearnInput.trim()] });
            setWhatYouWillLearnInput('');
        }
    };

    const addVideo = () => {
        if (videoInput.trim()) {
            setFormData({ ...formData, videos: [...formData.videos, videoInput.trim()] });
            setVideoInput('');
        }
    };

    const removeWhatYouWillLearn = (index) => {
        const updatedWhatYouWillLearn = [...formData.whatYouWillLearn];
        updatedWhatYouWillLearn.splice(index, 1);
        setFormData({ ...formData, whatYouWillLearn: updatedWhatYouWillLearn });
    };

    const removeVideo = (index) => {
        const updatedVideos = [...formData.videos];
        updatedVideos.splice(index, 1);
        setFormData({ ...formData, videos: updatedVideos });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className="modern-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>{initialData ? 'Edit Course' : 'Add New Course'}</h2>
            </div>

            <div className="form-body">
                <div className="form-column">
                    <div className="form-group">
                        <FaRegImage className="form-icon" />
                        <input
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="Image Url"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaBook className="form-icon" />
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Course Title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaLayerGroup className="form-icon" />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Programming">Programming</option>
                            <option value="Design">Design</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <FaChartBar className="form-icon" />
                        <select
                            name="difficultyLevel"
                            value={formData.difficultyLevel}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Difficulty Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <FaDollarSign className="form-icon" />
                        <input
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Price"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaClock className="form-icon" />
                        <input
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="Duration (in hours)"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <FaLayerGroup className="form-icon" />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Course Description"
                            required
                        />
                    </div>
                </div>

                <div className="form-column">
                    <div className="image-preview">
                        <img src={formData.imageUrl} alt="Course preview" />
                    </div>



                    <div className="form-group">
                        <FaVideo className="form-icon" />
                        <input
                            name="videoInput"
                            value={videoInput}
                            onChange={handleVideoChange}
                            placeholder="Add Video Link"
                        />
                        <button type="button" onClick={addVideo} className="add-btn">
                            <FaPlus />
                        </button>
                    </div>

                    {formData.videos.length > 0 && (
                        <div className="list-group">
                            <h4>Added Videos:</h4>
                            <ul>
                                {formData.videos.map((video, index) => (
                                    <li key={index}>
                                        {video}
                                        <button type="button" onClick={() => removeVideo(index)} className="remove-btn">
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="form-group">
                        <FaLayerGroup className="form-icon" />
                        <input
                            name="whatYouWillLearnInput"
                            value={whatYouWillLearnInput}
                            onChange={handleWhatYouWillLearnChange}
                            placeholder="Add New Learning Scopes"
                        />
                        <button type="button" onClick={addWhatYouWillLearn} className="add-btn">
                            <FaPlus />
                        </button>
                    </div>

                    {formData.whatYouWillLearn.length > 0 && (
                        <div className="list-group">
                            <h4>What you will learn:</h4>
                            <ul>
                                {formData.whatYouWillLearn.map((item, index) => (
                                    <li key={index}>
                                        {item}
                                        <button type="button" onClick={() => removeWhatYouWillLearn(index)} className="remove-btn">
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-footer">

                {onCancel && (
                    <button type="button" className="cancel-btn2" onClick={onCancel}>
                        <MdCancel style={{ marginRight: '8px' }} />
                        Cancel
                    </button>
                )}
                <button type="submit" className="submit-btn">
                    <MdCheck style={{ marginRight: '8px' }} />
                    {initialData ? 'Update Course' : 'Add Course'}
                </button>
            </div>

        </form>
    );
};

export default CourseForm;