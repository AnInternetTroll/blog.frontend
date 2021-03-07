import Head from "next/head";
import { Blog as BlogInterface } from "../models/api";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
export default function Users({
	blogs,
	err,
}: {
	blogs: BlogInterface[];
	err: any;
}) {
	return (
		<>
			<Head>
				<title>Blogs - Assbook</title>
			</Head>
			<Row>
				{blogs.length !== 0
					? blogs.map((blog, index) => (
							<Col key={blog.id}>
								<Card>
									<Card.Header>
										<a
											href={`/${blog.author.username}/${blog.short_name}`}
										>
											{blog.name}
										</a>
									</Card.Header>
									<Card.Body>{blog.description}</Card.Body>
									<Card.Footer>{blog.id}</Card.Footer>
								</Card>
								<br />
							</Col>
					  ))
					: "No blogs found"}
			</Row>
		</>
	);
}

export async function getStaticProps() {
	const blogsRes = await fetch(`${process.env.base_url}/blogs?embed=author`);
	if (blogsRes.ok)
		return {
			props: {
				blogs: (await blogsRes.json()) as BlogInterface[],
				err: null,
			},
			revalidate: 30,
		};
	else return { props: { users: null, err: blogsRes.status } };
}
