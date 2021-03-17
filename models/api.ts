export interface User {
	id: string;
	// Sometimes nested items will return the ID as `_id`. it's an annoying bug
	_id?: string;
	username: string;
	avatar: string;
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
