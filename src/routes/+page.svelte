<script lang="ts">
	const articles = [
		{
			title: 'hello, world',
			url: '/blog/intro-to-ctf',
			description: 'how i started this thing, what i thought about it, and where i am now',
			tags: ['personal', 'misc'],
			date: '20/02/2026'
		},
		{
			title: 'intro to ctf',
			url: '/blog/intro-to-ctf',
			description: 'breaking down the basics of capture the flag competitions',
			tags: ['ctf', 'beginner'],
			date: '15/03/2026'
		},
		{
			title: 'web exploitation techniques',
			url: '/blog/intro-to-ctf',
			description: 'common vulnerabilities and how to exploit them',
			tags: ['web', 'security'],
			date: '28/03/2026'
		},
		{
			title: 'cryptography fundamentals',
			url: '/blog/intro-to-ctf',
			description: 'understanding encryption, hashing, and digital signatures',
			tags: ['crypto', 'theory'],
			date: '10/04/2026'
		},
		{
			title: 'reverse engineering 101',
			url: '/blog/intro-to-ctf',
			description: 'tools and techniques for analyzing binary files',
			tags: ['reverse-eng', 'advanced'],
			date: '22/04/2026'
		},
		{
			title: 'my first ctf competition',
			url: '/blog/intro-to-ctf',
			description: 'lessons learned from competing in my first real event',
			tags: ['ctf', 'personal'],
			date: '05/05/2026'
		},
		{
			title: 'forensics deep dive',
			url: '/blog/intro-to-ctf',
			description: 'recovering data and analyzing digital artifacts',
			tags: ['forensics', 'investigation'],
			date: '18/05/2026'
		},
		{
			title: 'pwning challenges walkthrough',
			url: '/blog/intro-to-ctf',
			description: 'step-by-step solutions to common pwn problems',
			tags: ['pwn', 'tutorial'],
			date: '01/06/2026'
		}
	];
</script>

<div class="mb-2">
	<h1 class="text-3xl">blog!</h1>
	<p class="text-muted">
		questo sono i miei articoli davvero fichi sul mio viaggio nel mondo dei ctf
	</p>
</div>

<div class="space-y-2">
	{#each articles as article}
		<a
			href={article.url}
			class="flex flex-col gap-2 rounded-md border-l-4 border-l-primary bg-card px-6 py-2 [transition:border_0.1s_ease-in-out] hover:border-l-10"
		>
			<div class="space-y-1">
				<h2 class="text-xl leading-5">{article.title}</h2>
				<p class="text-sm leading-4 text-muted">
					{article.description}
				</p>
			</div>
			<div class="flex items-end justify-between">
				<div class="flex gap-2">
					{#each article.tags as tag}
						<p class="text-xs text-accent">&gt;{tag}</p>
					{/each}
				</div>
				<div>
					<p class="text-sm text-muted">{article.date}</p>
				</div>
			</div>
		</a>
	{/each}
</div>
