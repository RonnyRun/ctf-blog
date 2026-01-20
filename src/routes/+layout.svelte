<script lang="ts">
	import '../layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Search } from '@lucide/svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative">
	<div
		class="absolute top-0 left-0 -z-10 h-50 w-full bg-linear-to-b from-primary/50 to-transparent"
	></div>
	<div class="mx-auto w-full max-w-5xl">
		<nav class="flex gap-6 p-5">
			<a href="/">home</a>
			<a href="#about">about</a>
			<a href="#social">social</a>
			<button><Search size={18} /></button>
		</nav>
		<div class="mx-5 bg-background p-5">
			{@render children()}
		</div>
		<footer class="p-5 text-center text-sm text-muted">
			<p>uwu</p>
		</footer>
	</div>
</div>
