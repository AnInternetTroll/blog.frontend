/**
 * Hash any string with sha-256
 * @param message The string to be sha-256 hashed
 * @returns The hash
 */
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
/**
 * Get a cookie
 * @param name What cookie to get
 * @returns The value of the cookie
 */
export function getCookie(name: string = null) {
	const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
	return v ? v[2] : null;
}
/**
 * Set a cookie
 * @param name What cookie to set
 * @param value The value of it
 * @param seconds In seconds when to expire. Defaults to 3600 seconds (1 hour)
 */
export function setCookie(name: string, value: string, seconds = 3600) {
	const d = new Date();
	d.setTime(Date.now() + seconds * 100);
	document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
}
/**
 * Replace a cookie with an empty string
 * @param name What cookie to delete
 */
export function deleteCookie(name: string) {
	setCookie(name, "", -1);
}
