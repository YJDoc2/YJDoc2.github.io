---
title: 'Under The Hood : Unassigned Global Variables'
date: 2020-10-21
series: Under the hood of C
tags: [c, compiler, assembly]
categories: assembly-from-c
---

This is the third post in the series. In case you have not read the previous post in this series, I would recommend you do, as this builds on the parts of previous, and skips the details explained in the previous posts.

In this post, we will see how the global variables declared in a c file are converted to assembly.

## Simple Global Variables

For the first case we will simply declare an in and compile it to assembly :

```c
int a;
```

The generated complete generated assembly file is :

![Global Variables Complete Assembly](https://dev-to-uploads.s3.amazonaws.com/i/wu0vsj5fqx95w9pz5dae.png)

Now many of these lines are discussed in previous posts, so if you have not yer read them, I would suggest you read them before this. For the rest of this post, We will only see the lines that are different in this.

Compared to assembly file of completely empty C, this only contains one additional line :

```asm
.comm	a,4,4
```

The general syntax for comm directive is :

```
.comm name, length
```

The .comm directive is used to declare common symbols/variables. This means that when multiple files will be linked by the linker, the variables with same name can be merged into a single. If different variables are of different sizes (say int and double) the the largest required size will be allocated for the variable. In case where there is a single definition of a variable, `length` bytes will be allocated for that variable.

When compiling for ELF target, (as in this case), the comm directive can take an optional third argument :

```
.comm name, length, alignment
```
Thus in our program above, the directive declares a symbol/variable of name a, whose length is 4 bytes, and which should be aligned on a 4-byte boundary.

If we change the c to :

```c
int a;
float b;
```

The assembly changes to :

```asm
.comm	a,4,4
.comm	b,4,4
```

As on 64 bit system (as the one I am using) the size of int and float is same, 4 bytes.

Now if we change our c to :

```c
double a;
```

The assembly is changed to :

```asm
.comm	a,8,8
```

As the size of double is 8-byte.

## Static Global Variables

`static` keyword is used to define variables/functions which are only visible inside the files in which they are defined.

if we write our c as :

```c
static int a;
```

The assembly generated is :


```asm
.local	a
.comm	a,4,4
```
The .local directive takes list of symbol names, which will not be externally visible. As this does not support alignment, the .comm directive is used in combination to declare a local variable with desired alignment.

If we change the c to :

```c
static int a;
static char b;
```
The corresponding assembly changes to :

```asm
.local	a
.comm	a,4,4
.local	b
.comm	b,1,1
```
Which declares an int as mentioned above, as well as a character, which is 1 byte long.

## Constant Global variables

We use constants to declares variables which should not be changed after initial declaration. If we declare a constant in c as :

```c
const int a;
```

We observe that the generated assembly is not any different from simply declared global int :

```asm
.comm	a,4,4
```

But if we introduce a main function and try to assign a value to it, we get an error :


```c
const int a;
void main(){a = 5;}
```


```bash
global_var.c: In function ‘main’:
global_var.c:3:17: error: assignment of read-only variable ‘a’
    3 | void main() { a = 5; }
      |                 ^
```
Which indicates that the `const` property of **uninitialized** variables is enforced by c compiler on c-to-assembly stage, and the assembler does not know anything about it.

## Global Array Variables

Now let's see global array variables :

```c
int a[5];
```

This generates :

```asm
.comm	a,20,16
```

Which instructs the assembler to keep 5*4=20 bytes of memory aside for the symbol/variable 'a'. The alignment is rounded to nearest power of 2 :
- `int a[2];` generates `.comm a,8,8` 
- `int a[7];` generates `.comm	a,28,16`
- `int a[8];` generates `.comm a,32,32` 

But this alignment is bounded by 32, and the maximum alignment is of 32 bytes only. The larger sizes are still aligned at 32 bytes only. This might be due to larger the alignment, more memory it might waste, trying to align at higher alignment.

The static and const arrays are compiled similar to other static and const variables : 

* static generates a `.local` directive for the array name.
* const for **unassigned** array is enforced at c-to-assembly compile time and does not show up differently in assembly.

## Pointer Variables

Pointers are used to store memory address of some other variables, which themselves can be normal variables or pointer variables. As these has to store address, they must be as long as size of address accessible on machine. For a 64 bit system, it is 8 bytes, and thus pointer to any variable is 8 bytes long.

```c
int *a;
char *b;
```

is converted as 


```asm
.comm	a,8,8
.comm	b,8,8
```

Static and const pointer variables are treated similar to normal variables, except size which is 8 for all, and similarly in arrays, the size of each element is set as 8 bytes.


```c
int *a[5];
```

is converted to 


```asm
.comm	a,40,32
```

This is how uninitialized global variables are translated from c to assembly.

Thank you !
