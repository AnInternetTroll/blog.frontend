import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { User as UserInterface } from "../models/api";
import React, { useState } from "react";

function NavigationBar() {
	const [user, setUser]: [
		UserInterface,
		React.Dispatch<React.SetStateAction<UserInterface>>
	] = useState(null);
	if (typeof localStorage !== "undefined") {
		if (!user) {
			if (localStorage.user)
				setUser(JSON.parse(localStorage.user) as UserInterface);
			else if (document?.cookie) {
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
							localStorage.user = JSON.stringify(data);
							setUser(data);
						})
						.catch(console.log);
				} catch (err) {
					console.log("No token found");
				}
			}
		}
	}
	return (
		<>
			<Navbar bg="primary" variant="dark" expand="md">
				<Container fluid={false}>
					<Navbar.Brand href="/">Assbook</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<Nav.Link href="/">Home</Nav.Link>
							<Nav.Link href="/blogs">Blogs</Nav.Link>
							<Nav.Link href="/users">Users</Nav.Link>
						</Nav>
						{user ? (
							<Nav>
								<NavDropdown title={user.username} id="profile">
									<NavDropdown.Item href="/editprofile">
										Settings
									</NavDropdown.Item>
								</NavDropdown>
							</Nav>
						) : (
							""
						)}
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</>
	);
}
export default NavigationBar;
