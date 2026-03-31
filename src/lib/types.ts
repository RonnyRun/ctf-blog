import type { Snippet } from 'svelte';

export type Post = {
	title: string;
	slug: string;
	description: string;
	date: string;
	tags: string[];
	ranking: string;
	teams: string;
	published: boolean;
	url: string;
};

export type MarkdownModule = {
	default: Snippet;
	metadata: Omit<Post, 'slug'>;
};
