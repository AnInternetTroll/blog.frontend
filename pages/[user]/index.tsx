import Head from "next/head";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";

import "jdenticon/dist/jdenticon";
function User({ user, blogs, err }) {
	if (err) return <p>Something went wrong</p>;
	return (
		<Container>
			<Row>
				{/* The profile card */}
				<Col sm={4}>
					<Card>
						<canvas
							width="300px"
							height="300px"
							data-jdenticon-value={user.username}
						/>
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
				{/* The body card */}
				<Col sm={8}>
					<Card>
						<Card.Body>
							<Row md={2}>
								{
									blogs.map((blog, index) => (
										<Col key={blog.short_name}>
											<Card>
												<Card.Header>
													<a href={`/${user.username}/${blog.short_name}`}>
														{blog.name}
													</a>
												</Card.Header>
												<Card.Body>{blog.description}</Card.Body>
												<Card.Footer>{blog.id}</Card.Footer>
											</Card>
											<br/>
										</Col>
									))
								}
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export async function getStaticPaths() {
	return { paths: [{ params: { user: "archive" } }], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const { user } = params;
	const userRes = await fetch(
		`/api/users/${user}`
	);
	const blogs = await fetch(
		`/api/blogs/${user}`
	);
	if (userRes.ok)
		return {
			props: {
				user: await userRes.json() as any[],
				blogs: await blogs.json() as any[],
				err: null,
			},
		};
	else return { props: { user: null, err: user.status } };
}

export default User;
