import Head from "next/head";
import { useEffect } from "react";

import { BlogEditor } from "../components/cards";

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
