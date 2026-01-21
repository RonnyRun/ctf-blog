<script lang="ts">
	import PostsList from '$lib/components/PostsList.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
</script>

<SEO title="blog!" description="an osu! themed blog based on markdown" url="/" />

<PageTitle title="blog!" description="an osu! themed blog based on markdown" />
<PostsList posts={data.posts} />
