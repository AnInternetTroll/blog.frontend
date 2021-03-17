import { GetStaticProps } from "next";
import Head from "next/head";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Col from "react-bootstrap/Col";

import { useTracked } from "../components/state";
import { formatMarkdown } from "../components/utils";
import { Blog as BlogInterface } from "../models/api";
import styles from "../styles/Users.module.css";

export default function Users({
	blogs,
}: {
	blogs: BlogInterface[];
}): JSX.Element {
	const [globalState, setGlobalState] = useTracked();
	return (
		<>
			<Head>
				<title>Blogs - Assbook</title>
			</Head>
			<CardColumns>
				{blogs.length !== 0
					? blogs.map((blog) => (
							<Col key={blog.id}>
								<Card>
									<Card.Header>
										<a
											href={`/${blog.author.username}/${blog.short_name}`}
										>
											{blog.name}
										</a>
									</Card.Header>
									<Card.Body
										dangerouslySetInnerHTML={{
											__html: formatMarkdown(
												blog.description
											),
										}}
									/>
									<Card.Footer>
										<span className={styles.profilePic}>
											<img 
												src={blog.author.avatar}
												height={25}
												width={25}
											/>
										</span>
										<a href={blog.author.username}>
											{blog.author.username}
										</a>
										{"	"}
										{globalState.user?.id === (blog.author.id || blog.author._id) ? (
											<Button>Delete</Button>
										) : ""}
									</Card.Footer>
								</Card>
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
