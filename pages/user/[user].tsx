import "highlight.js/styles/stackoverflow-light.css";
import "easymde/dist/easymde.min.css";

import hljs from "highlight.js";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import {
	Dispatch,
	FormEvent,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import * as SimpleIcons from "react-icons/si";
import SimpleMDE from "react-simplemde-editor";

import { Blog } from "../../components/cards";
import { useTracked } from "../../components/state";
import {
	deleteCookie,
	formatMarkdown,
	getCookie,
	sha256,
} from "../../components/utils";
import { Blog as BlogInterface, User as UserInterface } from "../../models/api";

interface EditFeedback {
	editFeedback?: string;
	err?: Error;
}
interface Props {
	user: UserInterface;
	blogs: BlogInterface[];
	err: any;
}

const User: NextPage<Props, EditFeedback> = ({ user, blogs, err }: Props) => {
	if (err) return <p>Something went wrong {err}</p>;

	const [globalState] = useTracked();
	let searchParams: URLSearchParams;
	if (typeof window !== "undefined")
		searchParams = new URLSearchParams(window.location.search);
	else searchParams = new URLSearchParams("");
	const [isEdit, setIsEdit] = useState(false);

	const [state, setState]: [
		EditFeedback,
		Dispatch<SetStateAction<EditFeedback>>
	] = useState({ editFeedback: null, err: null });

	const editUser = (e: FormEvent) => {
		e.preventDefault();
		const formData = Object.fromEntries(
			new FormData(e.target as HTMLFormElement)
		);
		Object.keys(formData).forEach((key) => {
			// @ts-ignore TypeScript may want this to be a string but the server will only accept booleans
			if (formData[key] === "on") formData[key] = true;
			// @ts-ignore So we hack our way into it
			else if (formData[key] === "off") formData[key] = false;
		});
		fetch(`${process.env.base_url}/user`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		}).then(async (res) => {
			if (res.ok) {
				setState({ editFeedback: "Succesfully editted" });
				user = Object.assign(user, formData);
			} else if (res.status === 403)
				setState({ editFeedback: "Wrong password, please try again" });
			else {
				const json = await res.json();
				setState({ editFeedback: json.message });
			}
		});
	};
	const deleteUser = async () => {
		const keep = confirm(
			"Would you like your blogs to be transfered to @archive?"
		);
		const password = prompt("Are you sure? Type in your password");
		const res = await fetch(`${process.env.base_url}/user`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				hash: await sha256(password),
				keep,
			}),
		});
		if (res.ok) {
			window.location.href = "/";
			deleteCookie("token");
		} else if (res.status === 304)
			setState({ editFeedback: "The user hasn't been deleted" });
		else if (res.status === 403)
			setState({ editFeedback: "Wrong password provided" });
		else {
			const json = await res.json();
			setState({ editFeedback: json.message });
		}
	};

	useEffect(() => {
		setIsEdit(
			(searchParams.get("edit") &&
				globalState.user?.id === (user.id || user._id)) ||
				false
		);
	}, [globalState.user]);
	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
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
						<Form onSubmit={editUser}>
							<img
								src={user.avatar}
								width={"100%"}
								height={"100%"}
							/>
							<Card.Body>
								{isEdit ? (
									<FormControl
										type="text"
										name="avatar"
										placeholder="URL to an image"
										defaultValue={user.avatar}
										onChange={(e) =>
											(user = Object.assign(user, {
												avatar: e.target.value,
											}))
										}
										style={{ width: "100%" }}
									/>
								) : (
									""
								)}
								<hr />
								<Card.Title>
									{isEdit ? (
										<InputGroup>
											<FormControl
												name="username"
												placeholder="Username"
												defaultValue={user.username}
												aria-label="Username"
											/>
										</InputGroup>
									) : (
										user.username
									)}
								</Card.Title>
								<Card.Text>
									{isEdit ? (
										<SimpleMDE
											label="Bio"
											id="bio"
											onChange={(value) => {
												const userBioEl: HTMLTextAreaElement = document.querySelector(
													"textarea#bio"
												);
												userBioEl.name = userBioEl.id;
												userBioEl.value = value;
											}}
											value={user.bio}
											options={{
												autosave: {
													uniqueId: "userBio",
													enabled: true,
												},
												renderingConfig: {
													codeSyntaxHighlighting: true,
													hljs,
												},
												toolbar: false,
												maxHeight: "2",
												status: false,
											}}
										/>
									) : (
										<p
											dangerouslySetInnerHTML={{
												__html: formatMarkdown(
													user.bio
												),
											}}
										/>
									)}
								</Card.Text>
								<ListGroup variant="flush">
									<ListGroup.Item>
										Joined on{" "}
										{new Date(
											user.created_at
										).toDateString()}
									</ListGroup.Item>
									<ListGroup.Item>
										ID : {user.id || user._id}
									</ListGroup.Item>
									{Object.keys(user.external).map((key) =>
										isEdit ? (
											<ListGroup.Item key={key}>
												{SimpleIcons[
													`Si${key.replace(
														/^\w/,
														(c) => c.toUpperCase()
													)}`
												]()}{" "}
												{key}
												<InputGroup>
													<InputGroup.Prepend>
														<InputGroup.Checkbox
															name={`external.${key}.show`}
															aria-label={`Show or hide URL of ${key}`}
															defaultChecked={
																user.external[
																	key
																].show
															}
														/>
													</InputGroup.Prepend>
													<FormControl
														name={`external.${key}.url`}
														aria-label={`${key} URL`}
														placeholder="None"
														defaultValue={
															user.external[key]
																.url
														}
													/>
												</InputGroup>
											</ListGroup.Item>
										) : user.external[key].show &&
										  user.external[key].url ? (
											<ListGroup.Item key={key}>
												<a
													href={
														user.external[key].url
													}
												>
													{SimpleIcons[
														`Si${key.replace(
															/^\w/,
															(c) =>
																c.toUpperCase()
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
								{isEdit ? (
									<>
										{state.editFeedback}
										<br />
										<Button type="submit">Save</Button>
										{"	"}
										<Button
											type="button"
											variant="danger"
											onClick={deleteUser}
										>
											Delete
										</Button>
									</>
								) : (
									""
								)}
							</Card.Body>
						</Form>
						{globalState?.user?.id === (user.id || user._id) ? (
							<Button onClick={() => setIsEdit(!isEdit)}>
								Edit
							</Button>
						) : (
							""
						)}
					</Card>
				</Col>
				{/* The body card */}
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
						<Card.Body>
							<CardColumns>
								{blogs.length !== 0
									? blogs.map((blog) => (
											<Blog blog={blog} key={blog.id} />
									  ))
									: "No blogs found"}
							</CardColumns>
						</Card.Body>
					</Card>
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
			revalidate: 30,
		};
	else return { props: { user: null, err: blogsRes.statusText } };
};

export default User;
