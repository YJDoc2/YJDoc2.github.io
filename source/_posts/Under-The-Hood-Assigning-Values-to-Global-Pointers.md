---
title: 'Under The Hood : Assigning Values to Global Pointers'
date: 2020-11-20
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

This is the fifth post in the series. In case you have not read the previous post in this series, I would recommend you do, as this builds on the parts of previous, and skips the details explained in the previous posts.

In this post, we will see how the global pointer with assigned values in a c file are converted to assembly.

## Pointers

Pointers are simply variables, which holds address of another variable. One can also chain pointers, which is sometimes used for implementing linked-lists in C, where we store location of variable, which itself contains location of another variable. This would be called a 'pointer to a pointer'.

In previous article, we saw how assigned values to simple global variables like int, float, char etc. , here we will see how values assigned to pointers are converted to assembly.

## Simple Global pointer

Let us first look at a simple (incorrect) example

```c
int *a = 5;
```

This is not a valid code, as it tries to store value 5, which can point to any place in code, probably 6<sup>th</sup> byte from start of data segment, or even code segment, which will give a segmentation fault if we add a main function accessing this value,it will crash with a segmentation fault. But let us see the generated code anyway :smile:

```asm
	.globl	a
	.data
	.align 8
	.type	a, @object
	.size	a, 8
a:
	.quad	5
```
Most part of this is similar to global variables, except the size, which is 8 byte, as the machine I am compiling this on is 64 bit, hence all addresses will be 64 bit, that is, 8 byte. Another difference is value stored in variable a, as `.quad 5`. `.quad` is used to store an eight byte value in place, and it stores the value we gave to it, 5 ,  in its place.

Now let us see an actual example 


```C
int a = 5;
int *b = &a;
```

This generates assembly 


```asm
	.globl	a
	.data
	.align 4
	.type	a, @object
	.size	a, 4
a:
	.long	5
	.globl	b
	.section	.data.rel.local,"aw"
	.align 8
	.type	b, @object
	.size	b, 8
b:
	.quad	a
```
The first part declaring the variable a is same as explained in last article.

Second part starts with `.globl b` , which declares b as a global variable.

`.section` is used to declare section in a program which then can be given specific permission of read-write etc. `.section	.data.rel.local,"aw"` tells assembler to assemble the following section into a section named .data.rel.local, which indicates that it stores data which is relocatable. This means, that in current assembly file, all mentions of this data is by label, as when the file will be linked by linker later, these sections will be moved from their current place to some other place, and only after that, the linker should calculate and substitute their addresses.

The "aw" specifies type of the section, where a is for allocatable, saying that at runtime space should be reserved for this section. A non-allocatable section would be where there is no need to allocated space for it at runtime, such as section containing debugging data. The "w" indicates that this section is writable, implicitly indicating readable as well.

After this the alignment, type and size of b is defined. The value stored here is `.quad a`, which is not evaluated by assembler, but by the linker later , when it links this file. At that time, Linker will decide the address of label a in the complete executable file, and then substitute it to all occurrences.
 
If we define another variable after b,

```C
int a = 5;
int *b = &a;
int c = 5;
```

In assembly, we switch section again by using `.data` before declaring variable c :

```asm
	.globl	b
	.section	.data.rel.local,"aw"
	.align 8
	.type	b, @object
	.size	b, 8
b:
	.quad	a
	.globl	c
	.data
	.align 4
	.type	c, @object
	.size	c, 4
c:
	.long	5
```

The pointer for float, double and a single char are same as above.

When defining a char pointer to a string, that is:


```C
char *a = "Hello";
```

The assembly changes as :


```asm
	.globl	a
	.section	.rodata
.LC0:
	.string	"Hello"
	.section	.data.rel.local,"aw"
	.align 8
	.type	a, @object
	.size	a, 8
a:
	.quad	.LC0
```

