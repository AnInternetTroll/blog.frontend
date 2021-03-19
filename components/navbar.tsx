import {
	ChangeEventHandler,
	Dispatch,
	FormEvent,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
	ImCog,
	ImExit,
	ImHome,
	ImPencil,
	ImUser,
	ImUserPlus,
	ImUsers,
} from "react-icons/im";

import { deleteCookie, setCookie, sha256 } from "../components/utils";
import { User as UserInterface } from "../models/api";
import { State, useTracked } from "./state";

interface LoginInterface {
	loginFeedback?: string;
	registerFeedback?: string;
}

function NavigationBar(): JSX.Element {
	let searchParams: URLSearchParams;
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
			if (loginRes.ok) {
				setCookie("token", login.token, login.expiresIn);
				saveUser(login.token);
				handleCloseLogin();
			}
			setState({ loginFeedback: login.message });
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
			if (registerRes.ok) {
				setCookie("token", register.token, register.expiresIn);
				saveUser(register.token);
				handleCloseRegister();
			}
			setState({ registerFeedback: register.message });
		});
	};
	const themeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		if (e) {
			if (e.target.checked) {
				setGlobalState((s) => ({ ...s, theme: "dark_theme" }));
				document.body.classList.add("dark_theme");
				document.body.classList.remove("light_theme");
			} else {
				setGlobalState((s) => ({ ...s, theme: "light_theme" }));
				document.body.classList.add("light_theme");
				document.body.classList.remove("dark_theme");
			}
		} else {
			(document.getElementById(
				"themeChange"
			) as HTMLInputElement).checked = globalState.theme === "dark_theme";
			document.body.classList.add(globalState.theme);
		}
	};

	useEffect(() => {
		if (!globalState.user && typeof document !== "undefined") {
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
							setGlobalState((s) => ({ ...s, user: data }));
						})
						.catch(console.log);
				} catch (err) {
					console.log("No token found");
				}
			}
		}
		themeChange(undefined);
	}, [globalState.user, globalState.theme]);
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
							pattern="^(?!-)[A-z0-9-]+(?<!-)((?!-)[A-z0-9-]+(?<!-))*((?!-\.)[A-z0-9-\.]+(?<!-\.))?$"
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
							pattern="^(?!-)[A-z0-9-]+(?<!-)((?!-)[A-z0-9-]+(?<!-))*((?!-\.)[A-z0-9-\.]+(?<!-\.))?$"
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
						<img
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
						<Nav
							className="mr-auto"
							activeKey={
								typeof location !== "undefined"
									? location.pathname
									: "/"
							}
						>
							<Nav.Link href="/">
								<ImHome color="white" />
								Home
							</Nav.Link>
							<Nav.Link href="/users">
								<ImUsers color="white" />
								Users
							</Nav.Link>
						</Nav>
						<Form inline>
							<label className="switch">
								<input
									type="checkbox"
									id="themeChange"
									onChange={themeChange}
								/>
								<span className="slider round" id="slider" />
							</label>
						</Form>
						<Nav>
							{globalState.user ? (
								<NavDropdown
									title={globalState.user.username}
									id="profile"
								>
									<NavDropdown.Item
										href={`/${globalState.user.username}`}
									>
										<ImUser /> Profile
									</NavDropdown.Item>
									<NavDropdown.Item href="/newblog">
										<ImPencil /> New blog
									</NavDropdown.Item>
									<NavDropdown.Item
										href={`/${globalState.user.username}?edit_user=true`}
									>
										<ImCog /> Settings
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() => {
											deleteCookie("token");
											setGlobalState((s) => ({
												...s,
												user: null,
											}));
										}}
									>
										<ImExit />
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							) : (
								<>
									<Nav.Link onClick={handleShowLogin}>
										<ImUser color="white" />
										Login
									</Nav.Link>
									<Nav.Link onClick={handleShowRegister}>
										<ImUserPlus color="white" />
										Register
									</Nav.Link>
								</>
							)}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</>
	);
}
export default NavigationBar;
