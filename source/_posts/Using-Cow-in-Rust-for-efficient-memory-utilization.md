---
title: Using Cow in Rust for efficient memory utilization
date: 2023-03-22
tags: [rust, tutorial]
logrocket: https://blog.logrocket.com/using-cow-rust-efficient-memory-utilization/
categories: logrocket
---

Clone-on-write — or `Cow` for short — is a convenient wrapper that allows us to express the idea of optional ownership in Rust. In this article, we will learn what it exactly is, what problem it aims to solve, and how we can use it in our Rust code.

- The problem with occasional mutation
- Use cases for `Cow` in Rust and other domains
- Understanding `Cow` in Rust
- Using `Cow` in your Rust code

As a note, you should be comfortable with basic Rust to follow along with this tutorial, including control statements, structs, and enums.

## The problem with occasional mutation

Consider a case where you have a `Vec` of some elements. For the purposes of this example, consider that an `Element` has an ID that can uniquely identify it, and is large enough in size that duplicating it would require considerable memory.

In this case, we need to make sure the vector only has unique elements and does not contain any duplicates. To ensure this, we have a function that can filter the `Vec`. The code below demonstrates a simple way to implement this function:

```rust
fn filter_unique(input:Vec<Element>)->Vec<Element>{
  let mut seen_ids = HashSet::new();
  let mut ret = Vec::new();
  for element in input{
    if seen_ids.contains(&element.id){
      continue;
    }
    seen_ids.insert(element.id);
    ret.push(element);
  }
  ret
}
```

As you can see, this simply keeps the IDs in a `HashSet`. When a new ID is encountered, it pushes the `element` into the `Vec` we return. 

Let’s say we are expecting the input in our use case to frequently contain duplicates, or we know for sure that the input will always contain duplicates. In that case, we must create a temporary `Vec`, input all the elements whose IDs we have not seen before, and finally return this as the `Vec` of unique elements. 

In situations where duplicates are common, this implementation is pretty efficient. But what if they are not so common? 

When the input only infrequently contains duplicates, we would be creating the needless temporary `Vec` far more often than actually necessary. As a result, we would also be unnecessarily allocating that much extra memory and spending CPU time copying the elements over from the original to the new.

As we know, an `Element` is big in size, so copying it takes considerable memory. We also need to allocate and grow that much memory for the returned `Vec`. 

Even if we took the input by value, not as a reference — in which case we would not have an overhead of calling `clone` on the elements — we would still need to allocate extra memory for the returned `Vec` and then free up the original after we are done copying. 

This seems wasteful, considering that when there are no duplicates, we are essentially simply returning the input array.

Cases like this involve performing some costly operation on the input, but only when a certain condition is true. When that condition is so rare that the output is simply the input most of the time, `Cow` can help us to avoid the cost of the operation.

## Use cases for `Cow` in Rust and other domains

`Cow` is a neat idea that can be used in various places. In the Rust Standard Library, besides use cases involving `Vec` types like the one we saw above, `Cow` is also used with several methods that operate on strings, such as `from_utf8_lossy`. 

For example, when we are converting `&[u8]` to a `String`, we need to allocate memory space only when there is an invalid UTF-8 sequence in the input. In other cases, the input is a valid string and can thus be directly used without needing any duplication. Thus, `Cow` is used to handle this case.

Apart from Rust, the problem of memory optimization also exists in other domains and has somewhat similar solutions. 

For example, when we fork a process in Linux, the pages related to the memory of the process do not immediately get duplicated. Instead, the duplication is put off until one of the processes — either original or forked — has tried to write to that memory. 

On that write call, the page gets duplicated. If no write call is made at all, no extra memory is allocated. 

In this context, this lazy duplication approach is called Copy-On-Write. It is a useful optimization technique, especially considering that a fork done for exec-ing almost never writes to the page, but simply execs into a new program image.

## Understanding `Cow` in Rust

Similar to the many other wonderful types built into Rust, `Cow` is also backed by enums. The `Cow` type is defined as follows:

```rust
enum Cow<'a, B>where B: 'a + ToOwned + ?Sized,{
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

This definition looks a bit scary, so let us break it down part by part.

`Cow` is an enum consisting of two parameters — a lifetime parameter `'a` , and a type parameter `B`.

