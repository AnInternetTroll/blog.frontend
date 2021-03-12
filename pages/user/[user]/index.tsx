import Head from "next/head";
import {
	User as UserInterface,
	Blog as BlogInterface,
} from "../../../models/api";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Jdenticon from "react-jdenticon";
import * as SimpleIcons from "react-icons/si";

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
						<Jdenticon size="300" value={user.id || user._id} />
						<Card.Body>
							<Card.Title>{user.username}</Card.Title>
							<Card.Text>{user.bio}</Card.Text>
							<ListGroup variant="flush">
								<ListGroup.Item>
									Joined on{" "}
									{new Date(user.created_at).toDateString()}
								</ListGroup.Item>
								<ListGroup.Item>
									ID : {user.id || user._id}
								</ListGroup.Item>
								{Object.keys(user.external).map((key) =>
									user.external[key].show &&
									user.external[key].url ? (
										<ListGroup.Item key={key}>
											<a href={user.external[key].url}>
												{SimpleIcons[
													`Si${key.replace(
														/^\w/,
														(c) => c.toUpperCase()
													)}`
												]()}{" "}
												{key}
											</a>
										</ListGroup.Item>
									) : (
										""
									)
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
	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const { user } = params;
	const blogsRes = await fetch(
		`${process.env.base_url}/blogs/${user}?embed=author`
	);
	const blogs = (await blogsRes.json()) as BlogInterface[];
	if (blogsRes.ok)
		return {
			props: {
				user:
					blogs[0]?.author ||
					((await (
						await fetch(`${process.env.base_url}/users/${user}`)
					).json()) as UserInterface),
				blogs,
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { user: null, err: blogsRes.statusText } };
}

export default User;
