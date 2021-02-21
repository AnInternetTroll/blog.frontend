import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Button, Form, InputGroup, Row } from "react-bootstrap";
import { useState } from "react";

export default function Login() {
	const [feedback, setFeedback] = useState("");
	function componentDidMount() {
    fetch(`${process.env.base_url}/users/luca`)
      .then(res => res.json())
      .then(
        (result) => {
          setFeedback(JSON.stringify(result));
        });
	}
	return (
		<>
			<Head>
				<title>Login - Assbook</title>
			</Head>
			<Row>
				<Form>
					<Form.Group controlId="login">
						<Form.Label>Email address</Form.Label>
						<Form.Control type="email" placeholder="Enter email" />
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Password" />
						<br/>
						<Button type="submit">Login</Button>
						<p>{feedback}</p>
					</Form.Group>
				</Form>
			</Row>
		</>
	);
}
