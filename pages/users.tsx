import "highlight.js/styles/stackoverflow-light.css";

import { GetStaticProps } from "next";
import Head from "next/head";
import { Component } from "react";
import CardColumns from "react-bootstrap/CardColumns";
import Row from "react-bootstrap/Row";

import { User } from "../components/cards";
import { User as UserInterface } from "../models/api";

interface UsersInterface {
	users: UserInterface[];
	err: unknown;
}
class Users extends Component<
	UsersInterface,
	{
		users: UserInterface[];
	}
> {
	constructor(props: UsersInterface) {
		super(props);
		this.state = {
			users: props.users,
		};
	}
	render(): JSX.Element {
		return (
			<>
				<Head>
					<title>Users - Assbook</title>
				</Head>
				<Row>
					<CardColumns className="">
						{this.state.users.length !== 0
							? this.state.users.map((user) => (
									<User user={user} key={user.username} />
							  ))
							: "No users found"}
					</CardColumns>
				</Row>
			</>
		);
	}
}

export const getStaticProps: GetStaticProps = async () => {
	const userRes = await fetch(`${process.env.base_url}/users?direction=desc`);
	if (userRes.ok)
		return {
			props: {
				users: (await userRes.json()) as UserInterface[],
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { users: null, err: userRes.status } };
};

export default Users;
