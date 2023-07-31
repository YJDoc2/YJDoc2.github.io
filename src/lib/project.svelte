<script lang="ts">
	import type { Project } from '$lib/projects';
	export let project: Project;
</script>

<div class="card variant-ghost-tertiary m-5 md:p-3">
	<header class="card-header">
		<div class="text-3xl">{project.title}</div>
		<div>
			{#each project.tags as tag}
				<span class="chip variant-ghost-primary mr-2 mt-2 px-2 py-1 text-base">{tag}</span>
			{/each}
		</div>
	</header>
	<section class="p-4 text-xl">{project.description}</section>
	<footer class="card-footer text-lg">
		{#if project.links.length > 0}
			<hr class="mb-2" />
			<span>Links : </span>
			{#each project.links as link}
				<span class="mr-3 capitalize md:inline block"
					><a href={link.href} target="_blank">{link.text}</a></span
				>
			{/each}
		{/if}
	</footer>
</div>
