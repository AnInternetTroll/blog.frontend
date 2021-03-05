import Head from "next/head";
import { User as UserInterface } from "../models/api";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Component } from "react";

import "jdenticon/dist/jdenticon";

class EditProfile extends Component<null, { err: any; user: UserInterface }> {
	constructor(props: null) {
		super(props);
		this.state = {
			err: null,
			user: null,
		};
	}
	componentDidMount() {
		let token: string;
		try {
			token = document.cookie.match(`(^|;) ?token=([^;]*)(;|$)`)[2];
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
					this.setState({ user: data });
				})
				.catch((err) => {
					this.setState({ err });
				});
		} else this.setState({ err: "Error" });
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
										<input
											defaultValue={
												this.state.user.username
											}
										/>
									</Card.Title>
									<Card.Text>
										<textarea
											defaultValue={this.state.user.bio}
										/>
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
											<ListGroup.Item>
												{key}
												<input
													defaultValue={
														this.state.user
															.external[key].url
													}
												/>
											</ListGroup.Item>
										))}
									</ListGroup>
								</Card.Body>
							</Card>
						) : this.state.err ? (
							"Something went wrong"
						) : (
							"Loading"
						)}
					</Col>
					<br />
				</Row>
			</>
		);
	}
}

export default EditProfile;
