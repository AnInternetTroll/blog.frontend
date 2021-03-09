import Head from "next/head";
import {
	User as UserInterface,
	Blog as BlogInterface,
} from "../../../models/api";
import { Row, Col, Card, ListGroup } from "react-bootstrap";

import "jdenticon/dist/jdenticon";
function User({
	user,
	blogs,
	err,
}: {
	user: UserInterface;
	blogs: BlogInterface[];
	err: any;
}) {
	if (err) return <p>Something went wrong {err}</p>;
	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
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
									Joined on{" "}
									{new Date(user.created_at).toDateString()}
								</ListGroup.Item>
								<ListGroup.Item>ID : {user.id}</ListGroup.Item>
								{Object.keys(user.external).map(
									(key, index) => {
										user.external[key].url ? (
											<ListGroup.Item>
												{key}: {user.external[key].url}
											</ListGroup.Item>
										) : (
											""
										);
									}
								)}
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
				{/* The body card */}
				<Col lg={8}>
					<Card>
						<Card.Body>
							<Row>
								{blogs.length !== 0
									? blogs.map((blog, index) => (
											<Col key={blog.short_name}>
												<Card>
													<Card.Header>
														<a
															href={`/${user.username}/${blog.short_name}`}
														>
															{blog.name}
														</a>
													</Card.Header>
													<Card.Body>
														{blog.description}
													</Card.Body>
													<Card.Footer>
														{blog.id}
													</Card.Footer>
												</Card>
												<br />
											</Col>
									  ))
									: "No blogs found"}
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	);
}

export async function getStaticPaths() {
	const usersRes = await fetch(`${process.env.base_url}/users`);
	const users = (await usersRes.json()) as UserInterface[];
	const paths: { params: { user: string; err: null | Error } }[] = [];
	for (let i = 0, len = users.length; i < len; i++) {
		paths[i] = { params: { user: users[i].username, err: null } };
	}
	return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
	const { user } = params;
	const blogsRes = await fetch(
		`${process.env.base_url}/blogs/${user}?embed=author`
	);
	const blogs = (await blogsRes.json()) as BlogInterface[];
	const usersRes = await fetch(`${process.env.base_url}/users/${user}`);
	if (blogsRes.ok)
		return {
			props: {
				user:
					blogs[0]?.author ||
					((await usersRes.json()) as UserInterface),
				blogs,
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { user: null, err: blogsRes.statusText } };
}

export default User;
