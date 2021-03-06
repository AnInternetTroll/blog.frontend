import "easymde/dist/easymde.min.css";

import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { BlogEditor, UserProfile } from "../../../components/cards";
import { useTracked } from "../../../components/state";
import { formatMarkdown, getCookie } from "../../../components/utils";
import {
	Blog as BlogInterface,
	User as UserInterface,
} from "../../../models/api";

function Blog({
	user,
	blog,
	err,
}: {
	user: UserInterface;
	blog: BlogInterface;
	err: unknown;
}): JSX.Element {
	if (err) return <p>Something went wrong</p>;
	const [globalState] = useTracked();
	const [feedback, setFeedback] = useState("");
	let searchParams: URLSearchParams;
	if (typeof window !== "undefined")
		searchParams = new URLSearchParams(window.location.search);
	else searchParams = new URLSearchParams("");
	const [isEdit, setIsEdit] = useState(false);

	useEffect(() => {
		setIsEdit(
			(searchParams.get("edit_blog") &&
				globalState.user?.id === (user.id || user._id)) ||
				false
		);
	}, [globalState.user]);

	const deleteBlog = async () => {
		if (!confirm("Are you sure you want to delete this blog?")) return;
		const res = await fetch(
			`${process.env.base_url}/blogs/${user.username}/${blog.short_name}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${getCookie("token")}`,
				},
			}
		);
		if (res.ok) window.location.href = "/";
		else setFeedback((await res.json()).message);
	};

	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Row>
				<Col lg={4}>
					<UserProfile user={user} />
				</Col>
				<Col lg={8}>
					<Card
						bg={
							globalState.theme === "dark_theme"
								? "dark"
								: "light"
						}
						text={
							globalState.theme === "dark_theme"
								? "light"
								: "dark"
						}
					>
						<Card.Header>
							{blog.name}
							{feedback ? (
								<>
									<br />
									{feedback}
								</>
							) : (
								""
							)}
							{globalState.user?.id === (user.id || user._id) ? (
								<span style={{ float: "right", top: 0 }}>
									<Button
										onClick={deleteBlog}
										variant="danger"
									>
										Delete
									</Button>
									{"	"}
									<Button onClick={() => setIsEdit(!isEdit)}>
										Edit
									</Button>
								</span>
							) : (
								""
							)}
						</Card.Header>
						{isEdit ? (
							<BlogEditor blog={blog} />
						) : (
							<Card.Body
								dangerouslySetInnerHTML={{
									__html: formatMarkdown(blog.data),
								}}
							/>
						)}
					</Card>
				</Col>
			</Row>
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
			revalidate: 5,
		};
	else return { props: { user: null, err: blogRes.statusText } };
};

export default Blog;
