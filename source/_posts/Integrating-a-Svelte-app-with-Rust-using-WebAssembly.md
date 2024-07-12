---
title: Integrating a Svelte app with Rust using WebAssembly
date: 2022-06-24
tags: [rust, tutorial,wasm,svelte,javascript]
logrocket: https://blog.logrocket.com/integrating-svelte-app-rust-webassembly/
categories: logrocket
---
Svelte is a JavaScript framework that is quickly growing in popularity among web app developers. But what if we want to use the Rust programming language for its speed, safety, and other benefits instead of JavaScript or TypeScript? We can do so thanks to WebAssembly. 

WebAssembly is type-safe like TypeScript and, since it is compiled beforehand instead of at runtime, much faster than even JavaScript. Combining this with the ease of Svelte and its ability to update the UI without a virtual DOM, we can make even heavy applications blazing fast!

In this article, we will see how to connect a Svelte frontend with Rust code by compiling Rust to WebAssembly, along with how to call functions and pass data between JavaScript and Rust. Specifically, we will cover:

- What is Svelte?
- What is Wasm?
- Why use Wasm with Rust?
- Setting up our system with Rust, Wasm, Node, and other packages
- Setting up our Svelte+Wasm+Rust project
    - Creating our Svelte app
    - Setting up Rust for our project
- Connecting Svelte and Rust
- Adding style with `carbon-vomponents-svelte`
- Exposing structs and `impl` methods
- Passing complex data types between JavaScript and Rust
    - Using handles and calling JavaScript functions from Rust
    - Using Rust through Wasm in Svelte with the `serde.json` approach
- Increasing WASM memory size

You will need basic knowledge of Rust to follow along with this tutorial. This may include reading, writing, and understanding variable declarations, `if…else` blocks, loops, and structs. A bit of knowledge about Svelte will also be helpful.

## What is Svelte?

Svelte is another front-end framework, similar to React or Vue. Like these two, you can use Svelte to make single-page applications. However, Svelte has some features that make it strikingly different from the other frameworks. 

For example, Svelte, unlike others, is primarily a compiled framework; most of the Svelte library is a `devDependency` and not a runtime dependency. This helps make the final app smaller and faster for the client to download. 

Another difference is that Svelte does not use a virtual DOM. Instead, it uses various strategies to update only the specific parts of the page that were changed. This reduces the overhead and makes the application faster.

Svelte also provides ease of use by not requiring classes or functions to declare components. Each Svelte file is treated as a component by itself. 

Finally, Svelte has very few hooks. Although hooks are required for lifecycle features, Svelte does not need complex state-management hooks. The state can be stored and used simply by declaring a variable, just like in vanilla JavaScript.

## What is Wasm?

WebAssembly (Wasm) is a binary instruction format that our browsers can run along with JavaScript. 

However, unlike JavaScript, it is already in the binary format, has type information already resolved at compile time, and does not need interpreting or just-in-time compilation. Because of these and some other reasons, it can be much faster than JavaScript in many cases.

Wasm is a compilation target, and several languages — including Rust — can be compiled to it. Thus, we can write our program in Rust, compile it to Wasm, and run it using JavaScript in the browser.

## Why use Wasm with Rust?

There can be many advantages of using Wasm with Rust. Let’s take a look at a couple of practical project examples.

