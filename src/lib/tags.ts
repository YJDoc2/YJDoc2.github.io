export type Tag =
	| 'HTML'
	| 'JavaScript'
	| 'Rust'
	| 'Compiler'
	| 'Simulator'
	| 'Containers'
	| 'OS'
	| 'Docker'
	| 'Svelte'
	| 'NodeJS'
	| 'WASM'
	| 'ExpressJS'
	| 'Python'
	| 'C'
	| 'MongoDB'
	| 'Asm'
	| 'C++';

export function getAllTags(): Array<Tag> {
	return [
		'HTML',
		'JavaScript',
		'Rust',
		'Compiler',
		'Simulator',
		'Containers',
		'OS',
		'Docker',
		'Svelte',
		'NodeJS',
		'WASM',
		'ExpressJS',
		'Python',
		'C',
		'MongoDB',
		'Asm',
		'C++',
	];
}
