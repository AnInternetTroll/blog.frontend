import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { Blog as BlogInterface, User as UserInterface } from "../models/api";
import styles from "../styles/Users.module.css";
import { useTracked } from "./state";
import { formatMarkdown } from "./utils";

export const User = ({
	user,
	...props
}: {
	user: UserInterface;
	props?: unknown;
}): JSX.Element => {
	const [globalState] = useTracked();
	return (
		<Card
			{...props}
			bg={globalState.theme === "dark_theme" ? "dark" : "light"}
			text={globalState.theme === "dark_theme" ? "light" : "dark"}
		>
			<Card.Header>
				<h4
					style={{
						display: "inline-block",
					}}
				>
					<span className={styles.profilePic}>
						<img src={user.avatar} height={25} width={25} />
					</span>
					<a href={`/${user.username}`}>{user.username}</a>
				</h4>
			</Card.Header>
			<Card.Body
				dangerouslySetInnerHTML={{
					__html: formatMarkdown(user.bio),
				}}
			/>
		</Card>
	);
};

export const Blog = ({
	blog,
	...props
}: {
	blog: BlogInterface;
	props?: unknown;
}): JSX.Element => {
	const [globalState] = useTracked();

	return (
		<Card
			{...props}
			bg={globalState.theme === "dark_theme" ? "dark" : "light"}
			text={globalState.theme === "dark_theme" ? "light" : "dark"}
			className=""
		>
			<Card.Header className="d-flex justify-content-between align-items-center">
				<a href={`/${blog.author.username}/${blog.short_name}`}>
					{blog.name}
				</a>
				{globalState.user?.id ===
				(blog.author.id || blog.author._id) ? (
					<Button variant="danger">
						Delete
					</Button>
				) : (
					""
				)}
			</Card.Header>
			<Card.Body
				dangerouslySetInnerHTML={{
					__html: formatMarkdown(blog.description),
				}}
			/>
			<Card.Footer>
				<span className={styles.profilePic}>
					<img src={blog.author.avatar} height={25} width={25} />
				</span>
				<a href={blog.author.username}>{blog.author.username}</a>
				{"	"}
			</Card.Footer>
		</Card>
	);
};
