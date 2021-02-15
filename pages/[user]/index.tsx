import Head from "next/head";
import { useRouter } from "next/router";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";

function User({user, err}) {
	if (err) return (<p>Something went wrong</p>)
	return (
		<Container>
			<Row>
				<Col sm={4}>
					<Card>
						<Card.Img variant="top" />
						<Card.Body>
							<Card.Title>{user.username}</Card.Title>
							<Card.Text>{user.bio}</Card.Text>
							<ListGroup variant="flush">
								<ListGroup.Item>
									Joined on {new Date(user.created_at).toDateString()}
								</ListGroup.Item>
								<ListGroup.Item>ID : {user.id}</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
				<Col sm={8}>sm=8</Col>
			</Row>
		</Container>
	);
}

export async function getStaticPaths() {
	return { paths: [{params: {user: "luca"}}], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const { user } = params;
	const res = await fetch(`https://test.aninternettroll.xyz/api/users/${user}`);
	if (res.ok) return { props: { user: await res.json(), err: null } };
	else return {props: { user: null, err: res.status }}
}

export default User;
