---
title: 'Under the Hood : The Main Function'
date: 2021-01-09
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

Hello!
This is the sixth post in the series. In case you have not read the previous post in this series, I would recommend you do, as this builds on the parts of previous, and skips the details explained in the previous posts.

In this post, we will see how the main function is converted to assembly.

## A simple main function

Let us consider the simplest use of main function :

```C
void main(){}
```

This generated the code

![Main Function Assembly](https://dev-to-uploads.s3.amazonaws.com/i/8hwnxwqmq6hxl6v7qrep.png)

Which we will now take a look at. I will be skipping the part which was explained in previous posts, and will start from the main function itself.

## Main Function

```assembly
	.globl	main
	.type	main, @function
main:
.LFB0:
	.cfi_startproc
	endbr64
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register 6
	nop
	popq	%rbp
	.cfi_def_cfa 7, 8
	ret
	.cfi_endproc
.LFE0:
	.size	main, .-main
```

Let us see this, line by line.


```asm
.globl main
```

Declares `main` as a global symbol, which means it will be visible to other linked files as well.


```asm
.type main, @function
```

This sets the type of symbol main to function name.


```asm
main:
```

declares the label main, which is used by the _start function which does the initial set up for the program execution. This is explained a bit in [ref stackoverflow](https://stackoverflow.com/questions/29694564/what-is-the-use-of-start-in-c/29694977#29694977)

```asm
.LFB0:
```
Is the label indicating **L**ocal **F**unction **B**eginning, and 0 indicates that it is the first in file from start, similarly the label `.LFE0:` indicates the end of local function 0. Next are,


```asm
.cfi_startproc
endbr64
```
- The `cfi` stands for Call Frame Information, and it is used when unwinding the stack in case of exceptions or errors.
- The `cfi_startproc` indicates the start of a procedure/function.
- The `endbr64` is an assembly instruction `End branch 64`. This is used to detect invalid jumps:The first instruction after making a jump of a call to function must be an endbr64, which tells processor that this is a valid and intended place to jump/call. If it is not found, then the jump/call becomes invalid, and a fault is generated - [ref stackoverflow](https://stackoverflow.com/questions/56905811/what-does-the-endbr64-instruction-actually-do/56910435#56910435).

```asm
pushq	%rbp
```

This pushes the current value of Base pointer register on stack.

```asm
.cfi_def_cfa_offset 16
.cfi_offset 6, -16
```

These again are cfi directives, the first one is for declaring the change of stack address which occurs afterwards, and second declares that previous value of register 6 (SP) is stored at offset of -16 from current call frame address - [ref stackoverflow](https://stackoverflow.com/questions/7534420/gas-explanation-of-cfi-def-cfa-offset/7535848#7535848).


```asm
movq	%rsp, %rbp
```

This moves value of current stack pointer into the base pointer, indicating that now the base of stack is moved to the current stack top.
**NOTE** this is in AT & T syntax, where the order is `opcode source , destination`.


```asm
.cfi_def_cfa_register 6
```
This states that from this point onward, register 6 (SP) will be used for Call Frame Address.


```asm
nop
```
indicates No Operation, which is usually used to either fill in to make the resulting addresses of instruction that has advantages in processor cache, or which can be used to debug the functions. A discussion on it can be found [https://www.reddit.com/r/C_Programming/comments/ecr9pp/why_does_gcc_include_nooperation_nop_assembly/](https://www.reddit.com/r/C_Programming/comments/ecr9pp/why_does_gcc_include_nooperation_nop_assembly/).

```asm
popq	%rbp
```

This pops the stack top into the BP register. The stack top contained only the original value of BP register, because of pushq instruction, which is now restored.


```asm
.cfi_def_cfa 7, 8
ret
.cfi_endproc
```
The First CFI directive `cfi_def_cfa` tells to take value from register 7 (BP), and add offset 8 to it, to get the new Call Frame Address. After it is ret, which is used to return from a procedure/function, and then the cfi directive indicates the end of the function. After the `.LFE0` label, we have


```asm
.size	main, .-main
```

Which declares size of the symbol main, which is declared using `.-main` where `.` indicates current value of address pointer, and the address of main label is subtracted from it, to get the size of main function. After this is part we have seen in previous posts.

This is how the main function is converted to assembly when compiling from c.

Thank you !

---

**Notes** :

* For more information on CFI , check out [https://www.imperialviolet.org/2017/01/18/cfi.html](https://www.imperialviolet.org/2017/01/18/cfi.html) and [https://sourceware.org/binutils/docs/as/CFI-directives.html#CFI-directives](https://sourceware.org/binutils/docs/as/CFI-directives.html#CFI-directives)
