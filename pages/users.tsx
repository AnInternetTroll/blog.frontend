import Head from "next/head";
import { User as UserInterface, Blog as BlogInterface } from "../models/api";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";

export default function Users({
	users,
	err,
}: {
	users: UserInterface[];
	err: any;
}) {
	return (
		<>
			<Head>
				<title>Users - Assbook</title>
			</Head>
			<Row>
				{users.length !== 0
					? users.map((user, index) => (
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
