import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { User as UserInterface } from "../models/api";
import { useEffect } from "react";
import { useTracked } from "./state";
import { deleteCookie } from "../components/utils";

function NavigationBar() {
	const [state, setState] = useTracked();
	useEffect(() => {
		if (!state.user && typeof document !== "undefined") {
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
							setState((s) => ({ ...s, user: data }));
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
			<Navbar bg="primary" variant="dark" expand="md">
				<Container fluid={false}>
					<Navbar.Brand href="/">
					<img
						alt=""
						src="/favicon.ico"
						width="30"
						height="30"
						className="d-inline-block align-top"
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
						{state?.user ? (
							<Nav>
								<NavDropdown
									title={state.user.username}
									id="profile"
								>
									<NavDropdown.Item href="/editprofile">
										Settings
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item onClick={() => {
										deleteCookie("token")
										setState((s) => ({...s, user: null}))
										}}>
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							</Nav>
						) : (
							<Nav>
								<Nav.Link href="/login">
									Login/Register
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
