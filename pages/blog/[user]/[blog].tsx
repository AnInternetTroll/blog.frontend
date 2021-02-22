import Head from "next/head";
import {
	User as UserInterface,
	Blog as BlogInterface,
} from "../../../models/api";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import marked from "marked";
import sanitize from "insane";
import "jdenticon/dist/jdenticon";

function Blog({ user, blog, err }) {
	if (err) return <p>Something went wrong</p>;
	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Card>
				<Card.Header>{blog.name}</Card.Header>
				<Card.Body
					dangerouslySetInnerHTML={{
						__html: sanitize(marked(blog.data)),
					}}
				/>
			</Card>
		</>
	);
}

export async function getStaticPaths() {
	return {
		paths: [{ params: { user: "archive", blog: "readme" } }],
		fallback: "blocking",
	};
}

export async function getStaticProps({ params }) {
	const { user, blog } = params;
	const userRes = await fetch(`${process.env.base_url}/users/${user}`);
	const blogRes = await fetch(
		`${process.env.base_url}/blogs/${user}/${blog}`
	);
	if (userRes.ok)
		return {
			props: {
				user: (await userRes.json()) as UserInterface,
				blog: (await blogRes.json()) as BlogInterface,
				err: null,
			},
		};
	else return { props: { user: null, err: user.status } };
}

export default Blog;
