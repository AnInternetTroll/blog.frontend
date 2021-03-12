import Head from "next/head";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useTracked } from "../components/state";
import { sha256, deleteCookie, getCookie } from "../components/utils";
import Jdenticon from "react-jdenticon";

interface EditFeedback {
	editFeedback?: string;
	err?: Error;
}
function EditProfile() {
	const [globalState] = useTracked();
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
			if (res.ok) setState({ editFeedback: "Succesfully editted" });
			else if (res.status === 403)
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
	return (
		<>
			<Head>
				<title>
					{globalState.user?.username || "Loading"} - Assbook
				</title>
			</Head>
			<Row>
				{/* The profile card */}
				<Col lg={4}>
					<Form onSubmit={editUser}>
						{globalState.user ? (
							<Card>
								<Jdenticon
									size="300"
									value={globalState.user.username}
								/>
								<Card.Body>
									<Card.Title>
										<InputGroup>
											<FormControl
												name="username"
												placeholder="Username"
												defaultValue={
													globalState.user.username
												}
												aria-label="Username"
											/>
										</InputGroup>
									</Card.Title>
									<Card.Text>
										<InputGroup>
											<FormControl
												name="bio"
												as="textarea"
												aria-label="With textarea"
												defaultValue={
													globalState.user.bio
												}
												placeholder="None"
											/>
										</InputGroup>
									</Card.Text>
									<ListGroup variant="flush">
										<ListGroup.Item>
											Joined on{" "}
											{new Date(
												globalState.user.created_at
											).toDateString()}
										</ListGroup.Item>
										<ListGroup.Item>
											ID : {globalState.user.id}
										</ListGroup.Item>
										{Object.keys(
											globalState.user.external
										).map((key, index) => (
											<ListGroup.Item key={key}>
												{key}
												<InputGroup>
													<InputGroup.Prepend>
														<InputGroup.Checkbox
															name={`external.${key}.show`}
															aria-label={`Show or hide URL of ${key}`}
															defaultChecked={
																globalState.user
																	.external[
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
															globalState.user
																.external[key]
																.url
														}
													/>
												</InputGroup>
											</ListGroup.Item>
										))}
									</ListGroup>
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
								</Card.Body>
							</Card>
						) : state.err ? (
							`Something has occured ${state.err.message}`
						) : (
							"Loading"
						)}
					</Form>
				</Col>
				<br />
			</Row>
		</>
	);
}

export default EditProfile;
