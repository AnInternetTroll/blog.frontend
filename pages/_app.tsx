import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/navbar";
import Head from "next/head";

function Assbook({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
			</Head>
			<Navbar />
			<br />
			<Component {...pageProps} />
		</>
	);
}

export default Assbook;
