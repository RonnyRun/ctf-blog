<script lang="ts">
	import type { PageProps } from './$types';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO title="social!" description="find me wandering the internet" url="/social" />
<PageTitle title="social!" description="find me wandering the internet" />

<ul class="list-inside list-disc">
	<li>
		<a href="https://github.com/ssebastianoo/osu-blog" class="hover:underline" target="_blank"
			>github</a
		>
	</li>
	<li>
		<a href="https://bsky.app/profile/gir8.it" class="hover:underline" target="_blank">bluesky</a>
	</li>
</ul>
