import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignInAlt, faUserPlus, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from './logo3.png';
import './Navigation.css';

const Navigation = () => {
    const [scrolling, setScrolling] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 767);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const history = useHistory();
    const location = useLocation();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setScrolling(true);
        } else {
            setScrolling(false);
        }
    };

    const handleResize = () => {
        setIsMobileView(window.innerWidth <= 767);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('userRole');
            setIsLoggedIn(!!token);
            setUserRole(role || '');

            if (token) {
                try {
                    const response = await axios.get(`${apiUrl}/users/profile`, {
                        headers: { 'x-auth-token': token }
                    });
                    setUserName(`${response.data.firstName} ${response.data.lastName}`);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        checkLoginStatus();
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setIsLoggedIn(false);
        setUserRole('');
        setUserName('');
        history.push('/');
    };


    return (
        <Navbar
            variant="light"
            expand="md"
            className={`menu ${scrolling ? 'scrolled' : ''} ${isMobileView ? 'mobile-view' : ''}`}
            fixed="top"
        >
            <Link to="/">
                <Navbar.Brand>
                    <motion.img
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 1 }}
                        alt="logo"
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top mx-2"
                    />
                    <span className="brand-text">NextEd</span>
                </Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    {isLoggedIn ? (
                        <>
                            {userRole === 'teacher' ? (
                                <Link to="/teacher-dashboard" className="nav-link">
                                    <FontAwesomeIcon icon={faHome} className="nav-icon" />
                                    <span className="nav-text">Dashboard</span>
                                </Link>
                            ) : (
                                <Link to="/student-dashboard" className="nav-link">
                                    <FontAwesomeIcon icon={faHome} className="nav-icon" />
                                    <span className="nav-text">Dashboard</span>
                                </Link>
                            )}
                            <Nav.Link onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                                <span className="nav-text">Logout</span>
                            </Nav.Link>
                            <Link className="nav-link" to="/profile">
                                <FontAwesomeIcon icon={faUser} className="nav-icon" />
                                <span className="nav-text">{userName || 'Profile'}</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">
                                <FontAwesomeIcon icon={faSignInAlt} className="nav-icon" />
                                <span className="nav-text">Login</span>
                            </Link>
                            <Link to="/signup" className="nav-link">
                                <FontAwesomeIcon icon={faUserPlus} className="nav-icon" />
                                <span className="nav-text">Sign Up</span>
                            </Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Navigation;
