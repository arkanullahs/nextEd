import React, { useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import styles from "./styles.module.css";
import { FaUser, FaEnvelope, FaLock, FaUserGraduate } from 'react-icons/fa';

function Signup() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("student");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const history = useHistory();
	const apiUrl = process.env.REACT_APP_API_URL;

	function handleFirstNameChange(e) {
		setFirstName(e.target.value);
		setError("");
	}

	function handleLastNameChange(e) {
		setLastName(e.target.value);
		setError("");
	}

	function handleEmailChange(e) {
		setEmail(e.target.value);
		setError("");
	}

	function handlePasswordChange(e) {
		setPassword(e.target.value);
		setError("");
	}

	function handleRoleChange(e) {
		setRole(e.target.value);
		setError("");
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await axios.post(`${apiUrl}/users`, {
				firstName,
				lastName,
				email,
				password,
				role
			});
			history.push("/login");
		} catch (err) {
			if (err.response) {
				setError(err.response.data.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		}

		setIsLoading(false);
	}

	return (
		<div className={styles.container}>
			<div className={styles.formWrapper}>
				<h1 className={styles.title}>Create Account</h1>
				<h2 className={styles.subtitle}>Please fill in your details to create a new account</h2>
				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputWrapper}>
						<FaUser className={styles.inputIcon} />
						<input
							type="text"
							placeholder="First Name"
							value={firstName}
							onChange={handleFirstNameChange}
							className={styles.input}
						/>
					</div>
					<div className={styles.inputWrapper}>
						<FaUser className={styles.inputIcon} />
						<input
							type="text"
							placeholder="Last Name"
							value={lastName}
							onChange={handleLastNameChange}
							className={styles.input}
						/>
					</div>
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
					<div className={styles.inputWrapper}>
						<FaUserGraduate className={styles.inputIcon} />
						<select
							value={role}
							onChange={handleRoleChange}
							className={styles.input}
						>
							<option value="student">Student</option>
							<option value="teacher">Teacher</option>
						</select>
					</div>
					{error && <p className={styles.errorText}>{error}</p>}
					<button type="submit" className={styles.button} disabled={isLoading}>
						{isLoading ? <div className={styles.spinner}></div> : 'Sign Up'}
					</button>
				</form>
				<p className={styles.signupText}>
					Already have an account? <Link to="/login" className={styles.signupLink}>Sign In</Link>
				</p>
			</div>
		</div>
	);
}

export default Signup;