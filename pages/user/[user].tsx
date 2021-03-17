import Head from "next/head";
import { User as UserInterface, Blog as BlogInterface } from "../../models/api";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";
import Jdenticon from "react-jdenticon";
import SimpleMDE from "react-simplemde-editor";
import * as SimpleIcons from "react-icons/si";
import {
	useState,
	useEffect,
	Dispatch,
	FormEvent,
	SetStateAction,
} from "react";
import hljs from "highlight.js";
import "highlight.js/styles/stackoverflow-light.css";
import "easymde/dist/easymde.min.css";
import {
	getCookie,
	sha256,
	deleteCookie,
	formatMarkdown,
} from "../../components/utils";
import { useTracked } from "../../components/state";

interface EditFeedback {
	editFeedback?: string;
	err?: Error;
}

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

	const [globalState, setGlobalState] = useTracked();
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
		const password = prompt("Are you sure? Type in your password");
		const res = await fetch(`${process.env.base_url}/user`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				hash: await sha256(password),
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
		if (isEdit) {
		}
	}, [globalState.user]);
	return (
		<>
			<Head>
				<title>{user.username} - Assbook</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
					<Card>
						<Form onSubmit={editUser}>
							<Jdenticon size="300" value={user.id || user._id} />
							<Card.Body>
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
													<Card.Body
														dangerouslySetInnerHTML={{
															__html: formatMarkdown(
																blog.description
															),
														}}
													/>
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
