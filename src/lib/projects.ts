import type { Tag } from './tags';

type Link = {
	text: string;
	href: string;
};

export type Project = {
	title: string;
	tags: Array<Tag>;
	description: string;
	links: Array<Link>;
};

function githubLink(href: string): Link {
	return link('github', href);
}

function link(text: string, href: string): Link {
	return {
		text,
		href,
	};
}

export const projects: Array<Project> = [
	{
		title: 'youki',
		tags: ['Rust', 'Containers', 'Docker', 'OS'],
		description:
			'An open source project I contribute to. This is a low level container runtime implementation in Rust, which can be used with docker or podman to create and run containers. I have contributed in multiple areas including documentation, integration tests, CI/CD pipeline and implementation of some core features. I am currently also one of the maintainers of this project, and look over reviews, contributions and issues and general maintenance.',
		links: [githubLink('https://github.com/containers/youki')],
	},
	{
		title: '8086 Web Emulator',
		tags: ['Rust', 'JavaScript', 'WASM', 'Compiler', 'Simulator'],
		description:
			'An Intel 8086 Emulator which can run the x86 assembly programs supported by 8086. It Provides Web GUI that shows state of flags, registers and memory. This uses the core 8086 emulator library which I also developed. This has been used by many students across the globe and few professors have also used it for conducting their classes.',
		links: [
			link('website', 'https://yjdoc2.github.io/8086-emulator-web/'),
			githubLink('https://github.com/YJDoc2/8086-Emulator-Web'),
		],
	},
	{
		title: '8086 Command line Emulator',
		tags: ['Rust', 'Compiler', 'Simulator'],
		description:
			'An Intel 8086 Emulator which can run the x86 assembly programs supported by 8086 architecture. It also has support for printing the state of the machine, interactive running and step-by-step execution.',
		links: [githubLink('https://github.com/YJDoc2/8086-Emulator')],
	},
	{
		title: 'Pcb-rs',
		tags: ['Rust', 'Compiler', 'Simulator'],
		description:
			'A library to easily write Software Emulated Hardware. This provides a rust derive macro along with required traits which can be used to implement individual chips and PCBs which contain multiple chips. Then the whole circuit can be simulated, and the library takes care of passing signals from one chip to another according to pcb connections.',
		links: [
			githubLink('https://github.com/YJDoc2/pcb-rs'),
			link('examples', 'https://github.com/YJDoc2/pcb-rs-examples/'),
			link('website', 'https://yjdoc2.github.io/pcb-rs-examples/'),
		],
	},
	{
		title: 'Network-Simulator',
		tags: ['HTML', 'JavaScript', 'Svelte', 'NodeJS', 'Simulator'],
		description:
			'A simple in-browser network simulator, which can be used to visualize network graphs and run specific logic code on packets. This support writing packet processing code in Javascript and shows the simulation with animation of packet transfer.',
		links: [
			githubLink('https://github.com/YJDoc2/Network-simulator/'),
			link('website', 'https://yjdoc2.github.io/Network-Simulator/'),
		],
	},
	{
		title: 'The Transpiler Project',
		tags: ['C', 'Compiler'],
		description:
			'A compiler in C that compiles from custom syntax to C. Allows Basic C features, as well as some extra features, like let syntax, for var in range loops, basic support for classes etc. Made with Flex and Bison',
		links: [githubLink('https://github.com/YJDoc2/The-Transpiler-Project')],
	},
	{
		title: 'SPA Portal',
		tags: ['C', 'JavaScript', 'Python', 'Docker', 'ExpressJS'],
		description:
			'An online C Examination Portal, where I worked on th code compilation process in backend, as well as containerized it, and deployed on GCP',
		links: [],
	},
	{
		title: 'JPN-prompt-generator',
		tags: ['HTML', 'JavaScript'],
		description: 'A Simple web app to generate word and grammar prompts for japanese learners.',
		links: [
			githubLink('https://github.com/YJDoc2/jpn-prompt-generator'),
			link('website', 'https://yjdoc2.github.io/jpn-prompt-generator/'),
		],
	},
	{
		title: 'Bytecode',
		tags: ['Rust', 'Compiler'],
		description:
			'A Rust proc-macro to derive bytecode for enums and implement functions for conversion to-and-from it.',
		links: [githubLink('https://github.com/YJDoc2/Bytecode')],
	},
	{
		title: 'MapReduce-With-Docker',
		tags: ['Rust', 'Containers', 'Docker'],
		description: "This is a proof-of-concept implementation of Google's MapReduce Algorithm.",
		links: [githubLink('https://github.com/YJDoc2/MapReduce-with-Docker')],
	},
	{
		title: 'Rust NN Web',
		tags: ['Rust', 'WASM', 'HTML', 'JavaScript', 'ExpressJS'],
		description:
			'Compiled the Neural Network written in Rust to WASM and implemented web interface to give input to the NN and predict the digits. This all is done completely in frontend, without the need of sending the data to backend.',
		links: [githubLink('https://github.com/YJDoc2/Rust-NN-Web')],
	},
	{
		title: 'Rust Neural Network',
		tags: ['Rust'],
		description:
			'Implemented a basic Neural Network in Rust from scratch and trained over MNIST data, accuracy up to 95-96%.',
		links: [githubLink('https://github.com/YJDoc2/Rust-NN')],
	},
	{
		title: 'Implementation of Threads',
		tags: ['C', 'Asm', 'OS'],
		description:
			'Implemented support for threading in an existing Kernel, as well as created an API for creation and waiting on threads in c programs, along with implementation of various scheduling algorithms.',
		links: [githubLink('https://github.com/YJDoc2/OS-Project')],
	},
	{
		title: 'Particle Simulator',
		tags: ['C++'],
		description:
			'A C++ program using OpenGL that simulates particles and fields as specified in input file, supports Gravitation and electromagnetism, or both. Shows paths of particles if specified in input file.',
		links: [githubLink('https://github.com/YJDoc2/Particle-Simulator')],
	},
	{
		title: 'Kerberos Implementation',
		tags: ['JavaScript', 'Python', 'JavaScript', 'NodeJS'],
		description:
			'Implemented libraries in both Java script and python for implementing Kerberos Security Protocol.',
		links: [
			link('js-implementation', 'https://github.com/YJDoc2/Kerberos-JS-Module'),
			link('python-implementation', 'https://github.com/YJDoc2/Kerberos-Python-Library'),
			link('examples', 'https://github.com/YJDoc2/Kerberos-Examples'),
		],
	},
	{
		title: 'Interpreter for Equation Parser',
		tags: ['C', 'C++', 'Compiler'],
		description: 'Interpreter for Equation Parser using C++.',
		links: [githubLink('https://github.com/YJDoc2/Equation-Parser-Interpreter')],
	},
	{
		title: 'Equation Parser and solver',
		tags: ['C', 'Compiler'],
		description:
			'An Equation Parser, and evaluator having ability to store and use variables and inbuilt constants using C. Also supports Solving polynomial equations for real roots, and finding factors of polynomial equations.',
		links: [githubLink('https://github.com/YJDoc2/EquationParser')],
	},
	{
		title: "Unicode Master's Portal Project",
		tags: ['JavaScript', 'NodeJS', 'ExpressJS', 'MongoDB'],
		description:
			"A Web Portal to connect passed out seniors who opted for a Master's degree and Juniors Who are currently studying for their Bachelor's degree. This gives facility of chats, forum, Notification System, and to follow user and university accounts.",
		links: [githubLink('https://github.com/djunicode/masters-information-portal')],
	},

	{
		title: 'CodeBook',
		tags: ['Python', 'HTML', 'JavaScript'],
		description:
			'A website similar to Facebook for coding problems sharing. One can create and share coding problems, follow other users, and solve problems. Compiling, Running, and evaluation of submitted code is done in same Backend.',
		links: [githubLink('https://github.com/YJDoc2/CodeBook')],
	},
	{
		title: 'FileStore',
		tags: ['JavaScript', 'HTML', 'NodeJS', 'MongoDB'],
		description:
			"This is a website functioning similar to google drive, where users can store files privately, as well as create 'collections' which are public. This can also display some types of files in-browser. ",
		links: [githubLink('https://github.com/YJDoc2/FileStore-Web-Project')],
	},
];
