import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/navbar";
function Assbook({ Component, pageProps }) {
	return (
		<>
			<Navbar />
			<br/>
			<Component {...pageProps} />
		</>
	);
}

export default Assbook;
