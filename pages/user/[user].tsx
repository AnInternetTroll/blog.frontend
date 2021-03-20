import "easymde/dist/easymde.min.css";

import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { Blog, UserProfile } from "../../components/cards";
import { useTracked } from "../../components/state";
import { Blog as BlogInterface, User as UserInterface } from "../../models/api";

interface Props {
	user: UserInterface;
	blogs: BlogInterface[];
	err: unknown;
}

const User: NextPage<Props> = ({ user, blogs, err }: Props) => {
	if (err) return <p>Something went wrong {err}</p>;

	const [globalState] = useTracked();
	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
					<UserProfile user={user} />
				</Col>
				{/* The body card */}
				<Col lg={8}>
					<CardColumns>
						{blogs.length !== 0
							? blogs.map((blog) => (
									<Blog blog={blog} key={blog.id} />
							  ))
							: "No blogs found"}
					</CardColumns>
				</Col>
			</Row>
		</>
	);
};

export const getStaticPaths: GetStaticPaths<any> = async () => {
	const usersRes = await fetch(`${process.env.base_url}/users`);
	const users = (await usersRes.json()) as UserInterface[];
	const paths: { params: { user: string; err: null | Error } }[] = [];
	for (let i = 0, len = users.length; i < len; i++) {
		paths[i] = { params: { user: users[i].username, err: null } };
	}
	return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
			revalidate: 5,
		};
	else return { props: { user: null, err: blogsRes.statusText } };
};

export default User;
