---
title: 'Looking Under The hood : Learning assembly by compiling C'
date: 2020-09-30 00:00:00
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

This is an attempt at a series of posts, where we will take a look at how simple C code compiled into assembly x86, 64 bit. This is also an attempt to learn x86 assembly (in a not-recommended way) and trying to understand how the C code that we write is compiled down to assembly language.

- All code in posts will be compiled using GNU gcc , targeted for Intel 64-bit processor, on Linux based OS.

- This is the 1<sup>st</sup> post in this, and will cover the some basics of processor and execution related stuff, like stack,heap,registers etc.

- Note that I am trying to learn this as I go, so if there are any mistakes, please let me know in the comments !

## How processor understands our code

The journey of our code starts from an code editor (VS code, Atom, Notepad...), where we write the code in a (hopefully) human understandable language. From here, depending on the language, there are several possibilities how it reaches actual execution :
* **Interpreted languages** : Languages like Javascript , Ruby, Pearl, Python are examples of interpreted languages. Here the code stays in text form until we run it. The **runtime** of the language is a program that reads your code and takes appropriate actions.
* **Java-like Compiled Languages** : In Java , the code is first compiled to **bytecode**, stored in .class files, and when running, depending on the _runtime_ **J**ava **V**irtual **M**achine, it may be interpreted, or some JVM also support **J**ust **I**n **T**ime compilation, where the bytecode is compiled into native instructions on the fly.

* **Completely Compiled Languages** : C,C++,Rust,etc all fall in this category. Here,the code is first compiled down to assembly, which is usually **processor architecture specific** ; either directly (like gcc) or in multiple steps (like LLVM based compilers). Then this assembly code is then **assembled** to an object file (.o) by an **assembler**. A **linker** then takes multiple object files and links them together, which is how variables and functions defined in different files or modules are connected together. This generates an Binary file, usually of type **E**xecutable **L**oadable **F**oramat, or can also be a shared library or another object file as well. This is the file that can run. At the time of running, part of operating system called **loader** loads this in memory, sets up other requirements, and then execution of the program starts. (Note that there can be pre-processing steps in compiling, for eg, resolving pre-processor directives starting with '#' etc.)

Here, we will try to understand the first part of the compiling steps, how the C code in translated to x86 assembly (x86 refers to a Processor Instruction set used by most Intel and AMD processors) code.

Before starting that, we should be familiar with some concepts about how the code and data is arranges while running.

## How the Program views the Memory
Even though at a given time there may be multiple processes in memory (RAM) of computer, OS, along with hardware, gives facilities like **paging**, that can give an illusion to the program that except the part where the kernel is residing, all of RAM is available to it.

Thus, for a program, after the space that is required to store its instructions and data, rest of space is available as memory, which is then divided into stack and heap. As from the perspective of OS, each program is split up into multiple **pages**, which are loaded and replaced from RAM as per needed.

## Sections
The compiled code can be **logically** divided into multiple sections. This provides granular control over which section of code are actual instructions and what is just data. At time of Running, for CPU, everything is just bytes, and it is very possible to mistake a data byte as an instruction. To prevent this, OS provides restriction over sections of ELF file,  by which a section can be declared to be read-only(containing constant data),or read-write(containing variables), or executable (containing instructions). When loading the program in memory, the permission of page which contains the read-only data is set to read-only, and attempt of writing or executing it generates an error.

## Stack
Stack is one of the memory data structure available to the program. As by the name this stores the data in a specific, structured way, like a stack (of plates).
![Stack of plates](https://dev-to-uploads.s3.amazonaws.com/i/dlxcgqcdegzmkk29nop1.jpg)
As with a stack of neatly arranged plates, the only operations that does not break things are :
* **push** something on top of current stack
* **pop** something from current top of stack
* **reference** something from the stack (oh! that 5<sup>th</sup> plate has really nice design!)

An attempt to remove things from middle of stack will result into things breaking, and assembly only provides operations for pushing and popping when it comes to stack.
As the stack is continuous, it is faster compared to other type of memory available (heap), and in fact **caching** of stack increases speed of operations. The stack is where **local** variables are stored.

(Insert image of Tom holding stack of plates, from ep.1 using imagination. Couldn't get one with open license!)

## Heap
One of the issues with stack is that the **number of variables** that is to be store on it must be know at **compile time**, as the referencing of variables requires knowing where is the variable located from start of the stack.
When the amount of space needed can be decided only when the program is running, we can use **heap memory**. This memory is located (from perspective of program) between the part that stores instructions and data, and the stack.
![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/r0n91hetrl4daxbajfd5.jpg)

(Yes, the stack **grows downwards** in many of CPU architectures, including X86 based Intel and AMD CPUs)

The OS can give page(s) to the process which requests such dynamic memory allocation, and further the standard library functions (libc malloc,calloc,realloc,free in case of C) controls the allocation of memory in this page to the running program, as the page size be huge compared to the requested size, and multiple requests can be satisfied in single page.
The access to this heap are costly compared to stack, and as random access is allowed , it is easy to corrupt the data which is outside the requested size (as OS allocates whole page, it cannot enforce the checks if you are accessing anything out of bounds in the same page).

## Registers
Registers are another way to store data, but with a constraint to size. These are usually present on Physical CPU chip, and hence are fastest of all three.

In x86, there are 16 registers available, whose size depends on the CPU architecture (32 bit or 64 bit, accordingly). The named registers are :
* A : Accumulator,conventionally used to store result of mathematical operation, or return value of function, if size of result is less than or equal to register size.(Otherwise stored on stack.)
* B
* C
* D
* DI : Destination Index, named so , as in 16-bit processors this was implicitly used as offset for destination in certain instructions. Now it is one of registers used to pass the function arguments.
* SI : Source Index, named so , as in 16-bit processors this was implicitly used as offset for source data in certain instructions. Now it is one of registers used to pass the function arguments.
* BP : On 32-bit systems this is used to store the base pointer of stack , or in case when compiler cannot determine how much stack would a function call need.
* SP : Stack Pointer, points to top of stack.

Remaining are numbered 8-15 unnamed registers, and are referred by their numbers.  

These are the concepts which will be needed in almost all programs, (except heap, but I think it is still worth to know about). Along with this there is a Flag register, which will be explained when it will be needed, as this post is already a long one...

I hope this is something interesting, and you learned something while reading this. I learnt a lot when writing this :)

NOTE : 
* Image of plates of stack is from [Wikimedia, here](https://commons.wikimedia.org/wiki/File:Stack_of_dinner_plates.jpg)
* Image of memory segment arrangement is from [Wikimedia, here](https://commons.wikimedia.org/wiki/File:Program_memory_layout.pdf)
* For a more detailed reference of x86 assembly, see [this guide](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf)