You can write a library in Rust containing core functions and then use it for both a web app and a desktop or command line app by compiling it to Wasm. One such example is the [8086 emulator](https://yjdoc2.github.io/8086-emulator-web/).

In the 8086 emulator, the core emulator and compiler are written in a platform agnostic library, then adapted to both command line and web formats by writing a thin platform-specific interface.

Another great use can be for quickly getting an interactive demo for libraries without having to write complex command line programs or purely text-based examples. We can create a graphical web interface and call the library functions from event handlers such as button clicks. 

Take a look at this web interface for pcb-rs [library examples](https://yjdoc2.github.io/pcb-rs-examples/), which demonstrates this use case. This example provides a demo for a hardware simulation library along with an interactive interface to play with it, written in Svelte.

This is not only limited to small projects; even giant projects such as [Figma use wasm](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/) to adapt their desktop applications to web so they can be conveniently and easily used. 

As a side note, Wasm is not a replacement for server-side logic. It still runs in the client’s browser, so you will still need something to serve the Wasm files, even if it is just a static file server. 

## Setting up our system with Rust, Wasm, Node, and other packages

Let’s begin by setting up the system. 

First, install Rust by [following the instructions on their official website](https://www.rust-lang.org/learn/get-started). This will install and set up Rust language tooling, such as the compiler and standard library, on your system.

Then, [install wasm-pack](https://rustwasm.github.io/wasm-pack/installer/), a helper tool for compiling Rust to Wasm. This tool also takes care of downloading the required tool chain for compiling to Wasm.

Finally, install Node.js, npm, and npx by following [an installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). You might need to install [npx separately as a global package](https://www.npmjs.com/package/npx).

To check everything is set up correctly, try running the following commands and see if anything gives an error:

```bash
> npm --version
> npx --version
> node --version
> cargo --version
> rustc --version
> wasm-pack --version
> rustc --print target-list # This list should have wasm32 targets
```

If these commands run without any errors, then we have successfully completed our system setup.

## Setting up our Svelte+Wasm+Rust project

There are various ways to set up a web project that uses Svelte, Wasm, and Rust. For example, wasm-pack from the rust-wasm group [provides a template](https://github.com/rustwasm/wasm-pack) for simple HTML-CSS-JS applications. There are also several project templates for React or Svelte with Rust and Wasm.

However, instead of any templates, we will be using an npm plugin, which will provide us more flexibility for the project structure. 

### Creating our Svelte app

To start, create a project directory. In this directory, we will first create a Svelte app using their template by running the below:

```bash
> npx degit sveltejs/template svelte
```

In the code above, we named our app `svelte`, but you can name it whatever you want.

Again in the project directory, run the following to create a Rust library project directory:

```bash
> cargo new --lib rust
```
In the code above, we named our library `rust`, but you can give it a different name.

Now, go into the `svelte` directory, and run the following command to install the basic dependencies :

```bash
> npm install
```
After this, we will install `rollup-plugin-rust`, which will auto-compile the Rust code to Wasm and allow us to easily import things from Rust into JavaScript.

```bash
> npm install @wasm-tool/rollup-plugin-rust
```

Next, open the `rollup.config.js` file and add the following import statement:

```js
import rust from '@wasm-tool/rollup-plugin-rust';
```
In the same file, after the `serve` function, there will be an `export default` statement. This statement exports the configuration object. In that configuration object, there will be a `plugins` array. We need to add the Rust plugin to this array, like so:

```js
...
plugins: [
     rust({ 
        verbose: true,
        serverPath: "build/"
     }),
     svelte({
...
```

[The plugin provides several options](https://github.com/wasm-tool/rollup-plugin-rust). Most importantly, for our project:

- `verbose` will show the compiling step and its output whenever it compiles your Rust code  
- `serverPath` specifies which path the Wasm file will be served from

We set the `serverPath` to `build` because in development mode, Svelte serves files from the `build` directory. If we want to deploy our project, the `serverPath` needs to be adjusted accordingly. 

Run `npm install` again to install this plugin. This should conclude the setup of our Svelte project.

### Setting up Rust for our project

To set up Rust for our project, change the directory to `rust`. Open the `Cargo.toml` file and add the following after the `[package]` key and before the `[dependencies]` key:

```toml
[lib]
crate-type = ["cdylib", "rlib"]
```
In the `[dependencies]` key, add the following:

```toml
wasm-bindgen = "0.2.63"
```

Run `cargo build` once to fetch and install the dependencies.

With this, the basic project setup is ready.

## Connecting Svelte and Rust

We will first connect Svelte and Rust by exposing a simple `add` function from Rust and calling it from Svelte. This step is simple, but will help us validate that both are connected and running as expected.

In the `rust` directory, open the the `src/lib.rs` file and delete the default test from it. In the now-empty file, add the following:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: usize, b: usize) -> usize {
    a + b
}
```
In the code above, we first imported the `prelude` from `wasm_bindgen`, which provides the macros and other items needed to compile and bind Rust code to Wasm. 

Also, anything that we want to expose to JavaScript needs to be public, hence the `pub` keyword on the function. Meanwhile, `#[wasm_bindgen]` provides the necessary binding “glue.”

Now, back in the `svelte` directory, open the `main.js` file and add the following `import` command:

```js
import wasm from '../../rust/Cargo.toml';
```
In the code above, we called the import `wasm`, but you can name it whatever you want. The path should point to the `Cargo.toml` file of the project we want to compile and import it as Wasm. We can import multiple projects like this, with different names and corresponding paths.

With this, the plugin that we installed before will intercept the import, compile the Rust code, set up Wasm, and connect it to our Svelte application for us!

Because the Wasm import needs to be done asynchronously, we will change the app definition and `export default` statement to the following:

```js
import App from './App.svelte';
import wasm from '../../rust/Cargo.toml';

const init = async () => {
      const bindings = await wasm();
      const app = new App({
      target: document.body,
      props: {
                bindings,
              },
    });
};

init();
```
In the code above, we defined and called an async function, which will await the import and then pass it as a prop to the app.  Everything that the Rust library exposes using `#[wasm_bindgen]` is now accessible in this imported module; thus, our `add` function can be accessed as `bindings.add`.

Now we will delete everything in the `App.svelte` file and add the following:

```js
<script>
export let bindings;
</script>

<h1>
{bindings.add(5,7)}
</h1>
```
Next, run `npm run dev` in the `svelte` folder. If everything is correct so far, it should show the Rust compiling (although it might take a bit of time during your first run). 

After the compilation is done, it will show the Svelte message that the server is connected to `localhost`. When you open the `localhost` url, it should show the number 12.

Congratulations, we have connected Rust to Svelte!

You can play around a bit by adding and exposing more functions and calling them from JavaScript. 

Currently, we can only pass simple parameters such as `usize`, `bool`, and so on. However, we will see later how to expose structs as well as `impl` methods to JavaScript, along with how we can call JavaScript functions from Rust.

Before we get into that, let’s add a bit of style to our Svelte app.

## Adding style with `carbon-components-svelte`

This short section will explain how to set up and add style to our Svelte app using `carbon-components-svelte`. We could also use some other library for styling, such as Material UI or Bootstrap, and it would not make much difference.

We will quickly add `carbon-components-svelte` using the minimum required steps, but you can check [the library’s documentation](https://carbon-components-svelte.onrender.com/) for more detailed information and examples.

To start, install `carbon-components-svelte` by running the following in the `svelte/` directory:

```bash
> npm i -D carbon-components-svelte
```
We will then import the stylesheet into `main.js` . It supports few themes out of the box, such as `white` , `gray10` , `gray80`  and so on, along with dynamic theming support and custom theme support. We will be using the `gray80` theme in this example.

Add the following `import` command in your `main.js` file:

```js
import "carbon-components-svelte/css/g80.css";
```
Make the following slight change in the `App.svelte` file:

```js
<script>
...
import {Content} from 'carbon-components-svelte';
...
</script>

<Content>
<h1>
{bindings.add(5,7)}
</h1>
</Content>
```

If you take a look at the page now, it will have a nice gray background and the number 12 as before, now with added margins and padding.

While you can build other web components with Svelte, or even build your own component library, this is the extent of the styling that we will be doing. Besides using an input component later, we will return our focus to connecting Rust and Svelte.

## Exposing structs and `impl` methods

This next section will be slightly more advanced and complex. We will define a struct in Rust and use it from JavaScript to pass values to a function. We will also see how we can expose `impl` methods and call them from JavaScript.

To start, let’s add a simple struct called `Car` in our Rust project’s `lib.rs` file:

```rust
#[wasm_bindgen]
pub struct Car {
    pub number: usize,
    pub color:usize, // color in hex code
}

#[wasm_bindgen]
pub fn color(a: Car,color:usize) -> Car {
    Car {
      number: a.number,
      color
    }
}
```
In the code above, we added the `#[wasm_bindgen]` Rust library to the struct along with a  `color` function, which takes a `Car` type parameter and a `color` of type `usize`. We also explicitly added `pub` on `number` and `color` fields of `Car` to ensure they are exposed to JavaScript.

In our `svelte` directory, let’s change our `App.svelte` file as follows:

```js
<script>
export let bindings;
import {Content} from 'carbon-components-svelte';
let {Car,color} = bindings; // destructure for easier access
console.log(Car,color);
</script>

<Content>
<h1>
</h1>
</Content>
```
In the code above, we destructured `bindings` to extract `Car` and `color`. We also removed the call to `add` . 

If we take a look at the console, we can see that `Car` is a class and `color` is a function. However, we cannot directly instantiate `Car` as a class using `new Car()` because inherently, it is a Rust struct and does not possess a `constructor` per se. 

Thus, to instantiate it, we must add the `new` method to the `Car` class and expose it as well:

```rust
#[wasm_bindgen]
impl Car {
    pub fn new() -> Self {
        Car { number: 0, color: 0 }
    }
}
```
Note that we can tag a method of the struct, such as `new` in the code above, to be treated as a `constructor`. However, we will only touch on this concept briefly in the next section.

Next, in `App.svelte`, add the following:

```js
let {Car,color} = bindings; // destructure for easier access

let c = Car.new();
c.number = 5;
c.color = 775577;
console.log(c);

let c2 = color(c,557755);

console.log(c2.number,c2.color);
```
If we take a look at the console now, we can see the first `console.log` showing something like the following:

```js
Object {ptr:...}
```
To understand why `console.log(c)` results in this output, we must understand what exactly the `Car` instances are.

The way Wasm runs in the browser is on a stack-based virtual machine. We would need a whole other article to talk about how and why WebAssembly works.

For our purposes, what we need to understand is that Wasm has a linear memory, and as far as Wasm is concerned, everything it needs is stored in that memory.

When we get an object from Wasm, it stores its pointer in the object’s linear memory. Thus, the objects we logged before only store pointers for their locations in their linear memories.

We can ignore these details for smaller applications, but as an application’s size grows and the data passed around gets more complex, we need to take them in consideration. 

For example, (almost) everything that crosses the JavaScript–Wasm boundary has to be copied from that linear memory to JavaScript’s memory; thus, large objects with many values will take time and computing power to be copied. 

Another issue is that by default, Wasm has a fixed 1MB of memory allocated to it. If the data that needs to be transferred in one go is larger than that, we will run into a memory limit error. 

In fact, since other information in our Wasm code will also take up some of this 1MB memory, we might hit the memory limit sooner than expected. We will see how to increase this limit if needed in the last section of this article.

Getting back to our current implementation, we have seen how to expose and use structs and their methods. Next, let’s take a look at how to expose associated methods, or functions which take a `self` argument:

```rust
#[wasm_bindgen]
impl Car {
    ...
    pub fn duplicate(&self) -> Self {
        Self {
            number: self.number + 1,
            mul: self.color,
        }
    }
    ...
}
```
In the code above, we took `Car` immutably and returned a new object using `duplicate()`, with its `number` being one greater than before and its `color` being the same.

Next, in `App.svelte`, run the following:

```js
let c = Car.new();
c.number = 5;
c.color = 775577;

...

let c3 = c2.duplicate();

console.log(c3.number,c3.color);

console.log(c2,c3);
```
We can see here that `c3` has values as set per the duplicate function. More importantly, we can see that `c2` and `c3` have different values of `ptr` , indicating that they both are, indeed, different objects.

If we added a method to take `Car` mutably, as follows:

```rust
...
 pub fn change_number(&mut self,number:usize) {
    self.number = number;      
}
...
```
and called it on `c3`  like so:

```js
c3.change_number(7);
console.log(c3.number);
```
We would then see that the number for `c3` has changed.

One helpful tip here is that whenever you’re confused about what properties are accessible from JavaScript, `console.log` that object and open that object’s prototype description. 

In the object’s prototype description, you will be able to see the functions and parameters that JavaScript can access. In fact, you can check the values of parameters by clicking on `>>` next to them, which will show their current values. 

Thus, even though we have logged the `c3` object before calling `change_number` on it, we can expand its `number` information now in the console prototype. By doing so, we see that it has the new value instead of the original, as the `change_number` function takes `Car` mutably.

## Passing complex data types between JavaScript and Rust

The data types which we have passed around so far are fairly simple. Even the structs that we used are made up of primitive types. 

We can also use something complex like `Vec<_>` to pass vectors from Rust to JavaScript. The way all of this works is that `wasm_bindgen` implements the `derive` function, which converts Rust values to JavaScript and vice versa. 

However, data types that are not predefined by `wasm-bindgen` cannot be passed around as easily. For example, let us add a `Box<usize>` in our `Car`, as demonstrated below:

```rust
#[wasm_bindgen]
pub struct Car {
    pub number: usize,
    pub color:usize, // color in hex code
    pub boxed_value: Box<usize>
}
...
 pub fn new() -> Self {
        Car { number: 0, color: 0, boxed_value: Box::new(5) }
}
```
Now, if we take a look at the console from which we are running `npm run dev`, we will see an error, like so:

```bash
error[E0277]: the trait bound `Box<usize>: IntoWasmAbi` is not satisfied
 --> src/lib.rs:3:1
  |
3 | #[wasm_bindgen]
  | ^^^^^^^^^^^^^^^ the trait `IntoWasmAbi` is not implemented for `Box<usize>`
  |
  = help: the following implementations were found:
            <Box<[JsValue]> as IntoWasmAbi>
            <Box<[T]> as IntoWasmAbi>
            <Box<[f32]> as IntoWasmAbi>
            <Box<[f64]> as IntoWasmAbi>
          and 10 others
  = note: this error originates in the attribute macro `wasm_bindgen` (in Nightly builds, run with -Z macro-backtrace for more info)

error[E0277]: the trait bound `Box<usize>: FromWasmAbi` is not satisfied
 --> src/lib.rs:3:1
  |
3 | #[wasm_bindgen]
  | ^^^^^^^^^^^^^^^ the trait `FromWasmAbi` is not implemented for `Box<usize>`
  |
  = help: the following implementations were found:
            <Box<[JsValue]> as FromWasmAbi>
            <Box<[T]> as FromWasmAbi>
            <Box<[f32]> as FromWasmAbi>
            <Box<[f64]> as FromWasmAbi>
          and 10 others
  = note: this error originates in the attribute macro `wasm_bindgen` (in Nightly builds, run with -Z macro-backtrace for more info)

For more information about this error, try `rustc --explain E0277`.


waiting for changes..
```
What the error basically explains is that when passing values across the Rust-Wasm-JavaScript boundary, traits named `FromWasmAbi` and `ToWasmAbi` are required. As `Box<usize>` does not implement these traits, the values cannot be passed around. 

One of the reasons behind this, particularly for `Box<_>`, is that a box is a container for values. The box stores the values on the heap instead of the stack and manages that memory until the values are dropped, after which the memory is freed.

Passing these values to JavaScript would require answering questions like who actually handles the memory and how JavaScript’s garbage collector interacts with this information. Along with this, as JavaScript allows complete mutability, it can break the guarantees that the `Box` needs and create an unsafe memory state. 

For reasons such as these, `wasm_bindgen` does not implement it by default. Also as `Box` and the `From/ToWasmAbi` trait(s) *both* are outside of our crate, we cannot implement them for it either. 

Consider another similar scenario. Let’s say we are using something from another crate which does not implement certain traits, but we need to have those traits in our struct, which in turn needs to be exposed to JavaScript. This can be solved in two ways.

First, objects which are not safe to pass across or cannot be serialized using `serde-json` can be exposed through handles.

Second, objects that can be serialized using [serde-json](https://blog.logrocket.com/json-and-rust-why-serde_json-is-the-top-choice/) can be converted to and from their JavaScript representation using the `serde-json` crate, and passed across. 

We will explore these solutions in the next sections.

### Using handles and calling JavaScript functions from Rust

To understand the concept of a handle, remember that `wasm_bindgen` only exposes those attributed which are tagged `pub`. Any attributes that are private could very well be of the types which do not implement certain traits. 

Let’s remove `pub` from `boxed_value` and adjust the `color` function in the code we used above:

```rust
#[wasm_bindgen]
pub struct Car {
    pub number: usize,
    pub color:usize, // color in hex code
    boxed_value: Box<u8>,
}

...

#[wasm_bindgen]
pub fn color(a: Car,color:usize) -> Car {
    Car {
      number: a.number,
      color,
      boxed_value:Box::new(0)
    }
}
```
Our code should compile again! If we used our prototype trick from before, we would see that `boxed_value` is indeed not accessible from JS. You can try console-logging it to confirm if you want to see for yourself.

This method of using Wasm-incompatible values can be thought of as handles. Essentially, we don’t have direct access to the inner values, but we can access the structs containing those values. 


We can thus handle those values using these structs. Because the values are still accessible from Rust, we can operate on them from functions inside Rust. Let’s remove all the changes we made to our `Box` and add another struct:

```rust
pub struct OwnerID {
    id: usize,
}

#[wasm_bindgen]
pub struct Car {
    pub number: usize,
    pub color: usize, // color in hex code
    pub owner: OwnerID,
}
...
pub fn new() -> Self {
    Self {
        add: 0,
        mul: 0,
        owner: OwnerID { id: 0 },
    }
}
...
#[wasm_bindgen]
pub fn color(a: Car,color:usize) -> Car {
    Car {
      number: a.number,
      color,
      owner: OwnerID { id: 0 }
    }
}
```
With the code shown above, we would get the same error as before:

```bash
error[E0277]: the trait bound `OwnerID: IntoWasmAbi` is not satisfied
 --> src/lib.rs:7:1
  |
7 | #[wasm_bindgen]
  | ^^^^^^^^^^^^^^^ the trait `IntoWasmAbi` is not implemented for `OwnerID`
  |
  = note: this error originates in the attribute macro `wasm_bindgen` (in Nightly builds, run with -Z macro-backtrace for more info)

error[E0277]: the trait bound `OwnerID: FromWasmAbi` is not satisfied
 --> src/lib.rs:7:1
  |
7 | #[wasm_bindgen]
  | ^^^^^^^^^^^^^^^ the trait `FromWasmAbi` is not implemented for `OwnerID`
  |
  = note: this error originates in the attribute macro `wasm_bindgen` (in Nightly builds, run with -Z macro-backtrace for more info)
```
To fix this, like before, we can remove the `pub` from `owner` in `Car`,  and the code will compile again. However, now we don’t have a way to access values in `owner` from JavaScript. 

As stated before, `Car` now acts as a handle for `OwnerID`; we can access `OwnerID`’s value through `Car`. For example, to get the value of `id` from inside the `OwnerID`, we can define a method on `Car` as shown below:

```rust
#[wasm_bindgen]
impl Car {
...
 pub fn get_id(&self) -> usize {
        self.owner.id
    }
...
```
In `App.svelte`, run the following:

```js
console.log(c3.get_id());
```
Now we can see the value of `OwnerId`'s `id` . Similarly, we can define methods to change the value of it. 

Another use of such handles is when we need to pass incompatible types, such as `Box`, to some method. Instead of exposing that method, we can expose another method that takes the required values to construct the incompatible types, then call the incompatible method from inside the exposed method. 

For example, let’s say we have a method that requires an `OwnerID` as a parameter. Instead of that method, we can expose another method which takes the `id` of type `usize`, construct `OwnerID` from it, and then call the incompatible method with the constructed `OwnerID` as a parameter.

To connect and call a JavaScript function from Rust, we need to declare it as `extern "C"`  and annotate it with `#[wasm_bindgen]`, after which we can call the function. 

It is important to note that, as Rust does not have function overloading or variadic functions, we need to declare each parameter combination we want to use in the `extern` block.

For example, to call `alert` from Rust, declare it as follows:

```rust
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello in JS from rust!");
}
```
Then, we can call it from JavaScript, like so:

```js
...
let {Car,color,greet} = bindings; // destructure for easier access
...
greet();
```
To call `alert` with different types of arguments, you will need to declare another function and map it to the same function in JavaScript. For example, for an alert with `usize` as an argument, you will need to declare it as follows:

```rust
    #[wasm_bindgen]
    extern "C" {
        fn alert(s: &str);
        #[wasm_bindgen(js_name = alert)]
        fn alert_usize(a: usize);
    }
    #[wasm_bindgen]
    pub fn greet() {
        alert("Hello in JS from rust!");
        alert_usize(5);
    }
```
For more detailed information on how to bind JavaScript functions to Rust functions, how to bind functions inside modules, and how to bind a struct’s method as a constructor of the exposed class, check out the [wasm-bindgen reference](https://rustwasm.github.io/wasm-bindgen/reference/attributes/on-js-imports/index.html).

### Using Rust through Wasm in Svelte with the `serde.json` approach

Now let’s take a look at how to use the `serde.json` approach we mentioned earlier with an example application using Rust through Wasm in Svelte. 

Let’s say you are making some web application that generates a lot of numerical data from a user’s file, which the user can then download in a special file format. You want to allow the user to upload that file and then parse the data, so you don’t have to generate it again, and you have chosen to do this through Wasm.

The data format in our example below is kept simple to avoid distracting from our main objective of learning how to connect Rust to Svelte. It will be easy to generate dummy data for this project.

The format we are using is somewhat similar to a CSV file, with first line having column names separated by commas and rest of the “lines” containing [f64 data types](https://doc.rust-lang.org/std/primitive.f64.html) separated by semicolons. We will not have any missing values or use other types of values. 

Our example file can look like so:

```csv
A,B,C,D;10.2,5,-6.3,-7.8;8.77,5,89,-2.56,3.33
```

The detailed code for parsing this data will not be explained here, but you can check it out in the repository linked at the end of this article. What matters for our purposes is that:

- The function is defined in a module named `parser`
- The function’s name is `parse` and it takes a `&str` as input
- It returns a `HashMap<String,Vec<f64>>`, where the string key will be the column name defined in the first line

Let’s create a new file named `parser.rs` and write our function in it:

```rust
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse(input: &str) -> HashMap<String, Vec<f64>> {
...
}
```
Any module that is public has its contents (which are annotated with `#[wasm_bindgen]` )  exported to JavaScript by default. So, let’s add the following in our `lib.rs` file:

```rust
pub mod parser;
```
If we tried to run our code now, we would get the following error:

```bash
the trait IntoWasmAbi is not implemented for HashMap<String, Vec<f64>>
```
We can try creating a handle and then accessing the data through that handle, but it will be tedious. Since we know that compatible data structures exist for `Map`, `Vec`, and `String` objects in JavaScript, we will instead use the `serde-json` approach that was mentioned before.

Change the `Cargo.toml` file as shown below:

```toml
serde = { version = "1.0.137", features = ["derive"] }
wasm-bindgen = { version= "0.2.63", features = ["serde-serialize"] }
```
Next, change the function as follows:

```rust
pub fn parse(input: &str) -> JsValue {
  let mut ret: HashMap<String, Vec<f32>> = HashMap::new();
  ...
  JsValue::from_serde(&ret).unwrap()
}
```
Now it compiles, and we are back on track.

We can access the `parse` function from JavaScript, through  `App.svelte`  as shown below:

```js
let {Car,color,greet,parse} = bindings; // destructure for easier access
console.log(parse("A,b,c;5;6.3;7.8"));
```
We can see that it returns an object, with keys as the column names, and the values as arrays of respective values. 

Next, we will connect it to an event in the frontend so that a user can upload a file and get its contents parsed. 

To do so, simply use the `FileUploader` component of `carbon-components-svelte`. We will first display the result in the UI, so that we can know that the file is getting uploaded and accessed correctly:

```js
<script>
...
import {Content,FileUploader} from 'carbon-components-svelte';

let files = []; // file handles will be added in this

let content = ""; // for us to see the contents

let reader = new FileReader();

// add listener to load event, which fires when file read is completed successfully
reader.addEventListener("load",() => {
  content = reader.result; // set content in ui, so we can see it
},false);

// this will be used as callback to file uploader
let add_handler = (e) => {
  reader.readAsText(e.detail[0]);
}
...
</script>

<Content>

<h1>
    Connecting rust to Svelte Through wasm !
</h1>

<br />

<div>
  <FileUploader
      labelTitle="Upload file"
      buttonLabel="Add file"
      labelDescription="Only txt files are accepted."
      accept={[".txt"]}
      bind:files
      status="complete"
      on:add={add_handler}
    />
</div>

<br />

<h3>
  File Contents Are :<br/>
  {content}
</h3>

</Content>
```
If we refresh the page and upload a text file with dummy data, like so:

```csv
A,B,C,D;
1.5,1.5,5.1,5.1;
7.5,5.7,5.5,7.7;
```
We can see that it uploads the file and its contents can be read.

Now instead of displaying the contents, we can call the `parse` function in the event listener. We will get the parsed data, which can then be used as required by the application.

With this, we have successfully connected our Svelte app to our Rust code and passed data between them!

## Increasing Wasm memory size

As mentioned before, by default, Wasm code has 1 MB of stack memory for its use. This amount of memory is more than enough for many applications, but sometimes, we might need more than that. In such cases, we can increase the size by setting a specific option in a `config` file. 

For example, the 8086 example we mentioned earlier needs 1 MB of memory for the virtual machine itself. Apart from that, it also stores some data and a small compiler. Thus, the default 1 MB of memory is not enough for the entire project.

To increase the memory size, we must create a `.cargo` directory in the Rust project directory, which in our case is called the `rust` directory. Next, create a file named `config` in the `.cargo` directory. In this file, we can specify the memory size allocated to it as shown below:

```toml
[target.wasm32-unknown-unknown]
rustflags = [
"-C", "link-args=-z stack-size=2000000",
]
```
In the code above, we specified the stack size to be 2 MB, shown in bytes. Now the compiled Wasm application will be allocated a stack memory of size of 2 MB instead of the default 1 MB.

## Conclusion

Now you know how to connect a Svelte app to a Rust library using Wasm, along with how to call functions written in Rust from JavaScript. You can also call JavaScript functions from Rust, and pass around complex data structures across the Rust–JavaScript boundary.

With this knowledge, you can now write libraries that can be used for both web and desktop apps or make a quick interactive interface to show off library usage.

You can get the code for this project [in this repository](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/connect-svelte-and-rust-using-wasm). Thank you for reading!
