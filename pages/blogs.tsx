import { GetStaticProps } from "next";
import Head from "next/head";
import CardColumns from "react-bootstrap/CardColumns";
import Col from "react-bootstrap/Col";

import { Blog } from "../components/cards";
import { Blog as BlogInterface } from "../models/api";

export default function Blogs({
	blogs,
}: {
	blogs: BlogInterface[];
}): JSX.Element {
	return (
		<>
			<Head>
				<title>Blogs - Assbook</title>
			</Head>
			<CardColumns>
				{blogs.length !== 0
					? blogs.map((blog) => (
							<Col key={blog.id}>
								<Blog blog={blog} />
								<br />
							</Col>
					  ))
					: "No blogs found"}
			</CardColumns>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const blogsRes = await fetch(
		`${process.env.base_url}/blogs?embed=author&direction=desc`
	);
	if (blogsRes.ok)
		return {
			props: {
				blogs: (await blogsRes.json()) as BlogInterface[],
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { users: null, err: blogsRes.status } };
};
