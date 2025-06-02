import { fetchMarkdownPosts } from '$lib/utils';

export const load = async () => {
	const posts = await fetchMarkdownPosts();

	return {
		posts
	};
};
