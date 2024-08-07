---
title: 'Under The Hood Of C With Assembly : No Code'
date: 2020-09-30 00:01:00
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

Hello!
This is the second post in the series where we will start looking at the compiled assembly code. In case you have not read 1<sup>st</sup> post, I'd suggest to read that as it explains basic stuff like stack, heap, registers etc.

I'm learning this all as I write this, If you find any mistakes or have any suggestions and improvements, please let know in comments.

That said, let's see the first C program compiled to assembly code. Taking the quote 'Best code written is no code written' a bit too literally, we will see assembly generated after compiling a completely empty C source file. If we try to compile this to a binary, we will get an error from linker, saying something like 
```
undefined reference to `main'
```
as we need a starting point for execution, which is provided by main function in C. Then why are we using this as first example? So that we can see what bare minimum things would be included in all assembly files, and this should give us a nice starting point.

## about Syntax, A word
After giving the an assembly file to an assembler, it converts the text code (known as **opcode** or **mnemonics**) to binary. Now the processor itself only understands binary, So as long as the binary code corresponding to the instruction is given correctly, it does not matter how the assembly was written. Due to this there are two main syntax, that are generally used when writing assembly
* AT & T : The syntax that is used by default in GCC.
* Intel  : This is used by NASM, MASM, TASM assemblers.

There are several difference to note in these :
* Order of operands : when we say `a = b;` in C, we mean that value of b is copied from b to a. Same is true in Intel Syntax, where first operand is destination, second is source. AT & T Syntax is exact opposite, where first operand is source and second is destination. Thus
```assembly
; Not real assembly
copy a ,b 
```
will copy value of b to a in Intel syntax ; where as copy value of a to b in AT & T Syntax.
* Addressing Order : As assembly directly deals with memory, we need to give address of a memory.
     * In Intel the Syntax is [base+index*scale+offset], so that address 142 can be represented as [100+10*4+2].
     * In AT & T the Syntax is offset(base,index,scale), so the address 142 can be represented as 2(100,10,4).

* Suffixes : 
     * AT & T :all instructions must be suffixed with q(quad word), l(long as for double word), w (word), b(byte) as per size of operand.
     * Intel : The size is derived internally as per operand.

* Type of operand : In AT & T all raw values (any number that is supposed to be a value) must be prefixed with $, and registers must be prefixed with %. The Intel syntax internally detects the type internally.

With this I think the Intel syntax can be easy to understand, but gcc by default uses AT & T Syntax (can be changed by passing `-masm=intel` to gcc. This Changes the syntax and adds an _assembler directive_ `.intel_syntax noprefix` to generated file.) I have not yet decided which to use for these posts, so for the rest of posts, I will state which syntax is being used at the start of the post.

## First Assembly File

So now, without further ado, this is the assembly file generated by compiling an empty C file.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/9mgm0sp0k20s3vavlq71.png)

## Assembler Directives
In the above snippet, there are some instructions that start with a `.`, like `.file` , `.text` etc. These instructions are called as **assembler directives**. These do not actually compile to binary, but instead are there to help assembler for various purposes.
Additionally, there are also **labels** which can start with a `.`,such as `.LBF0` that you can see in header. There is no label that starts with a `.`  in the above example, but the number 0,1,2,3,4 followed by `:` are labels, too. Labels are used to reference various points in the assembly file. A label will refer to the immediate next instruction.

Let's look at this line by line :
```asm
.file "base.c"
```
aptly named, this is an assembler directive which shows the start of a logical file. This shows from which C file this asm file was compiled and can be used for debugging info.

```asm
.text
```
This assembler directive shows that the following lines contain the executable code. Even though the name is text, it actually refers to executable instructions. After searching a bit I found this stack overflow question that might answer why it is called so :


```asm
.ident	"GCC: (Ubuntu 9.3.0-10ubuntu2) 9.3.0"
```
`.ident` puts the following data in the comment section of the generated binary file, which can be used to recognize the compiler etc. used to compile to the binary.

```asm
.section	.note.GNU-stack,"",@progbits
.section	.note.gnu.property,"a"
```
the `.section` directive is used to put the following code/data into the sectioned named as given. `@progbits` denotes that the section will be stored on disk only, and not loaded at runtime, so it will contain extra information.


As per [this wikipedia page](https://wiki.gentoo.org/wiki/Hardened/GNU_stack_quickstart), the `.note.GNU-stack` is used to disable the executable stack option.In past Linux supported execution on stack, which led to security vulnerabilities, and this section instructs linker that the stack should not have execution permissions.


Now I searched what the properties section is used for, but I have still not found a great explanation for this. At most I think it is used to define properties of the binary file that will be generated, but do not know why the `a` is there.

```asm
.align 8
```
This is used so that the next instruction would be stored in a location that is a multiple of 8. The reason for this is on many CPUs fetching of data from certain location addresses is faster compared to other locations,hence this is used to improve the performance of the code.

```asm
.long	 1f - 0f
.long	 4f - 1f
.long	 5
```
The `.long` instruction puts the value of the following expression(s) in the place.These would place 10H, 30H and 5H respectively. I initially did not know why these are used, but after searching a lot, and finding [this](https://sourceware.org/bugzilla/show_bug.cgi?id=22914) from which I got the start and then looking at [gcc source](https://code.woboq.org/gcc/gcc/config/i386/cet.c.html), I found out that these are related to the name field and description/data field:

> Each note is followed by the name field,and then by the descriptor field

from [manpage of elf](https://manpages.debian.org/buster/manpages/elf.5.en.html)


As the section name `.note.GNU-stack` is 15 character long, and accounting for one 0 byte, This is set to 16 (1f-0f). The next is length of descriptor field in bytes, which is set to 30H. Last part is type of note, the 5 is value which corresponds to `NT_GNU_PROPERTY_TYPE_0`.


```asm
0:
	.string	 "GNU"
1:
	.align 8
	.long	 0xc0000002
	.long	 3f - 2f
2:
	.long	 0x3
3:
	.align 8
4:

```
These are the vendor and properties related details:
- 0 label is for the vendor name, GNU.
- 1 label is aligns the memory location and then sets property type 0xc0000002, corresponding to property `GNU_PROPERTY_X86_FEATURE_1_AND`. Then sets property datasize to 3f-2f.
- 2 label sets value for `GNU_PROPERTY_X86_FEATURE_1_XXX`, where XXX is replaced conditionally by a value depending on the architecture, which is this case is 0x3. 
- For both `GNU_PROPERTY_X86_FEATURE_1_AND` and `GNU_PROPERTY_X86_FEATURE_1_XXX` I tried to search more details but could not find any more explanation in source.
- 3 label again aligns the location

Again for label 4, I could not find explanation, but I think it might be used to denote the end location.

And this concludes the first assembly file, compiled from empty C file.
 
This was a long post, but I wanted to explain things in a bit detail.Even though I couldn't find explanation to all things, I had fun learning about the details that I did found, and hope you enjoyed this as well.

Thank you!

NOTE :
An explanation of GNU Assembler syntax can be found [here](https://en.wikibooks.org/wiki/X86_Assembly/GAS_Syntax).

