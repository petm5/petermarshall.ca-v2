import { fetchMarkdownPosts } from '$lib/utils';
import { baseUrl } from '$lib/site.json';

export const prerender = true;

export const GET = async () => {
  const posts = await fetchMarkdownPosts();

  const body = render(posts);
  const options = {
    headers: {
      'Content-Type': 'application/xml'
    }
  };

  return new Response(body, options);
}

const render = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${baseUrl}</loc>
<changefreq>daily</changefreq>
<priority>0.7</priority>
</url>
${posts.map(post  =>  `
<url>
<loc>${baseUrl}${post.path}</loc>
<changefreq>weekly</changefreq>
<lastmod>${new Date(post.meta.date).toUTCString()}</lastmod>
</url>
`).join('')}
</urlset>`;
