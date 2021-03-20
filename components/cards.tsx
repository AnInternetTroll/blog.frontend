import "easymde/dist/easymde.min.css";

import hljs from "highlight.js";
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
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import * as SimpleIcons from "react-icons/si";
import SimpleMDE from "react-simplemde-editor";

import { Blog as BlogInterface, User as UserInterface } from "../models/api";
import styles from "../styles/Users.module.css";
import { useTracked } from "./state";
import { deleteCookie, formatMarkdown, getCookie, sha256 } from "./utils";

export const User = ({
	user,
	...props
}: {
	user: UserInterface;
	props?: unknown;
}): JSX.Element => {
	const [globalState] = useTracked();
	return (
		<Card
			{...props}
			bg={globalState.theme === "dark_theme" ? "dark" : "light"}
			text={globalState.theme === "dark_theme" ? "light" : "dark"}
		>
			<Card.Header>
				<h4
					style={{
						display: "inline-block",
					}}
				>
					<span className={styles.profilePic}>
						<img src={user.avatar} height={25} width={25} />
					</span>
					<a href={`/${user.username}`}>{user.username}</a>
				</h4>
			</Card.Header>
			<Card.Body
				dangerouslySetInnerHTML={{
					__html: formatMarkdown(user.bio),
				}}
			/>
		</Card>
	);
};

export const Blog = ({
	blog,
	...props
}: {
	blog: BlogInterface;
	props?: unknown;
}): JSX.Element => {
	const [globalState] = useTracked();
	return (
		<Card
			{...props}
			bg={globalState.theme === "dark_theme" ? "dark" : "light"}
			text={globalState.theme === "dark_theme" ? "light" : "dark"}
		>
			<Card.Header className="d-flex justify-content-between align-items-center">
				<a href={`/${blog.author.username}/${blog.short_name}`}>
					{blog.name}
				</a>
			</Card.Header>
			<Card.Body
				dangerouslySetInnerHTML={{
					__html: formatMarkdown(blog.description),
				}}
			/>
			<Card.Footer>
				<span className={styles.profilePic}>
					<img src={blog.author.avatar} height={25} width={25} />
				</span>
				<a href={blog.author.username}>{blog.author.username}</a>
				{"	"}
			</Card.Footer>
		</Card>
	);
};

interface EditFeedback {
	editFeedback?: string;
	err?: Error;
}

