import "highlight.js/styles/stackoverflow-light.css";

import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useTracked } from "../../../components/state";

import { formatMarkdown, getCookie } from "../../../components/utils";
import { Blog as BlogInterface } from "../../../models/api";

function Blog({ user, blog, err }) {
	if (err) return <p>Something went wrong</p>;
	const [globalState] = useTracked();
	const [feedback, setFeedback] = useState("");
	const deleteBlog = async () => {
		const res = await fetch(`${process.env.base_url}/blogs/${user.username}/${blog.short_name}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`,
			}
		});
		if (res.ok) window.location.href = "/";
		else setFeedback((await res.json()).message);
	}

	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Card>
				<Card.Header>{blog.name}</Card.Header>
				<Card.Body
					dangerouslySetInnerHTML={{
						__html: formatMarkdown(blog.data),
					}}
				/>
				{globalState.user?.id === (user.id || user._id) ? (
					<>
						{feedback}
						<br />
						<Button onClick={deleteBlog}>Delete</Button>
					</>
				) : ""}
			</Card>
		</>
	);
}

export const getStaticPaths: GetStaticPaths<any> = async () => {
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
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
};

export default Blog;
