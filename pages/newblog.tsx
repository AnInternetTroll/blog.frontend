import "highlight.js/styles/stackoverflow-light.css";
import "easymde/dist/easymde.min.css";

import hljs from "highlight.js";
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import SimpleMDE from "react-simplemde-editor";

import { useTracked } from "../components/state";
import { getCookie } from "../components/utils";

export default function NewBLog(): JSX.Element {
	const [globalState] = useTracked();
	const [feedback, setFeedback] = useState("");
	let descriptionEl: HTMLTextAreaElement;
	let dataEl: HTMLTextAreaElement;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		const form = Object.fromEntries(
			new FormData(e.target as HTMLFormElement)
		);
		const res = await fetch(`${process.env.base_url}/blogs`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(form),
		});
		if (res.ok) {
			setFeedback("Blog succesfully saved");
			window.location.href = `/${globalState.user.username}/${form.short_name}`;
		} else setFeedback((await res.json()).message);
	};

	useEffect(() => {
		if (globalState.user) {
			descriptionEl = document.querySelector("textarea#description");
			dataEl = document.querySelector("textarea#data");
			descriptionEl.name = descriptionEl.id;
			dataEl.name = dataEl.id;
		}
	});
	return (
		<>
			<Head>
				<title>New Blog - Assbook</title>
			</Head>
			{globalState.user !== undefined ? (
				<Form onSubmit={submit}>
					<InputGroup>
						<FormControl
							name="name"
							placeholder="Title Here"
							aria-label="Username"
						/>
						<FormControl
							name="short_name"
							required
							placeholder="URL"
							aria-label="Username"
						/>
					</InputGroup>
					<SimpleMDE
						label="Description"
						id="description"
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
					<br />
					<Button type="submit">Submit</Button>
				</Form>
			) : (
				"Loading"
			)}
		</>
	);
}
