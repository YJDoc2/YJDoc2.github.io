<script lang="ts">
	import { getAllTags, type Tag } from '$lib/tags';
	import { containsAll } from '$lib/utils';
	import { projects } from '$lib/projects';
	import Project from '$lib/project.svelte';

	let filteredProjects = projects;
	const allTags = getAllTags();
	let selectedTags: Set<Tag> = new Set();

	function filterProjects() {
		const tagArray = Array.from(selectedTags);
		let temp = projects;
		filteredProjects = temp.filter((p) => containsAll(p.tags, tagArray));
	}

	function toggleTag(tag: Tag) {
		if (selectedTags.has(tag)) {
			selectedTags.delete(tag);
			selectedTags = selectedTags;
		} else {
			selectedTags.add(tag);
			selectedTags = selectedTags;
		}
		filterProjects();
	}
</script>

<h1 class="text-center">Projects</h1>
<p class="text-xl text-center mt-2">
	Some of the projects I have done. You can check out all of my projects with detailed descriptions
	on my <a href="https://github.com/YJDoc2?tab=repositories" target="_blank"> github</a>.
</p>
<p class="text-base text-center mt-2">( You can also filter projects by selecting tags below )</p>
<div class="w-1/2 grid grid-cols-9 gap-2 mx-auto my-5">
	{#each allTags as tag}
		<span
			class="chip {selectedTags.has(tag)
				? 'variant-filled-secondary'
				: 'variant-ringed-secondary'} w-25 text-base"
			on:click={() => {
				toggleTag(tag);
			}}
			on:keypress
		>
			<span class="capitalize">{tag}</span>
		</span>
	{/each}
</div>

{#each filteredProjects as project}
	<div class="mx-auto mt-2 w-3/4">
		<Project {project} />
	</div>
{:else}
	<div class="text-lg text-center">
		Hmm... I probably haven't done a project that contains all of the selected tags. If you have any
		interesting ideas feel free to <a href="/contact"> contact me</a>!
	</div>
{/each}
