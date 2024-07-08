---
title: 'Under The Hood : Assigning Values to Global Variables'
date: 2020-11-13
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

This is the fourth post in the series. In case you have not read the previous post in this series, I would recommend you do, as this builds on the parts of previous, and skips the details explained in the previous posts.

In this post, we will see how the global variables with assigned values in a c file are converted to assembly.

## Simple Global Variables

let's first look at a simple global variable assignment

```C
int a = 5;
```
This generates the assembly :

![Global Variable Assignment Complete assembly](https://dev-to-uploads.s3.amazonaws.com/i/b84we6cc8gd3pqnhqt6h.png)

The changed part is :

```asm
    .globl a
	.data
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	5
```

The `.globl symbol` is used to make the symbol visible to the linker. So, in this case, as  'a'  is supposed to be a global variable, it should be accessible from other files as well, and hence, it is exposed to the linker using `.globl`.

Next the `.data` statement is used to tell assembler to assemble the following statements into the data subsection.
Sections are assembler internal grouping, and have no meaning at runtime. Sub sections are used to further group things within a section. Here it may not be apparent, but when multiple declarations are done, similar types are stored in same sub-sections, for example :

```C
int a = 5;
const int g = 5;
int c = 6;
```

Compiles to :


```asm
    .globl	a
	.data         # a is put in data subsection
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	5
	.globl	g              #start of g
	.section	.rodata # change of section
	.align 4
	.type	g, @object
	.size	g, 4
g:
	.long	5
	.globl	c 
	.data      # c is again put in data subsection
	.align 4
	.type	c, @object
	.size	c, 4
c:
	.long	6
```

Here, the constant g is put in section rodata, and `.data` is used again to put c in same sub-section as a.

Getting back to our simple program,next line, `.align 4` is used to declare alignment as shown in previous articles.

- `.type` is used to denote type of a symbol. For ELF targets (one we are currently compiling for) the syntax is : `.type name , type description`.

- `.type	a, @object` marks the symbol 'a' as having type object. the '@' is part of the type description syntax.
<strong>Note that</strong> here, the object simply means data object, or a piece of data, and not 'object' in an Object Oriented Programming sense, as used in Java or other OOP supporting languages.
For example, other types a symbol can have is function, or thread local object (data which is local to a thread, and cannot be accessed by other threads), etc.

- `.size 4` is used to denote size of the symbol as discussed in previous article.

- `a:` (non-indented) is a label. Labels are used to denote a particular location in assembly file. Now whenever the assembly file would use a 'a' in its statements, that would be translated to the location that the assembler is currently on.

- `.long` is used to put the value(s) of following expression(s), for eg. 5 in case of `.long 5` , in the current location. This combined with the label `a:` is used to access the data stored in variable a.

Let us now see a float variable :

```C
float a = 5.5;
```

generates :


```C
	.globl	a
	.data
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	1085276160
```

Which is similar to int, except the value actually stored. This is due to the fact that floating point numbers are stored in a special representation, called IEEE 754 floating point representation. When converted to this particular format in, 5.5 in binary converts to 01000000101100000000000000000000, which in decimal is 1085276160, and hence that is what is seen stored in the place.

For a double variable, `double a = 5.5;` This is same, except the storage is changed to :


```asm
a:
	.long	0
	.long	1075183616
```

As double takes 8 bytes and `.long` directive only stores 4 byte values, so the first byte is stored as 0, and the second as the value seen before.

For char type variables, it is similar to int, except the character is replaced by its ASCII value:

```C
char a = 'A';
```

is converted to :


```asm
	.globl	a
	.data
	.type	a, @object
	.size	a, 1
a:
	.byte	65
```

As ASCII of 'A' is 65, and `.byte` is used, as char is a byte long data type. And this is how a simple global variables are translated to assembly

## Static Global variable

```C
static int a = 4;
```
Has very similar assembly to `int a = 5;` except that `.globl` is missing, as the variable is static, and hence its visibility should be limited to the file it is declared in.

```asm
     .data
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	5
```

Other types of variables are also converted similar to simple variables, without the `.globl`.

## Constant Global Variables
```C
const int a = 5;
```
generates the assembly :
```asm
     .globl	a
	.section	.rodata
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	5
```
Which again is similar to simple `int a = 5;`, except the `.data` is replaced by `.section .rodata`. This puts the data (5 in this case) in the section .rodata. rodata (short of **r**ead **o**nly **data**), when compiled becomes a section having only Access (read) rights. So any attempt to write to this variable will generate a segmentation fault at runtime.

One other difference one might notice, is that in last post, the un-assigned const global variable is declared with a `.comm` directive. This might possibly because, if a const is declared, but not assigned, it would be present in some other file, and the linker might connect them later ;  but as const variables cannot be assigned twice, when we declare it with a value, it must be the only declaration of them, and hence `.comm` may not be used. (I'm not sure about this explanation, though.)

Again, Other data types are also translated similar to simple variables, with the above changes.

## Global Array Variables

```C
int a[5] = {1,2,3,4,5};
```

Generates :

```asm
	.globl	a
	.data
	.align 16
	.type	a, @object
	.size	a, 20
a:
	.long	1
	.long	2
	.long	3
	.long	4
	.long	5
```

Which is quite similar to normal int declaration, except the alignment is different as discussed in last post, and instead of a single `.long`, there are five `.long` directives, one for each element.

Static and Const arrays are also converted similar to simple global variables :

- `.global` is missing in static arrays
- `.section .rodata` is added for const arrays

For other data types, the storage is done as said in simple global variables, except for char type :

```C
char a[5] = "Hello";
```

is converted as :


```asm
	.globl	a
	.data
	.type	a, @object
	.size	a, 5
a:
	.ascii	"Hello"
```

The size is 5 bytes, as the declared array is of 5 elements, and the data is stored using `.ascii`. `.ascii` assembles the following string(s) into the ASCII representation of its characters, but this does not add a trailing 0 byte.

If we change it to :

```C
char a[6] = "Hello";
```

Where the string that is stored is smaller than the array size,it converts to :


```asm
	.globl	a
	.data
	.type	a, @object
	.size	a, 6
a:
	.string	"Hello"
```
Which uses `.string` instead of `.ascii`, which by default adds a trailing zero byte after each string. 

If we change the array size to 8 :

```C
char a[8] = "Hello";
```

The last part changes to :

```asm
	.string	"Hello"
	.zero	2
```

The `.zero n` directives puts zero valued n bytes in the current location. Here 5 bytes are taken by actual string 'Hello', 1 byte is for trailing 0, and 2 are filled using `.zero` totalling to 8 bytes.

As this post is already long, we will not see global pointer assignment in this post.

Thank you !

Notes:
* [This](https://sourceware.org/binutils/docs/as/Sub_002dSections.html) is a good reference on subsections.
* [This](https://sourceware.org/binutils/docs/as/Type.html#Type) is a good reference for the `.type` directive.
* [This](https://linux-audit.com/elf-binaries-on-linux-understanding-and-analysis/) is a good reference for readelf, which can be used to check sections in a compiled file and much more.
* [This](https://www.h-schmidt.net/FloatConverter/IEEE754.html) Site has a tool to see the conversion of floating point to binary.

