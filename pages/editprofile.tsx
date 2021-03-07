import Head from "next/head";
import { User as UserInterface } from "../models/api";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import {
	Component,
	FormEvent,
	Dispatch,
	SetStateAction,
	useState,
	useEffect,
} from "react";
import { useTracked, State } from "../components/state";

import "jdenticon/dist/jdenticon";

function EditProfile() {
	const [globalState, setGlobalState] = useTracked();
	const [state, setState] = useState({ err: null });

	const editUser = (e: FormEvent) => {
		e.preventDefault();
		const formData = Object.fromEntries(
			new FormData(e.target as HTMLFormElement)
		);
		Object.keys(formData).forEach((key) => {
			// @ts-ignore TypeScript may want this to be a string but the server will only accept booleans
			if (formData[key] === "on") formData[key] = true;
			// @ts-ignore So we hack our way into it
			else if (formData[key] === "off") formData[key] = false;
		});
		fetch(`${process.env.base_url}/user`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${
					document.cookie.match(`(^|;) ?token=([^;]*)(;|$)`)[2]
				}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});
	};
	/*
	useEffect(() => {
		if (!globalState.user) {
			let token: string;
			try {
				token = document.cookie.match(/(^|;) ?token=([^;]*)(;|$)/)[2];
			} catch (err) {
				token = "";
			}
			if (typeof window !== "undefined" && token) {
				fetch(`${process.env.base_url}/user`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
					.then((res) => res.json() as Promise<UserInterface>)
					.then((data) => {
						setGlobalState((s) => ({ ...s, user: data }));
					})
					.catch((err) => {
						setState({ err });
					});
			} else setState({ err: new Error(`Wrong password`) });
		}
	});
	*/
	return (
		<>
			<Head>
				<title>
					{globalState.user?.username || "Loading"} - Assbook
				</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
					<Form onSubmit={editUser}>
						{globalState.user ? (
							<Card>
								{globalState.user.username ? (
									<canvas
										width="300px"
										height="300px"
										data-jdenticon-value={
											globalState.user.username
										}
									/>
								) : (
									""
								)}
								<Card.Body>
									<Card.Title>
										<InputGroup>
											<FormControl
												name="username"
												placeholder="Username"
												defaultValue={
													globalState.user.username
												}
												aria-label="Username"
											/>
										</InputGroup>
									</Card.Title>
									<Card.Text>
										<InputGroup>
											<FormControl
												name="bio"
												as="textarea"
												aria-label="With textarea"
												defaultValue={
													globalState.user.bio
												}
												placeholder="None"
											/>
										</InputGroup>
									</Card.Text>
									<ListGroup variant="flush">
										<ListGroup.Item>
											Joined on{" "}
											{new Date(
												globalState.user.created_at
											).toDateString()}
										</ListGroup.Item>
										<ListGroup.Item>
											ID : {globalState.user.id}
										</ListGroup.Item>
										{Object.keys(
											globalState.user.external
										).map((key, index) => (
											<ListGroup.Item key={key}>
												{key}
												<InputGroup>
													<InputGroup.Prepend>
														<InputGroup.Checkbox
															name={`external.${key}.show`}
															aria-label={`Show or hide URL of ${key}`}
															defaultChecked={
																globalState.user
																	.external[
																	key
																].show
															}
														/>
													</InputGroup.Prepend>
													<FormControl
														name={`external.${key}.url`}
														aria-label={`${key} URL`}
														placeholder="None"
														defaultValue={
															globalState.user
																.external[key]
																.url
														}
													/>
												</InputGroup>
											</ListGroup.Item>
										))}
									</ListGroup>
									<Button type="submit">Save</Button>
								</Card.Body>
							</Card>
						) : state.err ? (
							`Something has occured ${state.err.message}`
						) : (
							"Loading"
						)}
					</Form>
				</Col>
				<br />
			</Row>
		</>
	);
}

export default EditProfile;
