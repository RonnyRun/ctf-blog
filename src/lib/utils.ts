import type { Post, MarkdownModule } from './types';

export function getPosts(): Post[] {
	const modules = import.meta.glob<MarkdownModule>('/src/posts/*.md', { eager: true });
	const posts = Object.entries(modules)
		.map(([path, { metadata }]) => {
			const slug = path.split('/').pop()!.replace('.md', '');
			const url = `/blog/${slug}`;

			return {
				...metadata,
				slug,
				url
			};
		})
		.filter((post) => post.published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return posts;
}

export function getWriteups(): Post[] {
	const modules = import.meta.glob<MarkdownModule>('/src/writeups/*.md', { eager: true });

	const posts = Object.entries(modules)
		.map(([path, { metadata }]) => {
			const slug = path.split('/').pop()!.replace('.md', '');
			const url = `/writeups/${slug}`;

			return {
				...metadata,
				slug,
				url
			};
		})
		.filter((post) => post.published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return posts;
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
}
