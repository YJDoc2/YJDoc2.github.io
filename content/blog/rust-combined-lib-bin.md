---
draft: false
title: Make a Combined Library and Binary Project in Rust
publishedDate: 01 April 2024
---

In this article, we will take a look at how to create a combined library-binary project in Rust.

In Rust, Cargo can create two types of projects :

* **library** projects which usually contains core logic and functions that together make some kind of library, and is not compiled to a runnable program as it does not have main function, instead it is compiled to some kind of shared library file. These are used by other runnable programs and libraries for internal use.
These are created by running 


```sh
# For creating a new dir
cargo new --lib my_project
# For creating in current dir
cargo init --lib
```

* **binary** projects which can be compiled to runnable program, which can be directly run, and faces users.
These are created by running


```sh
# For creating a new dir
cargo new my_project
# For creating in current dir
cargo init
```

Now there are many cases where you might want to create a library along with a binary, where the binary can be installed by user, and run, and the library can be uploaded to crates.io, or just on some git server like github, and can be used by other projects, including that project itself. For example, take a look at
{% github YJDoc2/8086-Emulator %}
This contains a runnable binary, the 8086 emulator, which can be installed and run as a program, but also contains the core emulator library, which can be used in other projects as well, as it is used here :
{% github YJDoc2/8086-Emulator-Web no-readme %}

Thus the same code can be reused easily.

Now let us take a look at how to convert a newly created or existing only-binary or only-library project into a combined library-binary project.

## From lib project
When we create a lib project using Cargo, we get a src folder, with a lib.rs, and a Cargo.toml. One might then add other files and folder inside src, consisting of the library's modules and functions.
Now to add a binary to this, we need to make the following changes :
* Add a lib key in Cargo.toml
```toml
[lib]
name = "your_library_name"
path = "src/lib.rs"
```
This will declare the library , as per the things made pub in the lib.rs
* Create a bin folder, and make a bin.rs (or any other name)
* Add a bin key in Cargo.toml
```toml
[[bin]]
name = "your_program_name"
path = "src/bin/bin.rs" # replace bin.rs with name of your file
```
* To use the library in binary, just add following `use` statement and use that as any other import.
```rust
use your_library_name;
...
your_library_name::your_library_function();
...
```
Now when you will add a main function to bin.rs and run `Cargo run` , you can see the output of the binary :tada: :tada:

Note that you can make a lib folder and create library files inside it, and keep binary files in src if you are creating a new project. But it can be hard if you are adding binary to existing lib project to shift library files from src to src/lib, maintaining the `use` statements of each file in other files with correct paths. Thus, we create a bin folder and add binary files to it.

## From bin project
A Cargo created binary project comes with a Cargo.toml, and a src folder with main.rs.
Now to add a library, or to port existing parts as a library :

* Add bin key to Cargo.toml
```toml
[[bin]]
name = "your_program_name"
path = "src/bin.rs"
```
* Create lib folder, and add a lib.rs to it.
* Add lib key to Cargo.toml
```toml
[lib]
name = "your_library_name"
path = "src/lib/lib.rs"
```
After this, any pub functions or modules in lib.rs will be available as the library.

Now you can use your library in your binary, just as you use your other dependencies :
```rust
use your_library_name;
...
your_library_name::your_library_function();
...
```
That's how one can create a combined library-binary project :tada: :tada:

Thank you for reading !

If you have any questions, or found any mistakes in this, please write in comments :smile:
