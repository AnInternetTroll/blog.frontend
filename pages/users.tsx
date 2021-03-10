import Head from "next/head";
import { User as UserInterface } from "../models/api";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import CardColumns from "react-bootstrap/CardColumns";
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
					<CardColumns className="">
						{this.state.users.length !== 0
							? this.state.users.map((user, index) => (
									<Card key={user.username}>
										<Card.Header>
											<h4>
												<a href={`/${user.username}`}>
													{user.username}
												</a>
											</h4>
										</Card.Header>
										<Card.Body>{user.bio}</Card.Body>
									</Card>
							  ))
							: "No users found"}
					</CardColumns>
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
			revalidate: 30,
		};
	else return { props: { users: null, err: userRes.status } };
}

export default User;
