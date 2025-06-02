import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const post = await import(`../../../../blog/${params.slug}.md`);
		const { title, date } = post.metadata;
		const content = post.default;

		return {
			content,
			title,
			date
		};
	} catch (e) {
		error(404);
	}
}

export const prerender = 'auto';
