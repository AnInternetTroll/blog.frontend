import "highlight.js/styles/stackoverflow-light.css";

import { GetStaticProps } from "next";
import Head from "next/head";
import { Component } from "react";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Row from "react-bootstrap/Row";

import { formatMarkdown } from "../components/utils";
import { User as UserInterface } from "../models/api";
import styles from "../styles/Users.module.css";

interface UsersInterface {
	users: UserInterface[];
	err: unknown;
}
class User extends Component<
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
									<Card key={user.username}>
										<Card.Header>
											<h4
												style={{
													display: "inline-block",
												}}
											>
												<span
													className={
														styles.profilePic
													}
												>
													<img 
														src={user.avatar}
														height={25}
														width={25}
													/>
												</span>
												<a href={`/${user.username}`}>
													{user.username}
												</a>
											</h4>
										</Card.Header>
										<Card.Body
											dangerouslySetInnerHTML={{
												__html: formatMarkdown(
													user.bio
												),
											}}
										/>
									</Card>
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

export default User;