export const UserProfile = ({
	user,
	...props
}: {
	user: UserInterface;
	props?: unknown;
}): JSX.Element => {
	const [state, setState]: [
		EditFeedback,
		Dispatch<SetStateAction<EditFeedback>>
	] = useState({ editFeedback: null, err: null });
	const [globalState] = useTracked();

	let searchParams: URLSearchParams;
	if (typeof window !== "undefined")
		searchParams = new URLSearchParams(window.location.search);
	else searchParams = new URLSearchParams("");
	const [isEdit, setIsEdit] = useState(false);

	useEffect(() => {
		setIsEdit(
			(searchParams.get("edit_user") &&
				globalState.user?.id === (user.id || user._id)) ||
				false
		);
	}, [globalState.user]);

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
	return (
		<Card
			bg={globalState.theme === "dark_theme" ? "dark" : "light"}
			text={globalState.theme === "dark_theme" ? "light" : "dark"}
			{...props}
		>
			<Form onSubmit={editUser}>
				<img src={user.avatar} width={"100%"} height={"100%"} />
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
									__html: formatMarkdown(user.bio),
								}}
							/>
						)}
					</Card.Text>
					<ListGroup variant="flush">
						<ListGroup.Item>
							Joined on {new Date(user.created_at).toDateString()}
						</ListGroup.Item>
						<ListGroup.Item>
							ID : {user.id || user._id}
						</ListGroup.Item>
						{Object.keys(user.external).map((key) =>
							isEdit ? (
								<ListGroup.Item key={key}>
									{SimpleIcons[
										`Si${key.replace(/^\w/, (c) =>
											c.toUpperCase()
										)}`
									]()}{" "}
									{key}
									<InputGroup>
										<InputGroup.Prepend>
											<InputGroup.Checkbox
												name={`external.${key}.show`}
												aria-label={`Show or hide URL of ${key}`}
												defaultChecked={
													user.external[key].show
												}
											/>
										</InputGroup.Prepend>
										<FormControl
											name={`external.${key}.url`}
											aria-label={`${key} URL`}
											placeholder="None"
											defaultValue={
												user.external[key].url
											}
										/>
									</InputGroup>
								</ListGroup.Item>
							) : user.external[key].show &&
							  user.external[key].url ? (
								<ListGroup.Item key={key}>
									<a href={user.external[key].url}>
										{SimpleIcons[
											`Si${key.replace(/^\w/, (c) =>
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
				<Button onClick={() => setIsEdit(!isEdit)}>Edit</Button>
			) : (
				""
			)}
		</Card>
	);
};

export function BlogEditor({
	blog = null,
}: { blog?: BlogInterface } = {}): JSX.Element {
	const [globalState] = useTracked();
	const [feedback, setFeedback] = useState("");
	let descriptionEl: HTMLTextAreaElement;
	let dataEl: HTMLTextAreaElement;
	useEffect(() => {
		dataEl = document.querySelector("textarea#data");
		descriptionEl = document.querySelector("textarea#description");
		if (
			typeof document !== "undefined" &&
			descriptionEl !== null &&
			dataEl !== null
		) {
			descriptionEl.name = descriptionEl.id;
			dataEl.name = dataEl.id;
			if (blog) {
				descriptionEl.value = blog.description;
				dataEl.value = blog.data;
			}
		}
	});
	if (!globalState.user)
		return (
			<p>
				You must be logged in{" "}
				{blog ? "and own this blog to edit it" : ""}.
			</p>
		);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		const form = Object.fromEntries(
			new FormData(e.target as HTMLFormElement)
		);
		const res = await fetch(
			`${process.env.base_url}/blogs${
				blog
					? `/${blog.author?.username || blog.author}/${
							blog.short_name
					  }`
					: ""
			}`,
			{
				method: blog ? "PATCH" : "POST",
				headers: {
					Authorization: `Bearer ${getCookie("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(form),
			}
		);
		if (res.ok) {
			setFeedback("Blog succesfully saved");
			window.location.href = `/${globalState.user.username}/${form.short_name}`;
		} else setFeedback((await res.json()).message);
	};
	return (
		<>
			<Head>
				<title>New Blog - Assbook</title>
			</Head>
			{globalState.user !== undefined ? (
				<Form onSubmit={submit}>
					<InputGroup>
						<FormControl
							defaultValue={blog?.name || ""}
							name="name"
							placeholder="Title Here"
							aria-label="Title"
						/>
						<FormControl
							defaultValue={blog?.short_name || ""}
							name="short_name"
							required
							placeholder="URL"
							aria-label="URL"
						/>
					</InputGroup>
					<SimpleMDE
						label="Description"
						id="description"
						value={blog?.description || ""}
						onChange={(value) => {
							descriptionEl.value = value;
						}}
						options={{
							autosave: {
								uniqueId: "BlogDescription",
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
					<SimpleMDE
						label="Blog Text"
						id="data"
						value={blog?.data || ""}
						onChange={(value) => {
							dataEl.value = value;
						}}
						options={{
							autosave: {
								uniqueId: "BlogData",
								enabled: true,
								delay: 5000, // 5 Second
							},
							renderingConfig: {
								codeSyntaxHighlighting: true,
								hljs,
							},
						}}
					/>
					{feedback}
					<br />
					<Button type="submit">Submit</Button>
				</Form>
			) : (
				"Loading"
			)}
		</>
	);
}
