import sanitize from "@vtex/insane";
import { getLanguage, highlight, highlightAuto } from "highlight.js";
import marked from "marked";

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
 * ~~Get a cookie~~ Changed to localStorage
 * @param name What cookie to get
 * @returns The value of the cookie
 */
export function getCookie(name: string = null): string {
	return localStorage.getItem(name);
	// const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
	// return v ? v[2] : null;
}
/**
 * ~~Set a cookie~~ Changed to localStorage
 * @param name What cookie to set
 * @param value The value of it
 * @param seconds In seconds when to expire. Defaults to 3600 seconds (1 hour)
 */
export function setCookie(name: string, value: string, seconds = 3600): void {
	localStorage.setItem(name, value);
	// const d = new Date();
	// d.setTime(Date.now() + seconds * 100);
	// document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
}
/**
 * Replace a cookie with an empty string
 * @param name What cookie to delete
 */
export function deleteCookie(name: string): void {
	setCookie(name, "", -1);
}
/**
 * Convert markdown text to html.
 * @param text Markdown text
 * @returns HTML formatted text. **Requires highlight.js css**
 */
export function formatMarkdown(text: string): string {
	return sanitize(
		marked(text, {
			highlight: (code, lang) =>
				getLanguage(lang)
					? highlight(lang, code).value
					: highlightAuto(code).value,
		}),
		{
			allowedAttributes: {
				span: ["class"],
				code: ["class"],
			},
		}
	);
}
