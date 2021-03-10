import Head from "next/head";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { sha256 } from "../components/utils";
import { useTracked, State } from "../components/state";
import { Dispatch, SetStateAction, useState } from "react";

interface LoginInterface {
	loginFeedback?: string;
	registerFeedback?: string;
}

function Login() {
	const [state, setState]: [
		LoginInterface,
		Dispatch<SetStateAction<LoginInterface>>
	] = useState({
		loginFeedback: "",
		registerFeedback: "",
	});
	const [globalState, setGlobalState]: [
		State,
		Dispatch<SetStateAction<State>>
	] = useTracked();

	const saveUser = async (token: string) => {
		const res = await fetch(`${process.env.base_url}/user`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const user = await res.json();
		if (res.ok) setGlobalState((s) => ({ ...s, user }));
		else setGlobalState((s) => ({ ...s, user: null }));
	};

	const setCookie = (name: string, value: string, seconds = 3600) => {
		const d = new Date();
		d.setTime(Date.now() + seconds * 100);
		document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
	};

	const login = (e) => {
		e.preventDefault();
		const form = new FormData(e.target);
		sha256(form.get("password").toString()).then(async (hash) => {
			const loginRes = await fetch(`${process.env.base_url}/login`, {
				headers: {
					authorization: `Basic ${btoa(
						`${form.get("username")}:${hash}`
					)}`,
				},
			});
			const login = await loginRes.json();
			if (loginRes.ok) setCookie("token", login.token, login.expiresIn);
			setState({ loginFeedback: login.message });
			saveUser(login.token);
		});
	};

	const register = (e: any) => {
		e.preventDefault();
		const form = new FormData(e.target);
		if (form.get("password").toString() !== form.get("password_confirm").toString()) return setState({registerFeedback: "Passwords don't match"});
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
			setState({ registerFeedback: register.message });
			saveUser(register.token);
		});
	};
	return (
		<>
			<Head>
				<title>Login - Assbook</title>
			</Head>
			<h1>Login</h1>
			<Row>
				<Form
					onSubmit={(e) => {
						login(e);
					}}
				>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
							required
							pattern="^(?!-)[a-z0-9-]+(?<!-)(/(?!-)[a-z0-9-]+(?<!-))*(/(?!-\.)[a-z0-9-\.]+(?<!-\.))?$"
						/>
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="current-password"
							required
						/>
						<br />
						<Button type="submit">Login</Button>
						<p>{state.loginFeedback}</p>
					</Form.Group>
				</Form>
			</Row>
			<hr />
			<h1>Register</h1>
			<Row>
				<Form
					onSubmit={(e) => {
						register(e);
					}}
				>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
							required
							pattern="^(?!-)[a-z0-9-]+(?<!-)(/(?!-)[a-z0-9-]+(?<!-))*(/(?!-\.)[a-z0-9-\.]+(?<!-\.))?$"
						/>
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="new-password"
							required
						/>
						<Form.Label>Type the password again</Form.Label>
						<Form.Control
							name="password_confirm"
							type="password"
							placeholder="Password"
							autoComplete="current-password"
							required
						/>
						<br />
						<Button type="submit">Login</Button>
						<p>{state.registerFeedback}</p>
					</Form.Group>
				</Form>
			</Row>
		</>
	);
}
export default Login;
