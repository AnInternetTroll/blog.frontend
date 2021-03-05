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
import { Component, FormEvent } from "react";

import "jdenticon/dist/jdenticon";

class EditProfile extends Component<null, { err: any; user: UserInterface, token: string }> {
	constructor(props: null) {
		super(props);
		this.state = {
			err: null,
			user: null,
			token: null,
		};
	}

	editUser(e: FormEvent) {
		e.preventDefault();
		const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		Object.keys(formData).forEach(key => {
			// @ts-ignore TypeScript may want this to be a string but the server will only accept booleans
			if (formData[key] === "on") formData[key] = true;
			// @ts-ignore So we hack our way into it
			else if (formData[key] === "off") formData[key] = false;
		})
		fetch(`${process.env.base_url}/user`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${document.cookie.match(`(^|;) ?token=([^;]*)(;|$)`)[2]}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		})
	}

	componentDidMount() {
		let token: string;
		try {
			token = document.cookie.match(`(^|;) ?token=([^;]*)(;|$)`)[2];
			this.setState({token});
		} catch (err) {
			token = "";
			this.setState({token: ""});
		}
		console.log(this.state.token)
		if (typeof window !== "undefined" && token) {
			fetch(`${process.env.base_url}/user`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => res.json() as Promise<UserInterface>)
				.then((data) => {
					this.setState({ user: data });
				})
				.catch((err) => {
					this.setState({ err });
				});
		} else this.setState({err: `Wrong password ${this.state.token}`});
	}

	render() {
		return (
			<>
				<Head>
					<title>
						{this.state.user?.username || "Loading"} - Assbook
					</title>
				</Head>
				<Row>
					{/* The profile card */}
					<Col lg={4}>
						<Form onSubmit={this.editUser}>
							{this.state.user ? (
								<Card>
									{this.state.user.username ? (
										<canvas
											width="300px"
											height="300px"
											data-jdenticon-value={
												this.state.user.username
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
													defaultValue={this.state.user.username}
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
														this.state.user.bio
													}
													placeholder="None"
												/>
											</InputGroup>
										</Card.Text>
										<ListGroup variant="flush">
											<ListGroup.Item>
												Joined on{" "}
												{new Date(
													this.state.user.created_at
												).toDateString()}
											</ListGroup.Item>
											<ListGroup.Item>
												ID : {this.state.user.id}
											</ListGroup.Item>
											{Object.keys(
												this.state.user.external
											).map((key, index) => (
												<ListGroup.Item key={key}>
													{key}
													<InputGroup>
														<InputGroup.Prepend>
															<InputGroup.Checkbox
																name={`external.${key}.show`}
																aria-label={`Show or hide URL of ${key}`}
																defaultChecked={
																	this.state
																		.user
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
																this.state.user
																	.external[
																	key
																].url
															}
														/>
													</InputGroup>
												</ListGroup.Item>
											))}
										</ListGroup>
										<Button type="submit">Save</Button>
									</Card.Body>
								</Card>
							) : this.state.err ? (
								"Something has occured"
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
}

export default EditProfile;
