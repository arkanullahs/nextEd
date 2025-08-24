import React, { useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import styles from "./styles.module.css";
import { FaEnvelope, FaLock } from 'react-icons/fa';

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const history = useHistory();
	const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

	function handleEmailChange(e) {
		setEmail(e.target.value);
		setError("");
	}

	function handlePasswordChange(e) {
		setPassword(e.target.value);
		setError("");
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await axios.post(`${apiUrl}/auth`, {
				email: email,
				password: password
			});
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("userRole", response.data.user.role);
			history.push(response.data.user.role === 'teacher' ? "/teacher-dashboard" : "/student-dashboard");
		} catch (err) {
			if (err.response) {
				setError(err.response.data);
			} else {
				setError("Something went wrong. Please try again.");
			}
		}

		setIsLoading(false);
	}

	return (
		<div className={styles.container}>
			<div className={styles.formWrapper}>
				<h1 className={styles.title}>Welcome Back</h1>
				<h2 className={styles.subtitle}>Please enter your registered email and password to login to your account</h2>
				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputWrapper}>
						<FaEnvelope className={styles.inputIcon} />
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={handleEmailChange}
							className={styles.input}
						/>
					</div>
					<div className={styles.inputWrapper}>
						<FaLock className={styles.inputIcon} />
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={handlePasswordChange}
							className={styles.input}
						/>
					</div>
					{error && <p className={styles.errorText}>{error}</p>}
					<button type="submit" className={styles.button} disabled={isLoading}>
						{isLoading ? <div className={styles.spinner}></div> : 'Sign In'}
					</button>
				</form>
				<p className={styles.signupText}>
					New here? <Link to="/signup" className={styles.signupLink}>Create an account</Link>
				</p>
			</div>
		</div>
	);
}

export default Login;