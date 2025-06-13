import { baseUrl } from '$lib/site.json';

export const prerender = true;

export const GET = async () => {
  const body = render();
  const options = {
    headers: {
      'Content-Type': 'text/plain'
    }
  };

  return new Response(body, options);
}

const render = () => `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
