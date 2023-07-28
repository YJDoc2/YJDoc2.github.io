<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	import { AppShell, AppBar, LightSwitch } from '@skeletonlabs/skeleton';
</script>

<AppShell>
	<svelte:fragment slot="pageHeader">
		<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<img src="/icon.png" width="35vw" alt="website logo" />
			</svelte:fragment>
			<a href="/" class="text-xl">YJDoc2</a>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<!-- <a href="/about">Experience</a>
				<a href="/contact">Contact</a>
				<a href="/blogs">Blogs</a>
				<a href="/projects">Projects</a>
				<a href="/followed">Stuff I Follow</a> -->
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<br />
	<slot />
	<svelte:fragment slot="footer">
		<div class="flex mx-2">
			<div class="flex-auto">Made with Svelte and Skeleton UI</div>
			<div class="felx-auto">&copy; YJDoc2</div>
		</div>
	</svelte:fragment>
</AppShell>
