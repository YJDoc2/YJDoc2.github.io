---
title: Understanding Rust generics and how to use them
date: 2022-08-10
tags: [rust, tutorial]
logrocket: https://blog.logrocket.com/understanding-rust-generics/
categories: logrocket
---

Generics are a way to reduce the need to write repetitive code and instead delegate this task to the compiler while also making the code more flexible. Many languages support some way to do this, even though they might call it something different. 

Using generics, we can write code that can be used with multiple data types without having to rewrite the same code for each data type, making life easier and coding less error-prone.

In this article, we will see what generics are, how they are used in Rust, and how you can use them in your own code. Particularly, we will see:

- Why are generics useful?
- What are generics?
- How generics work in Rust
- Syntax for Rust generic type parameters
- Simple Rust generic usage example
- Generics with trait bounds
- Lifetime generics in Rust
- Typestate programming in Rust using generics
- Advanced generic types in Rust: Generic associated types

As a note, you will need to be comfortable reading and writing basic Rust code. This includes variable declarations, `if…else` blocks, loops, and struct declaration. A bit of knowledge of traits is also helpful.

## Why are generics useful?

If you have used Rust before, chances are you have already used generics without even noticing. Before we get into the definition of generics and how they work in Rust, let us first see why we might need to use them.

Consider a case where we want to write a function that takes a slice of numbers and sorts them. It seems pretty straightforward, so we go ahead and start writing the function:

```rust
fn sort(arr:&mut [usize]){
  // sorting logic goes here...
}
```

After spending several minutes on trying to remember how to use `quicksort` in Rust, and then looking it up on web, we realize something: this method is not particularly flexible. 

Yes, we can pass arrays of `usize` to sort, but because Rust does not implicitly typecast values, any other types of numerical value — `u8`, `u16` and others — will not be accepted by this function. 

To sort these other integer types, we would need to create another array, fill it with the original values typecasted to `usize`, and pass it as the input. We would also need to typecast the sorted array back to the original type. 

That’s a lot of work! Furthermore, this solution will still not work at all for signed types such as `i8`, `i16`, and so on.

Another problem with this is that even typecasting can only sort numerical values alone. Consider an example where we have a list of users, each with a numerical `id` field. We cannot pass them to this function! 

To sort them according to each user’s `id`, we would first need to extract every `id` into a `vec`, typecast it to `usize` if needed, sort it using this function, and then match every `id` to the original user list one by one to create a new list of users sorted by user `id`. 

That is also a lot of work, especially considering the core of what we are doing — sorting — is the same.

Of course, we can write one function dedicated to each type we need: one for `usize`, one for `i16`, one that provides access to structs, and so on. But that is a lot of code to write and maintain. 

Imagine if we used this method, but we made one mistake in the first function. If we then copied and pasted the function for various other types, we would then have to manually correct each one. If we forgot to fix any, we would get strange sorting errors that only showed up for one type.

Now consider if we want to write a `Wrapper` type. It would basically wrap the data inside it and provide more functionality for it, like logging, debug trace etc. 

We can define a struct, and keep a field in it to store that data, but we would then need to write a separate and dedicated struct for each data type that we want to wrap and reimplement the same functionality manually for each type. 

Another issue is if we decided to publish this as library, the users would not be able to use this wrapper for their custom data types unless they wrote another struct and manually implemented everything for it, making the library redundant.

Generics can save us from these problems and more in Rust.

## What are generics?

So what are generics, and how can they save us from these problems?

Informally, generic programming involves focusing on what you care about, and ignoring or abstracting everything else. 

