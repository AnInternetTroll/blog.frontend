import Head from "next/head";
import { Blog as BlogInterface } from "../../../models/api";
import { Card } from "react-bootstrap";
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
	const blogsRes = await fetch(`${process.env.base_url}/blogs?embed=author`);
	const blogs = (await blogsRes.json()) as BlogInterface[];
	const paths: {
		params: { user: string; blog: string; err: null | Error };
	}[] = [];
	for (let i = 0, len = blogs.length; i < len; i++) {
		paths[i] = {
			params: {
				user: blogs[i].author.username,
				blog: blogs[i].short_name,
				err: null,
			},
		};
	}
	return {
		paths: paths,
		fallback: true,
	};
}

export async function getStaticProps({ params }) {
	const { user, blog } = params;
	const blogRes = await fetch(
		`${process.env.base_url}/blogs/${user}/${blog}?embed=author`
	);
	const blogObj = (await blogRes.json()) as BlogInterface;
	if (blogRes.ok)
		return {
			props: {
				user: blogObj.author,
				blog: blogObj,
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { user: null, err: blogRes.statusText } };
}

export default Blog;
