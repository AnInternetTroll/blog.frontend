import "easymde/dist/easymde.min.css";

import hljs from "highlight.js";
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import SimpleMDE from "react-simplemde-editor";

import { BlogEditor } from "../components/cards";
import { useTracked } from "../components/state";
import { getCookie } from "../components/utils";

export default function NewBLog(): JSX.Element {
	return (
		<>
			<Head>
				<title>New Blog - Assbook</title>
			</Head>
			<BlogEditor />
		</>
	);
}
