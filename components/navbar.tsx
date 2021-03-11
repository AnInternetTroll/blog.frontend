import Image from "next/image";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { VscAccount } from "react-icons/vsc";
import { User as UserInterface } from "../models/api";
import {
	Dispatch,
	FormEvent,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { State, useTracked } from "./state";
import { deleteCookie, sha256 } from "../components/utils";

interface LoginInterface {
	loginFeedback?: string;
	registerFeedback?: string;
}

function NavigationBar() {
	const [stateGlobal, setStateGlobal] = useTracked();
	let searchParams;
	if (typeof window !== "undefined")
		searchParams = new URLSearchParams(window.location.search);
	else searchParams = new URLSearchParams("");
	const [showLogin, setShowLogin] = useState(
		searchParams.get("login") || false
	);
	const handleCloseLogin = () => setShowLogin(false);
	const handleShowLogin = () => setShowLogin(true);

	const [showRegister, setShowRegister] = useState(
		searchParams.get("register") || false
	);
	const handleCloseRegister = () => setShowRegister(false);
	const handleShowRegister = () => setShowRegister(true);

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

	const login = (e: FormEvent) => {
		e.preventDefault();
		const form = new FormData(e.target as HTMLFormElement);
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

	const register = (e: FormEvent) => {
		e.preventDefault();
		const form = new FormData(e.target as HTMLFormElement);
		if (
			form.get("password").toString() !==
			form.get("password_confirm").toString()
		)
			return setState({ registerFeedback: "Passwords don't match" });
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
	useEffect(() => {
		if (!stateGlobal.user && typeof document !== "undefined") {
			if (document.cookie) {
				let token: string;
				try {
					token = document.cookie.match(
						/(^|;) ?token=([^;]*)(;|$)/
					)[2];
					fetch(`${process.env.base_url}/user`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					})
						.then((res) => res.json() as Promise<UserInterface>)
						.then((data) => {
							setStateGlobal((s) => ({ ...s, user: data }));
						})
						.catch(console.log);
				} catch (err) {
					console.log("No token found");
				}
			}
		}
	});
	return (
		<>
			<Modal show={showLogin} onHide={handleCloseLogin}>
				<Modal.Header closeButton>Login</Modal.Header>
				<Form
					onSubmit={(e) => {
						login(e);
					}}
					style={{ padding: "20px" }}
				>
					<Form.Group>
						<Form.Label>
							<Modal.Title>Username</Modal.Title>
						</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
							required
							pattern="^(?!-)[a-z0-9-]+(?<!-)(/(?!-)[a-z0-9-]+(?<!-))*(/(?!-\.)[a-z0-9-\.]+(?<!-\.))?$"
						/>
						<Form.Label>
							<Modal.Title>Password</Modal.Title>
						</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="current-password"
							required
						/>
						<br />
						<Button type="submit">Login</Button>
						<p>
							Don't have an account?{" "}
							<a
								href="#"
								onClick={() => {
									handleShowRegister();
									handleCloseLogin();
								}}
							>
								Make one now!
							</a>
						</p>
						<p>{state.loginFeedback}</p>
					</Form.Group>
				</Form>
			</Modal>
			<Modal show={showRegister} onHide={handleCloseRegister}>
				<Modal.Header closeButton>Register</Modal.Header>
				<Form
					onSubmit={(e) => {
						register(e);
					}}
					style={{ padding: "20px" }}
				>
					<Form.Group>
						<Form.Label>
							<Modal.Title>Username</Modal.Title>
						</Form.Label>
						<Form.Control
							name="username"
							type="text"
							placeholder="Enter Username"
							autoComplete="username"
							required
							pattern="^(?!-)[a-z0-9-]+(?<!-)(/(?!-)[a-z0-9-]+(?<!-))*(/(?!-\.)[a-z0-9-\.]+(?<!-\.))?$"
						/>
						<Form.Label>
							<Modal.Title>Password</Modal.Title>
						</Form.Label>
						<Form.Control
							name="password"
							type="password"
							placeholder="Password"
							autoComplete="new-password"
							minLength={6}
							required
						/>
						<Form.Label>
							<Modal.Title>Type the password again</Modal.Title>
						</Form.Label>
						<Form.Control
							name="password_confirm"
							type="password"
							placeholder="Password"
							autoComplete="current-password"
							required
						/>
						<br />
						<Button type="submit">Register</Button>
						<p>
							Already have an account?{" "}
							<a
								href="#"
								onClick={() => {
									handleShowLogin();
									handleCloseRegister();
								}}
							>
								Log in!
							</a>
						</p>
						<p>{state.registerFeedback}</p>
					</Form.Group>
				</Form>
			</Modal>
			<Navbar bg="primary" variant="dark" expand="md">
				<Container fluid={false}>
					<Navbar.Brand href="/">
						<Image
							alt="Logo"
							src="/favicon.ico"
							width={30}
							height={30}
							className="align-top"
						/>
						Assbook
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<Nav.Link href="/">Home</Nav.Link>
							<Nav.Link href="/blogs">Blogs</Nav.Link>
							<Nav.Link href="/users">Users</Nav.Link>
						</Nav>
						<VscAccount color="white" />
						{stateGlobal.user ? (
							<Nav>
								<NavDropdown
									title={stateGlobal.user.username}
									id="profile"
								>
									<NavDropdown.Item href="/editprofile">
										Settings
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() => {
											deleteCookie("token");
											setStateGlobal((s) => ({
												...s,
												user: null,
											}));
										}}
									>
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							</Nav>
						) : (
							<Nav>
								<Nav.Link onClick={handleShowLogin}>
									Login
								</Nav.Link>
								<Nav.Link onClick={handleShowRegister}>
									Register
								</Nav.Link>
							</Nav>
						)}
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</>
	);
}
export default NavigationBar;
