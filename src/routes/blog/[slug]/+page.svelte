<script>
	export let data;
	import { title } from '$lib/site.json';
</script>

<svelte:head>
	<title>{data.title} - {title}</title>
	<meta property="og:title" content={data.title} />
</svelte:head>

<h1>{data.title}</h1>
<p>Published: {data.date}</p>
<svelte:component this={data.content} />
