<script>
	export let data;
</script>

{#if data.posts.length > 0}
<h1>Blog</h1>

<ul class="posts">
	{#each data.posts as post}
		<li>
			<a href={post.path}>
				<h2>{post.meta.title}</h2>
				<p><small class="date">{post.meta.date}</small></p>
			</a>
		</li>
	{/each}
</ul>
{:else}
<h1>Nothing Here Yet...</h1>
<p>Looks like nothing was found. Please check back later.</p>
{/if}

<style>
	.posts {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		grid-gap: 2.8em 2rem;

		& a {
			color: inherit;
			text-decoration: none;
		}
	}
</style>
