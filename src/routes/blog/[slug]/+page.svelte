<script lang="ts">
	let { data } = $props();

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	}
</script>

<div class="mb-4 rounded border-b-2 border-b-primary bg-card px-4 py-2">
	<h1 class="text-2xl">{data.meta.title}</h1>
	<p class="text-muted">{data.meta.description}</p>

	<div class="flex items-end justify-between">
		<div class="flex gap-2">
			{#each data.meta.tags as tag}
				<p class="text-xs text-accent">&gt;{tag}</p>
			{/each}
		</div>
		<div>
			<p class="text-sm text-muted">{formatDate(data.meta.date)}</p>
		</div>
	</div>
</div>

<div class="custom-prose prose prose-h2:mt-4 prose-h2:mb-2 prose-h3:mt-4 prose-h3:mb-2 prose-p:m-0">
	<data.content />
</div>

<style>
	.custom-prose {
		--tw-prose-body: var(--color-foreground);
		--tw-prose-headings: var(--color-foreground);
		--tw-prose-links: var(--color-accent);
		--tw-prose-bold: var(--color-foreground);
		--tw-prose-bullets: var(--color-foreground);
		--tw-prose-hr: var(--color-border);
		--tw-prose-quotes: var(--color-foreground);
		--tw-prose-counters: var(--color-foreground);
		--tw-prose-captions: var(--color-muted);
		--tw-prose-code: var(--color-foreground);
		--tw-prose-pre-code: var(--color-foreground);
		--tw-prose-pre-bg: var(--color-card);
		--tw-prose-th-borders: var(--color-border);
		--tw-prose-td-borders: var(--color-border);
	}
</style>
