export interface User {
	id: string;
	username: string;
	created_at: string;
	bio: string;
	external: {
		twitter: UserSocial;
		twitch: UserSocial;
		youtube: UserSocial;
	};
}

interface UserSocial {
	show: boolean;
	url: string;
}

export interface Blog {
	id: string;
	name: string;
	short_name: string;
	description: string;
	data: string;
	author: User;
}
