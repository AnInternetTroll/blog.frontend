import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Button, Form, InputGroup, Row } from "react-bootstrap";
import { useState, FormEvent } from "react";
import { sha256, setCookie } from "../components/utils";

export default function Login() {
	const [loginFeedback, setLoginFeedback] = useState("");
	const [registerFeedback, setRegisterFeedback] = useState("");
	const login = (e: any) => {
		e.preventDefault();
		const form = new FormData(document.querySelector("#login"));
		sha256(form.get("password").toString()).then(async (hash) => {
			const loginRes = await fetch(`${process.env.base_url}/login`, {
				headers: {
					authorization: `Basic ${btoa(
						`${form.get("username")}:${hash}`
					)}`,
				},
			});
			const login = await loginRes.json();
			// @ts-ignore "Cannot find cookieStore" wtf typescript. https://wicg.github.io/cookie-store/
			if (loginRes.ok) setCookie("token", login.token, login.expiresIn);
			setLoginFeedback(login.message);
		});
	};
	const register = (e: any) => {
		e.preventDefault();
		const form = new FormData(document.querySelector("#register"));
		sha256(form.get("password").toString()).then(async (hash) => {
			const registerRes = await fetch(
				`${process.env.base_url}/register`,
				{
					method: "POST",
					headers: {
						authorization: `Basic ${btoa(
							`${form.get("username")}:${hash}`
						)}`,
					},
				}
			);
			const register = await registerRes.json();
			if (registerRes.ok)
				setCookie("token", register.token, register.expiresIn);
			setRegisterFeedback(register.message);
		});
	};
	return (
		<>
			<Head>
				<title>Login - Assbook</title>
			</Head>
			<h1>Login</h1>
			<Row>
				<Form id="login" onSubmit={login}>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
						/>
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="current-password"
						/>
						<br />
						<Button type="submit">Login</Button>
						<p>{loginFeedback}</p>
					</Form.Group>
				</Form>
			</Row>
			<hr />
			<h1>Register</h1>
			<Row>
				<Form id="register" onSubmit={register}>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
						/>
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="new-password"
						/>
						<br />
						<Button type="submit">Login</Button>
						<p>{registerFeedback}</p>
					</Form.Group>
				</Form>
			</Row>
		</>
	);
}
