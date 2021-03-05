import Head from "next/head";
import { Button, Form, Row } from "react-bootstrap";
import { sha256 } from "../components/utils";
import { Component } from "react";

interface LoginInterface {
	loginFeedback: string;
	registerFeedback: string;
}

class Login extends Component<null, LoginInterface> {
	constructor(props: null) {
		super(props);
		this.state = {
			loginFeedback: "",
			registerFeedback: "",
		};
	}
	setCookie(name: string, value: string, seconds = 3600) {
		const d = new Date();
		d.setTime(Date.now() + seconds * 100);
		document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
	}
	login(e) {
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
			if (loginRes.ok)
				this.setCookie("token", login.token, login.expiresIn);
			this.setState({ loginFeedback: login.message });
		});
	}
	register(e: any) {
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
				this.setCookie("token", register.token, register.expiresIn);
			this.setState({ registerFeedback: register.message });
		});
	}
	render() {
		return (
			<>
				<Head>
					<title>Login - Assbook</title>
				</Head>
				<h1>Login</h1>
				<Row>
					<Form
						id="login"
						onSubmit={(e) => {
							this.login(e);
						}}
					>
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
							<p>{this.state.loginFeedback}</p>
						</Form.Group>
					</Form>
				</Row>
				<hr />
				<h1>Register</h1>
				<Row>
					<Form
						id="register"
						onSubmit={(e) => {
							this.register(e);
						}}
					>
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
							<p>{this.state.registerFeedback}</p>
						</Form.Group>
					</Form>
				</Row>
			</>
		);
	}
}
export default Login;
