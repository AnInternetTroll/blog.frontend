export async function sha256(message: string): Promise<string> {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(message);
	// hash the message
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	// convert bytes to hex string
	const hashHex = hashArray
		.map((b) => ("00" + b.toString(16)).slice(-2))
		.join("");
	return hashHex;
}
export function getCookie(name: string): string {
	const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
	return v ? v[2] : null;
}
export function setCookie(name: string, value: string, seconds = 3600) {
	const d = new Date();
	d.setTime(Date.now() + seconds);
	document.cookie = name + "=" + value + ";path=/;expires=" + d.toUTCString();
}
export function deleteCookie(name: string) {
	setCookie(name, "", -1);
}
