---
draft: false
title: Two Rust features that I miss in Other languages

---

Hello everyone!

Now-a-days I am writing code in several different languages : Rust, C , JavaScript, Python. While all of these have their own use cases , Rust is one of my favorite languages in which I enjoy writing code in.

I have been writing code in Rust for about 1.5 - 2 years now, and it is still just as fun (if not more) as it was when I started. Rust has many great features which makes it different from others, and all of them have their own pros and cons. However, there are some features in Rust which I miss when writing code in other languages.

In this post, I'll be talking about two such features : One which you might know and be familiar with, and one which you might not know directly. I think both of them are valuable not only for better code, but even from a developer's perspective, and helps me to think clearly and write better code.

## Error Management

Now, I don't mean to say other languages do not have error handling. Its just that the way Rust does error handling has an elegance and simplicity , which I miss in other languages.

I truly feel that Rust has done a great job with error handling. Even if [not everyone might agree with the particular way it is done](https://steveklabnik.com/writing/you-re-probably-learning-a-technology-in-its-seventh-season-not-its-pilot) , I still feel it is one of the best error handling ideology that I have seen.

Error handling in Rust gets divided into two distinct types of errors :
- Recoverable/ "true" errors : This is the most common one, which is almost entirely supported by `Result` enum. These kinds of errors are something that you know might occur, and want to bubble up, or display to users.
- Non-recoverable / "exceptions" : These are signified by `panic`s and `unwrap`s. These signify that some invariant is broken; or that some basic assumption which should have been true, is actually false. In such cases there is really no point on continuing, and crashing is a better option.

Most of other languages do not separate these two kinds.

- Java, Python, JS only have `Exception`s, a single mechanism which must be used to indicate both ; or we must have an `error:true/false` field in all return types, and caller must check before using the returned value.
- C has `errno` . To start with, it is a global variable for the whole code, and there is not much support to attach custom error messages without doing something similar as returning an `enum` with error and data components.

---

**Update** : As some have pointed out in the comments,  Java and scala has an `Either` type somewhat equivalent to `Result` in Rust, and Go has error wrapping.  I missed them originally when writing, as I do not work with these languages much.

---

Rust separating these two kinds allows me to think on what possible errors might occur - all known possible errors are declared upfront along with the return type, and only unexpected errors can cause crashes at runtime.

Apart from that, I think Rust has beautiful syntax support, which makes it feel that error handling was a first-class thing, not just an after thought.

- `?` operator allows bubbling up errors in a clean way. No need to have only a top level catch, or do a catch-check-rethrow.
- `unwrap()` calls indicate what are our base assumptions for the code.
- `unwrap_or` and similar APIs on `Result` allows setting a default / sane fallback in clean way.

Because of such nice support, there are quite a few libraries which build on top of this and allows us to have more good things :

- [anyhow](https://crates.io/crates/anyhow) is one of the GOAT crates, allowing to bubble up many error types from a single function, and attach context to errors
- [eyre](https://crates.io/crates/eyre) is a fork-extention of annyhow, and provides way to derive error types and reports for structs

consider the following which uses anyhow crate :
```rust
...
let result1 = function1().context('function 1 errored')?;
let result2 = function2(param1).with_context(|| format!('function 2 errored with param {param1}'))?;
let result3 = result1.update(result2).context('update with result2 failed')?;
...
```

In this way we can attach context to each individual error at each step, without having to add any additional piece of code. To the best of my knowledge, there is no straightforward way of doing something similar in other languages.

Consider doing similar in JS : if we use Exceptions to indicate errors, we either have to wrap all three in single try-catch and lose the granularity of context ; or have a try-catch for each, attach context to the caught error and re-throw from the catch block. This quickly gets out of hand as the code grows and there are more possible points for errors.

## #[must_use] Annotation

Even though `#[must_use]` is not directly a part of Rust syntax / language itself, I think this is one of its underrated parts.

`#[must_use]` does not modify the code's output in any way, however it provides a lint which can be very helpful for catching some easy-to-miss bugs.

When we annotate any type with this, values of those types must be used. Consider the `Result` type which is annotated with `#[must_use]`. If we call a function which returns a result, but do not use / capture that return value :
```rust
result_returning_function();
```

 we will get a compiler warning saying

```sh
warning: unused `Result` that must be used
```
Thus, we can make sure all `Result`s are acknowledged, and we do not accidentally miss any potential error.

This also beautifully integrates with Futures. As Futures must be polled for them to resolve, if we create a future, but do not await it, we get a warning such as 

```sh
warning: unused implementer of `Future` that must be used
...
note: futures do nothing unless you `.await` or poll them
```

Finally Rust stdlib itself uses this to warn us of [some gotchas](https://std-dev-guide.rust-lang.org/code-considerations/design/must-use.html). For example `wrapping_add` and such methods are directly called on values, but do not modify those values, but instead return a new value. One can easily forget this, and assume that the original value is modified. This warning prevents us to miss it easily.

As far as I know, no other language has anything similar, even considering external linters. I miss this specifically in JS, where there are no ways to ensure async functions are (eventually) awaited when called. Because of that, I sometimes miss awaiting a single async function call in async context, and that single function runs asynchronously, while rest do not.

Having the `#[must_use]` or equivalent would make catching such errors much easier.


---

Thank you for reading! Are there any other features of Rust you miss when coding in other languages? Or Any features of other languages that you miss when coding in Rust? Feel free to let me know your thoughts in the comments :)
