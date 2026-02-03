<script>
	import { navigating } from '$app/state';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/styles/style.css';
	import { title } from '$lib/site.json';
	import MouseFollower from '$lib/components/MouseFollower.svelte';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if navigating.to}
	<LoadingBar />
{/if}

<Header />

<main>
  <slot />
</main>

<Footer />

<MouseFollower />
