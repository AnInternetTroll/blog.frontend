import Head from "next/head";
import { useTracked } from "../components/state";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { FormEvent, useEffect, useState } from "react";
import SimpleMDE from "react-simplemde-editor";
import hljs from "highlight.js";
import "highlight.js/styles/stackoverflow-light.css";
import "easymde/dist/easymde.min.css";
import { getCookie } from "../components/utils";

export default function NewBLog() {
	const [globalState, setGLobalState] = useTracked();
	const [feedback, setFeedback] = useState("");
	let descriptionEl: HTMLTextAreaElement;
	let dataEl: HTMLTextAreaElement;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		const form = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const res = await fetch(`${process.env.base_url}/blogs`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${getCookie("token")}`
			}
		});
		if (res.ok) setFeedback("Form succesfully saved")
		else setFeedback("An error has occured");
	}

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
						name="title"
						placeholder="Title here"
						aria-label="Username"
						/>
					<FormControl
						name="short_name"
						placeholder="Short name here"
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
						label="Blog text"
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
					<Button type="submit">Submit</Button>
				</Form>
			) : (
				"Loading"
			)}
		</>
	);
}
