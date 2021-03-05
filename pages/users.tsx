import Head from "next/head";
import { User as UserInterface } from "../models/api";
import { Row, Col, Card } from "react-bootstrap";
import { Component } from "react";

class User extends Component<
	{
		users: UserInterface[];
		err: any;
	},
	any
> {
	constructor(props) {
		super(props);
		this.state = {
			users: props.users,
		};
	}
	render() {
		return (
			<>
				<Head>
					<title>Users - Assbook</title>
				</Head>
				<Row>
					{this.state.users.length !== 0
						? this.state.users.map((user, index) => (
								<Col key={user.username}>
									<Card>
										<Card.Header>
											<a href={`/${user.username}`}>
												{user.username}
											</a>
										</Card.Header>
										<Card.Body>{user.bio}</Card.Body>
										<Card.Footer>{user.id}</Card.Footer>
									</Card>
									<br />
								</Col>
						  ))
						: "No users found"}
				</Row>
			</>
		);
	}
}

export async function getStaticProps() {
	const userRes = await fetch(`${process.env.base_url}/users`);
	if (userRes.ok)
		return {
			props: {
				users: (await userRes.json()) as UserInterface[],
				err: null,
			},
		};
	else return { props: { users: null, err: userRes.status } };
}

export default User;
