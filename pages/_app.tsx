import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import Container from "react-bootstrap/Container";

import Navbar from "../components/navbar";
import { Provider } from "../components/state";

function Assbook({ Component, pageProps }: AppProps): JSX.Element {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () =>
				navigator.serviceWorker.register("/sw.js").then(
					(registration) =>
						console.log(
							"Service Worker registration successful with scope: ",
							registration.scope
						),
					(err) =>
						console.log("Service Worker registration failed: ", err)
				)
			);
		}
	}, []);
	return (
		<Provider>
			<Head>
				<meta charSet="utf-8" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="full-screen" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Assbook" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				{/* iOS Icons */}
				<link
					rel="apple-touch-icon"
					href="/icons/ios/ios-152-152.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="152x152"
					href="/icons/ios/ios-152-152.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/icons/ios/ios-180-180.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="167x167"
					href="/icons/ios/ios-167-167.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="120x120"
					href="/icons/ios/ios-120-120.png"
				/>
			</Head>
			<Navbar />
			<br />
			<Container>
				<Component {...pageProps} />
				<br />
			</Container>
		</Provider>
	);
}

export default Assbook;