`B` can represent any type that implements the `ToOwned` trait, and which may or may not be sized, as we have indicated with [the ?Sized trait](https://doc.rust-lang.org/std/marker/trait.Sized.html). Furthermore, if `B` contains any references, they must live for at least as long as the `'a` lifetime.

The variant `Borrowed` contains an immutable reference to `B` having a lifetime of `'a`. The `Owned` variant contains the type as specified by the implementation of the `ToOwned` trait of `B`.

[ToOwned is a trait](https://doc.rust-lang.org/std/borrow/trait.ToOwned.html) that can be thought of as a generalized `Clone` trait. This trait allows us to have an owned instance of a borrowed value by either direct cloning or some other internal implementation of duplication. 

Meanwhile, [the Owned part](https://doc.rust-lang.org/std/borrow/trait.ToOwned.html#associatedtype.Owned) of `<B as ToOwned>::Owned` refers to the associated type of the trait, which specifies the type of the owned value.

The `Cow` enum itself provides some methods to work with the data that is stored in it. By default, `Cow` implements `Deref` and `AsRef` traits, which allows us to use an immutable reference to a `Cow` as an immutable reference to the data it contains. 

This aligns with the fact that if we are simply reading the value, we don’t need to worry whether the value is a borrowed reference from some other value, or a reference to an internal, owned value. Consider the following:

```rust
let mut sum:u8 = 0;
for i in input.iter(){
  sum += *i
}
```

In the above example, it does not make a difference whether the input is `Cow::Borrowed(&[u8])` or `Cow::Owned(Vec<u8>)` as long as we can iterate over it and de-reference the values to an `u8`. 

Thus, we can simply replace the `Vec` with the corresponding `Cow`, and with Rust’s type coercing we can use it where a read-only reference to values is needed.

For getting a mutable reference, `Cow` provides the `to_mut` and `into_owned` methods. Both methods require either a mutable reference to the `Cow`, or that the `Cow` is owned.

If the data is already owned —  i.e., the value is of variant `Owned` — `to_mut` will return a mutable reference to the data.

If the variant is `Borrowed`, then `to_mut` will first clone the data by calling [to_owned](https://doc.rust-lang.org/std/borrow/trait.ToOwned.html#tymethod.to_owned) on the borrowed reference, set itself as variant type `Owned`, and return a mutable reference to the now-owned data.

The `into_owned` method will take the `Cow` by value, consume it, and return the owned value. Similar to `to_mut`, if the `Cow` was of variant `Borrowed`, it will clone the data and return the cloned data. If the `Cow` was of variant `Owned`, it will simply return the owned data.

## Using `Cow` in your Rust code

Let us see how we can update our original example using `Cow`. As we established in that example, elements have a field `id` that can uniquely identify them, and they are costly to clone. The case of having duplicates in the input is possible, but rare.

Let us start by defining the `Element` as follows:

```rust
#[derive(Clone)]
struct Element{
    id:usize,
    ...
}
```

Then we have our updated function, which makes this approach unique from our original strategy:

```rust
fn get_unique(input:&[Element]) -> Vec<Element> {
    let mut set = HashSet::new();
    let mut ret = Vec::new();
    for element in input{
        if set.contains(&element.id){
            continue;
        }else{
            ret.push(element.clone());
            set.insert(element.id);
        }
    }
    ret
}
```

This function will always clone the elements and return the unique elements in a `Vec`. As the case of duplicates is rare, and cloning is costly, let us implement the following to return a `Cow` instead:

```rust
fn get_unique_cow<'a>(input: &'a [Element]) -> Cow<'a, [Element]> {
    let mut set = HashSet::new();
    let mut contains_duplicate = false;
    for element in input {
        if set.contains(&element.id) {
            contains_duplicate = true;
        }
        set.insert(element.id);
    }
    if !contains_duplicate {
        return Cow::Borrowed(input);
    }
    let mut ret = Vec::new();
    for element in input{
        if set.contains(&element.id){
            ret.push(element.to_owned());
            set.remove(&element.id);
        }
        // duplicate
    }
    return Cow::Owned(ret);
}
```

The first difference we find is that now the function has an associated lifetime `'a` . This is necessary in the case that the `Cow` is of a `Borrowed` type, as we need to tell the compiler how long the original value must live. 

The function signature states that the borrowed input must live at least as long as the `Cow` we return from the function lives, as it may potentially contain the borrowed value.

Next, we have the input of type `&'a [Element]`. This slice of `Element` must live as long as `'a` . As we are taking a slice, the type of input can be anything that can be converted to the `Element` — i.e., a `Vec` or `const` array.  

Finally, we have the return type of `Cow<'a,[Element]>`. The lifetime here of `'a` is as expected, but the type is a slice, not a `Vec` or a reference to a slice. Let’s take a look at the definition of `Cow` again to better understand why:

```rust
enum Cow<'a, B>where B: 'a + ToOwned + ?Sized,{
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

The `Borrowed` variant contains a reference to `&'a B`, not `B` itself. Thus, to store `&[Element]` in it, the type must be `[Element]`. Since any slice of type `[T]` implements `ToOwned` with the `Owned=Vec<T>` type, we can use `Vec` to create and store the owned value if needed.

The rest of the function is pretty straightforward! We first create a set and iterate over the elements, putting `id` in the set one by one. If we find an `id` that is already in the set, we have a duplicate, and we set the duplicate flag to `true`. 

After this loop, we check if the duplicate flag is `true` or not — i.e., whether or not we have duplicates. If we do not have duplicates, we can simply return the `Borrowed` variant with the input as the borrowed value. 

If we do have duplicates, we create a new vector and push the elements in one by one. We first check if the `id` is present in the set. If it is present, we push the element and remove the `id`. 

If we find an element whose `id` is not in the set, it must be a duplicate — thus, we skip it. This way, we do not have to make another set to store the IDs while filtering the elements. Finally, we return the `Owned` variant with the vector we have newly created.

This is how we can use the `Cow` data type in Rust to either borrow a value or own a value, which helps us reduce copying data unnecessarily, as well as potentially improving performance and saving memory.

## Conclusion

In this article, we explored the clone-on-write data type in Rust and how we can use it to contain either an owned value or a borrowed value for a certain lifetime. This is useful in cases where:


- Duplicating a value is costly
- The need to modify the stored value is rare
- The value is mostly used for read-only purposes

We also saw how we can create and return `Cow` from our own Rust code and explored some cases where it can be useful.

Thanks for reading!