The more formal [Wikipedia definition of generic programming](https://en.wikipedia.org/wiki/Generic_programming) is “a style of computer programming in which algorithms are written in terms of types to-be-specified-later that are then instantiated when needed for specific types provided as parameters.”

In other words, when we write code, we write it with placeholder types instead of actual types. The actual types are inserted later. 

Think of how, in functions, we write the code in terms of its parameters. For example, an addition function takes two parameters, `a` and `b`, and adds them. We don’t actually hard-code the values for `a` and `b` here. Instead, whenever we call that addition function, we pass those values as parameters, and get the result. 

Similarly, in generics, the type placeholders are replaced at compile time with actual types.

So, going back to apply generics to our previous example, we would write the `sort` function using a placeholder type; let us call it `Sortable`. Then, when we call the function with a slice of `usize`, the compiler will replace this placeholder with `usize` to create a new function, and use that function for the call to sort. 

If we called our `sort` function from another place and gave it an `i16` slice, the compiler would generate yet another function — this time replacing the placeholder type with `i16` — and use this function for the call.

As for the wrapper, we can simply put a type placeholder in the definition of our structure and make the data field be of this placeholder type. Then, whenever we use this wrapper, the compiler will generate a structure definition specifically tailored for that type. 

That way, we can use the wrapper for any of our types, and even the users of our library will be able to wrap their own types in this wrapper.

This is how generics help us in writing (and thus needing to maintain) a smaller amount of code while increasing our code’s flexibility. Now we will see how generics are used in Rust.

## How generics work in Rust

As mentioned in the start, if you have used Rust for some time, you probably have already used generics in Rust. 

Think about the example `Wrapper` type we wanted to implement. It is strikingly similar to Rust’s `Option` and `Result` types. 

We use these types to wrap some value when we want to indicate an optional value or a result, respectively. They have almost no restrictions and can take almost any type of value. Thus, we can use them to wrap any arbitrary data type we want to, which is because they are defined as generic types.

The Option type is an enum roughly defined as:

```rust
enum Option<T>{
  Some(T),
  None
}
```
In the above, `T` is the type parameter we mentioned in the last section. Whenever we use it with a type, compiler generates the enum definition tailored to that particular type; for example, if we use `Option` for a `String`, the compiler will essentially generate a definition similar to the below:

```rust
enum StringOption{
  Some(String),
  None
}
```
Then, wherever we use `Option<String>`, it will use the definition generated above.

All of this happens at the compilation stage; thus, we don’t have to worry about defining distinct enums for each data type we want to use them with, and maintaining code for all of them.

Similarly, the `Result`  is an enum defined with two generic types :

```rust
enum Result<T,E>{
  Ok(T),
  Err(E)
}
```
Here, we can define any type to take place of `T` and `E`, and the compiler will generate and use a unique definition for each combination.

As another example, consider the various collections Rust offers: `Vec`, `HashMap`, `HashSet`, etc. All of these are generic structs, and thus can be used with any data types to store almost any values, with some restrictions in the cases of `HashMap` and `HashSet`, which we will see later.

One thing to note at this stage, is that once we declare the concrete type for the generic struct or enum, it essentially generates and uses a unique struct or enum with a fixed type. Thus, we cannot store `usize` value in a vector that is declared to be of type `Vec<u8>` and vice versa. 

If you want to store values of different types in the same structure, generics cannot be used alone, but will need to be used with Rust traits, which are not covered in this article.

## Syntax for Rust generic type parameters

To use the generic type parameters in Rust, the syntax is quite simple:

```rust
fn sort<T>(arr:&mut [T]){
...
}

struct Wrapper<T>{
....
}

impl<K> Wrapper<K>{
...
}
```

We have to declare the generic type parameters that we will use in the `<>` after the function, struct, or enum name; we used `T` in the examples above, but it can be anything. 

After that, we can use those declared parameters as types wherever we want to use the generic typing in the function, struct, or enum.

The `impl` for the generic structs are slightly different, where the `<T>` appears twice. However, it is pretty similar to others, where we first declare the generic parameters, but then we use it immediately. 

First, we declare the generic parameter as `T` in `impl<T>`, where we say that this implementation will use a generic type parameter named `T`. Then, we immediately use it to indicate that this is the implementation is of type `struct<T>`. 

Note that in this example, the `T` is part of the struct type whose implementation we are giving, and not declaration of generic parameter.

Even though we chose to call it `T` here, the generic parameter can have any valid variable name, and rules similar to “good” variable naming should be used for clarity.

Similar to the `Option` and `Result` examples in the last section, whenever we will use this struct or the function, the compiler will generate a dedicated struct or function, replacing the type parameters with the actual concrete type.

## Simple Rust generic usage example

Now let’s get back to the original problems we had: the `sort` function and the `Wrapper` type. We will first tackle the `Wrapper` type.

We were thinking of the struct as follows:

```rust
struct Wrapper{
...
data:???
...
}
```

As we want the struct to be able to store any type of data, we will make the data field’s type generic, which will allow us and other users to store any data type in this wrapper.

```rust
struct Wrapper<DataType>{
...
data:DataType
...
}
```
Here, we declared a generic type parameter called `DataType`, then declared the field `data` to be of this generic type. Now we can declare a `DataStore` with `u8` as the data, and another with a string as the data:

```rust
let d1 = Wrapper{data:5}; // can give error sometimes, see the note below
let d2 = Wrapper{data:"data".to_owned()};
```
The compiler usually automatically detects the type to be filled in for the generic type, but in this case, `5`  can be `u8` , `u16`, `usize` or quite a few other types. Thus, sometimes we might need to explicitly declare the type, like so:

```rust
let d1 : DataStore<u8> = DataStore{data:5};
// or
let d1 = DataStore{data:5_u8};
```
Recalling the note we mentioned before: once declared, the type is fixed and behaves as a unique type. A vector can only store elements of the same type. Thus, we cannot put both `d1` and `d2` in the same vector, as one is of type `DataStore_u8` and the other is of type `DataStore_String`.

Remember, we get the following type error when we try to call `collect` on some iterator without specifying the type of variable:

```rust
let c = [1,2,3].into_iter().collect(); //error : type annotation needed
```
This is because the `collect` method’s return type is generic with a trait bound (which we will explore in next section), and thus, the compiler is not able to determine which type `c` will be. 

Hence, we need to explicitly state the collection type. Then, the compiler can figure out the data type that is to be stored in the collection:

```rust
let c : Vec<usize> = [1,2,3].into_iter().collect();
// or, as compiler can decide 1,2,3 are of type usize
let c : Vec<_> = [1,2,3].into_iter().collect();
```

To summarize, in the case of compiler not being able to figure out collection type needed to store the collected data, we need to specify the type.

## Generics with trait bounds

Now, let’s move on to the `sort` function. 

Here, the solution is not as simple as declaring a generic type and using it as the datatype of the input array. This is because when simply declared as `T`, the type has no restrictions on it whatsoever. Thus, when we try to compare two values, we get an error as shown below:

```bash
binary operation '<' cannot be applied to type T
```

This is because it is not at all necessary that the type we give to the sort function must be comparable using the `<` operator. For example, the `user` struct — one that we wanted to be sorted according to the `id` values — is not directly comparable using the `<` operator.  

Hence, we must explicitly tell the compiler to only allow types to be substituted here if they can be compared to each other. And for that, in Rust, we have to use trait bounds.

Traits are similar to interfaces in languages such as Java or C++. They contain the method signatures which must be implemented by all the types which implement the trait.

For our sort function, we need to restrict — or bound — the type parameter `T` by a trait that has a `compare` function. This function must give the relationship (greater than, less than, or equal to) between two elements of the same type that are given to it.

We can define a new trait for this purpose, but then we will also have to implement it for all the numerical types, and we will have to manually call the `compare` function instead of using `<`. Or we can use traits that are built into Rust to make things easier, which we will now do.

`Eq` and `Ord` are two traits in the standard Rust library that provide the functionality we require. The `Eq` trait provides a function to check if two values are equal or not, and `Ord` provides a way to compare and check which one between two is less that or greater than the other.  

These are by default implemented by the numerical types (except `f32` and `f64`, which do not implement `Eq`, as `NaN` is neither equal nor not equal to `NaN`), so we only have to implement these traits for our own types, such as the `user` struct.

To restrict a type parameter by traits, the syntax is :

```rust
fn fun<Type:trait1+trait2+...>(...){...}
```
This will instruct the compiler that `Type` can only be substituted by those types, which implement `trait1` and `trait2` and so on. We can specify a single trait or multiple traits to restrict the type.

Now for our sort function :

```rust
fn sort<Sortable:Ord+Eq>(arr:&mut[Sortable]){
...
}
```
Here, we declared a generic type with name `Sortable` and restricted it with traits `Ord` and `Eq`. Now, types that are substituted for it must implement both the `Eq` and `Ord` traits. 

This will allow us to use this same function for `u8`, `u16`, `usize`, `i32`, and so on. Also, if we implement these traits for our `user` struct, it can be sorted using this same function instead of us needing to write a separate one.

Another way to write the same thing is as follows:

```rust
fn sort<Sortable>(arr:&mut [Sortable])where Sortable:Ord+Eq{
...
}
```
Here, instead of writing the traits along with the type parameter declaration, we wrote them after the function parameters.

To think about this in another way: trait bounds provide us guarantees about the types that are substituted in the type parameters. 

For example, Rust’s `HashMap` requires that the keys that are given to it can be hashed. In other words, it needs a guarantee that a hashing function can be called on the type substituted for the type of key, and it will give some value that can be regarded as the hash of that key. 

Thus, it restricts its key type by requiring it to implement the `Hash` trait. 

Similarly, `HashSet` requires that the elements stored in it can be hashed, and it restricts their types to those that implement the `Hash` trait.

Thus, we can think of trait bounds on type parameters as ways to restrict which types can be substituted, as well as having a guarantee that the substituted type will have certain properties or function associated with it.

## Lifetime generics in Rust

Another place where Rust heavily uses generics is in lifetimes. This is harder to notice, since lifetimes in Rust are mostly compile-time entities, and not directly visible in code or compiled binary. 

As a result, almost all of the lifetime annotations are generic “type” parameters, whose values are decided by the compiler at compile time. One of the few exceptions to this is the `'static` lifetime.

Usually if a type has a static lifetime, this means that the value should live until the end of the program. Note that this is not exactly what it means, but for now, we can think of it like that.

Even then, lifetime generics are still a bit different than type generics: their final value is calculated by the compiler instead of us specifying the type in the code and compiler simply substituting it. 

Thus, the compiler can coerce longer lifetimes to be shorter ones if needed, and has to calculate the appropriate lifetime for each annotation before it can be assigned. Also, we often don’t need to deal with these directly and instead can let the compiler infer these for us, even without specifying the parameters.

Lifetime annotations always begin with the `'` symbol and can take any variable-like name after that. One of the places where we will be using these explicitly is when we want to store references to something in a struct or enum. 

As all references must be valid references in Rust (there cannot be dangling pointers), we must specify that the reference stored in a struct must remain valid at least till that struct is in scope, or valid.

Consider the following:

```rust
struct Reference{
  reference:&u8
}
```
The code above will give us an error message that the lifetime parameter is not specified. 

The compiler cannot know how long the reference must be valid for — if it’s supposed to be as long as the struct’s lifetime, `'static`, or something else. Thus, we must specify the lifetime parameter as follows:

```rust
struct Reference<'a>{
  reference:&'a u8
}
```
Here, we specified that the `Reference` structure will have an associated lifetime of `'a` , and the reference in it must remain valid for at least that much time. Now when compiling, Rust can substitute the lifetime as per the lifetime determination rules and decide if the reference stored is valid or not.

Another place where lifetimes need to be explicitly stated is when a function takes multiple references and returns an output reference. 

If the function does not return a reference at all, then there is no lifetime to be considered. 

If it takes only one parameter by reference, then the returned reference must be valid for as long as the input reference is. We can only return a reference that is constructed from the input; any other is invalid by default, as it will be constructed from values created in the function, which will be invalid when we return from the function call. 

But when we take in multiple references, we must specify how long each of them — both input and output references — must live for, as the compiler cannot determine that on its own. A very basic example of this would be as follows:

```rust
fn return_reference(in1:&[usize],in2:&[usize])->&usize{
...
}
```
Here, the compiler will complain that we must specify the lifetime for the output `&usize`, as it cannot know if it is related to `in1` or `in2`. Adding the lifetime for all three references will solve this issue:

```rust
fn return_reference<'a>(in1:&'a [usize],in2:&'a [usize])->&'a usize{
...
}
```

Just like generic type parameters, we declared the lifetime parameter `'a` after the function name, and then used it to specify the lifetimes of the variables. 

This tells the compiler that the output reference will be valid as long as the input references are. Also, this adds the restriction that both `in1`  and `in2` must have the same lifetimes. 

As a result of all this, input references that live for different times will not be allowed by the compiler. 

To deal with such a situation, we can also specify two distinct lifetimes for `in1` and `in2` here, and specify that the lifetime of the returned value is same as the one from which it is being returned.

For example, if we are returning a value from `in1`, we will keep the lifetimes of `in1` and the return type the same, and give a different lifetime parameter to `in2`, like so:

```rust
fn return_reference<'a,'b>(in1:&'a [usize],in2:&'b [usize])->&'a usize{
...// return values only from in1
}
```
If we accidentally return a reference from `in2`, the compiler will give us an error message saying that the lifetimes do not match. This can be used as an additional check that the references are being returned from correct place.

But what if we don’t know in advance the input from which we will be returning the reference? In such a case, we can specify that one lifetime must be at least as long as the other :

```rust
fn return_reference<'a,'b:'a>(in1:&'a [usize],in2:&'b [usize])->&'a usize{
...
}
```
This states that the lifetime of `'b` must be at least as long as `'a`. Thus, we can return a value from either `in1` or `in2` and the compiler will not give us an error message. 

Given that many things that need explicit lifetimes are pretty advanced topics, not all related use cases are considered here. You can check The Embedded Rust Book [for more information on lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html).

## Typestate programming in Rust using generics

This is a bit of advanced use case of generics. We can use generics to selectively implement functionality for structures. This is usually related to state machines or objects that have multiple states, where each state has different functionality. 

Consider a case where we want to implement a heater structure. The heater can be in a low, medium, or high state. Depending on its state, it needs to do different things. 

Imagine the heater has a knob or dial: when the knob is on low, it can go to medium, but not directly to high without going to medium first. When on medium, it can go to either high or low. When on high, it can only go to medium, not directly to low.

To implement this in Rust, we could make this into an `enum` and potentially make those three states its variants. But we cannot specify variant specific methods yet — at least, not at the time of this writing. We would have to use a `match` statement everywhere and apply the logic conditionally. 

This is where [typestates are useful](https://docs.rust-embedded.org/book/static-guarantees/typestate-programming.html) in Rust.

First, let’s declare three unit structs that will represent our states:

```rust
struct Low;
struct Medium;
struct High;
```
Now, we will declare our heater struct with a generic parameter called `State` :

```rust
struct Heater<State>{
...
}
```
But with this, the compiler complains that the parameter is not used, so we must do something else. 

We don’t actually want to store the state structs, as we don’t actually do anything with them and they do not have any data either. Instead, we use these states to indicate the state of heater, and what functions (i.e. turning from low to medium, medium to high, etc.) are available to it.

Thus, we use a special type called `PhantomData`:

```rust
use std::marker::PhantomData;

struct Heater<State>{
...
state:PhantomData<State>
...
}
```

`PhantomData` is a special structure in the Rust [std library](https://docs.rs/rustc-std-workspace-std/latest/std/). This structure behaves as if it stores data, but does not actually store any data. Now to the compiler, it seems as if we are using the generic type parameter, so it does not complain. 

With this, we can implement the methods specific to the heater’s current state like so:

```rust
impl Heater<Low>{
  fn turn_to_medium(self)->Heater<Medium>{
    ...
  }
// methods specific to low state of the heater
}

impl Heater<Medium>{
// methods specific to medium state of the heater
  fn turn_to_low(self)->Heater<Low>{
    ...
  }
  fn turn_to_high(self)->Heater<High>{
    ...
  }
}

impl Heater<High>{
// methods specific to high state of the heater
  fn turn_to_medium<Medium>{
    ...
  }
}
```

Each state contains specific methods that are not accessible from any other state. We can also use this to restrict functions to take only a specific state of the heater:

```rust
fn only_for_medium_heater(h:&mut Heater<Medium>){
// this will only accept medium heater
}
```
So, if we try giving this function a `Heater` with a `Low` state, we will get an error at compile time:

```rust
let h_low:Heater<Low> = Heater{
...
state:PhantomData,
...
}
only_for_medium_heater(h_low); // Compiler Error!!!
```

Note that we don’t actually create `PhantomData` using the `new` method, as it does not actually store anything. 

Also, we need to make sure the compiler can figure out the typestate of the variable we are storing the `Heater` structs in. We can either do this by specifying the type explicitly as above, or by using the variable in a context where it explicitly states the typestate, such as a function, call, or another relevant context.

We can implement methods common to all states normally, as demonstrated below: 

```rust
impl <T>Heater<T>{
// methods common to all states, i.e. to any heater
// here the type T is generic
}
```

## Advanced generic types in Rust: Generic associated types

There is one more use of generic types that we will mention here: generic associated types (GATs). This is a pretty advanced and complex topic, and thus we will not go over it in detail in this article.

Associated types are types which we define within traits. They are called so because they are completely associated with that trait. Here’s an example:

```rust
trait Computable{
  type Result;
  fn compute(&self)->Self::Result;
}
```

Here, the `Result` type is associated with the trait `Computable`; thus, we can use them in function definitions. To see how and why this is different from simply using generic type parameter, you can check [The Embedded Rust Book](https://doc.rust-lang.org/book/ch19-03-advanced-traits.html?highlight=associated#specifying-placeholder-types-in-trait-definitions-with-associated-types). 

Generic associated types, as their name suggests, allow us to use generics in associated types. This is a relatively new addition to Rust, and in fact, not all parts of it are stabilized at the time of this writing. 

Using GATs, it is possible to define associated types containing generic types, lifetimes, and everything else we discussed in this article. 

You can read more about this subject [on the official Rust blog](https://blog.rust-lang.org/2021/08/03/GATs-stabilization-push.html), but remember that it is a pretty advanced use case, and its implementation in the Rust compiler is not completely stabilized yet.

## Conclusion

Now you know what generics are, why they’re useful, and how Rust uses them, even if you don’t notice it. 

We covered how you can use generics to write less code, which at the same time can be more flexible; how to put restrictions on functionalities of types; and how to use generics for type states, so that you can selectively implement functionalities for the state the structure is in.

You can find the code for this blog in [this Github repository](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/generics-in-rust). Thanks for reading!

