import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import { Container } from "react-bootstrap";

import Navbar from "../components/navbar";

function Assbook({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
			</Head>
			<Navbar />
			<br />
			<Container>
				<Component {...pageProps} />
			</Container>
		</>
	);
}

export default Assbook;