Here, after `.globl a` , there is a section change to `.section	.rodata`, saying that the following data should be placed in **r**ead **o**nly **data** section.After that there is a label `.LC0`. According to [a stackoverflow answer](https://stackoverflow.com/questions/5325326/what-is-the-meaning-of-each-line-of-the-assembly-output-of-a-c-hello-world/38290148#38290148), 'LC' indicates Local Constant, and zero is the number of constant. After that the string is stored using `.string` directive as seen in previous article, meaning, it is by default ended with a zero byte. Then we change the section to `.data.rel.local` again, and now we store label of that constant, LC0 in value of the pointer.

## Static Global Pointers

A static type pointer to normal variable ,a normal pointer to a static point variable, and a static pointer to a static variable, all are similar to normal variable, except the missing `.globl` in respective variables


```C
int a = 5;
static int *b = &a;
```

Will have a missing `.globl` on b,


```C
static int a = 5;
int *b = &a;
```

Will have `.globl` missing on a,

```C
static int a = 5;
static int *b = &a;
```
will have `.globl` missing from both.

## Global Constant pointers

Let us first see a constant pointer to a non-constant variable:


```C
int a =5;
const int *b = &a;
int g = 5;
```

Surprisingly (for me) this does make any changes to assembly generated, neither this stops from writing


```C
void main(){
     b = &g;
}
```

This compiles and runs without any error.

But this :


```C
void main(){
     *b = &g;
}
```

Will generate a compile time error as :


```
global_assg.c: In function ‘main’:
global_assg.c:5:18: error: assignment of read-only location ‘*b’
    5 | void main() { *b = g; }
      |  
```

Which means, that a constant pointer stops from modifying value of what it points to by using it. We can change value of a by directly using a, but we cannot change value of a by using `*b = something;`

A normal pointer to constant entity:

```C
const int a =5;
int *b = &a;
```

will generate a compile time warning:


```
global_assg.c:2:10: warning: initialization discards ‘const’ qualifier from pointer target type [-Wdiscarded-qualifiers]
    2 | int *b = &a;
      |
```
but will compile nonetheless. As a itself is const, it is placed into rodata section,hence any attempt to change value of a using `*b = something;` will result in a runtime segmentation fault.

```C
const a = 5;
const int *b = &a;
```
const pointer to const variable compiles without any warnings or error.

## Global Array pointers

Now in array of pointers :


```C
int b,c,d;
int *a[] = {&b,&c,&d};
```

Will be compiled as :

```asm
	.globl	a
	.section	.data.rel.local,"aw"
	.align 16
	.type	a, @object
	.size	a, 24
a:
	.quad	b
	.quad	c
	.quad	d
```
Which follows from both, pointer as well as arrays : it is put in section same as pointer, but declared same as array, with size of 3 pointers, 8*3 = 24 bytes. The values are stored as labels for d,c and d.

Adding static to a will simply remove `.globl` from above, and adding const to array will stop any code assigning value through the array that is `*a[1] = something;` from compiling. Other combinations of const give results similar to non-array pointers mentioned above.

## Pointers To Pointers
A code like
```C
int a = 5;
int *b = &a;
int **c = &b;
```

Will have assembly code for a and b same as before, and for c it will generate :


```asm
	.globl	c
	.align 8
	.type	c, @object
	.size	c, 8
c:
	.quad	b
```
Where in the value of c, label b is used.

This is how global assigned pointers are converted to assembly when compiling from c.

Thank you !

NOTES :
* [This](https://stackoverflow.com/questions/7029734/what-is-the-data-rel-ro-used-for) is an explanation of .data.rel section.
* [This](https://stackoverflow.com/questions/24655839/what-is-the-difference-between-executable-and-relocatable-in-elf-format) is a good explanation on what is a relocatable section.
* [This](https://www.linuxtopia.org/online_books/redhat_linux_developer_tools_guide/s1-ld-gnu.html) is a short explanation on allocatable and loadable section.
* This video has a nice explanation on ELF files and segments and sections in it : https://youtu.be/nC1U1LJQL8o
