export interface proposal {
	title: string;
	description: string;
	id: number;
}

export interface poll {
	created_by: number;
	description: string;
	dynamic: boolean;
	end_date: string;
	finished: boolean;
	id: number;
	participants: number;
	poll_type: number;
	result: boolean;
	start_date: string;
	tag: number;
	tag_name: string;
	title: string;
	group_id:number;
	proposal_end_date:string;
	prediction_end_date:string;
	delegate_vote_end_date:string;
	group_name?:string;
	group_image?:string;
	joined:boolean;
	group_joined:boolean;
}

export interface votings {
	author: number;
	author_delegate: number | null;
	priority: number;
	proposal: number;
	score: number;
}

export interface Filter {
	public: boolean;
	finishedSelection:'all'|'unfinished'|'finished'
	search: string;
}

