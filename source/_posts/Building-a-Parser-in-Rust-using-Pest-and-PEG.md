---
title: Building a Parser in Rust using Pest and PEG
date: 2023-02-01
tags: [rust, compiler, tutorial]
logrocket: https://blog.logrocket.com/building-rust-parser-pest-peg/
categories: logrocket
---

It can be challenging to write an efficient lexer-parser pair to parse a complex structure. This gets even more complicated if the format or structure is fixed and you have to write the parser in a way that is easy to understand, maintain, and extend for future changes.

We can use parser generators in these situations instead of handwriting parsers. In this article, we will review what parser generators are and explore a parsing tool for Rust called Pest. We will cover:


- What are parser generators?
- What is Parsing Expression Grammar in Pest?
- Using PEG in Pest to declare rules for a Rust parser
- Demonstrating a simple parser with Pest
- Writing a parser for your own language

As a note, you should be comfortable reading and writing basic Rust code such as functions, structs, and loops.

## What are parser generators?

Parser generators are programs that take in the rules that the parser needs to consider and then programmatically generate a parser for you that will parse input based on those rules. 

Most of the time, the rules are given to the parser generator in a simplified language, such as regular expression. Thus, when you want to update your parser by changing a rule or adding a new one, you simply have to update or add the regular expression for the rule. Then, when you run the parser generator, it will rewrite the parser to fit these rules. 

You can imagine how much time can be saved by using such parsing tools. Many parser generators also generate a lexer so you don’t have to write one yourself. If the generated lexer does not work for you, you may have the option to run the parser with your own lexer if needed.

Currently, there are several parser generators in the Rust ecosystem that you can use. Three of the most popular are LalrPop, Nom, and Pest.

[LalrPop is pretty similar to Yacc](https://crates.io/crates/lalrpop) in the way it has you define rules and corresponding actions. I have personally used this to write the rules for [my 8086 emulator project](https://yjdoc2.github.io/8086-emulator-web/).

Nom is a parser combinator library in which you write the rules as combinations of functions. This is more oriented towards parsing binary input, but can also be used to parse strings.

Finally, [Pest uses Parsing Expression Grammar](https://crates.io/crates/pest) to define parsing rules. We will explore Rust parsing with Pest in detail in this post.

## What is Parsing Expression Grammar in Pest?

Parsing Expression Grammar (PEG) is one of the ways to define our parsing “rules” in Rust with Pest. Pest takes the input of a file that has such rule definitions and generates a Rust parser that follows them.

There are three defining characteristics of Pest and PEGs that you should consider when writing your rules. 

The first characteristic is greedy matching. Pest will always try to match the maximum of the input to the rule. For example, let’s say we wrote a rule such as the following:

```
match one or more alphabets
```
In this case, Pest will consume everything in the input until it reaches a number, space, or symbol. It will not stop before that.

The second characteristic to consider is that alternate matches are ordered. To understand what this means, let’s say we gave multiple matches to fulfill a rule, like so:

```
rule1 | rule2 | rule3
```

Pest will first try to match `rule1`. If and only if `rule1` fails, Pest will then try to match `rule2` and so on. If the first rule matches, Pest will not attempt to match any other to find the best match. 

Thus, when writing such alternatives, we must put the most specific alternative first, and the most general at the very end. This is explained in a bit more detail in the next section.

The third characteristic — no backtracking — means that if a rule fails to match, the parser will not backtrack. Instead, Pest will try to find a better rule or choose the best alternative match. 

This differs from using plain regular expressions or other types of parsers, which can go back a few tokens and try to find an alternate rule even if alternate choices are not given.

You can read about these characters in more detail in the [Pest docs](https://pest.rs/book/grammars/peg.html).

## Using PEG in Pest to declare rules for a Rust parser

In Pest, we define the rules using a syntax somewhat similar to regular expressions, with some differences. Let us see the syntax in action by writing out some examples.

The basic syntax for any rule is as follows:

```
RULE_NAME = { rule definition }
```

The curly brackets can have symbols such as `_` and `@` before them. We will see the meaning of these symbols later.

### Matching single characters using built-in rules in Pest

Pest has some inbuilt rules that match certain characters or sets of characters.

Any character or string in quotes matches itself. For example, `"a"` will match the `a` character, `"true"` will match the string `true`, and so on.

`ANY` is a rule that matches any Unicode character, including spaces, newlines, and symbols such as commas and semicolons.

`ASCII_DIGIT` will match a numeral or digit character — in other words, any character out of the following:

```
0123456789
```

`ASCII_ALPHA` will match both small case and capital case alphabet characters — in other words, any character out of the following:

```
abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

You can use `ASCII_ALPHA_LOWER` and `ASCII_ALPHA_UPPER` to specifically match uppercase and lowercase characters in their respective cases.

Finally, `NEWLINE` will match control characters that represent line breaks, such as `\n` , `\n\r` or `\r`.

There are several other built-in rules that are explained [in the Pest docs](https://pest.rs/book/grammars/built-ins.html), but for the small program we will be building, the above rules should suffice. 

Note that all of the above rules match only a single character of their kind, not multiple characters. For example, for the input `abcde`, consider a rule such as the following:

```
my_rule = { ASCII_ALPHA }
```

This rule will match only the `a` character, and the rest of the input — `bcde` — will be passed on for further parsing.

### Matching multiple characters using repetitions

Now that we know how to match a single character, let us see how we can match multiple characters. There are three important types of repetitions, which we will cover below.

A plus sign `+` signifies “one or more.” Here, the Rust parser will try to match at least one occurrence of the rule. If there is more than one occurrence, Pest will match all of them. If it cannot find any match, it will be treated as an error.  For example, we can define a number like so:

```
NUMBER = { ASCII_DIGIT+ }
```
This rule will give an error if there are non-numerical characters present, such as alphabet characters or symbols.

An asterisk `*` signifies “zero or more.” This is useful when we want to allow multiple occurrences, but not give any errors even if there are none. For example, when defining a list, there can be zero or more comma-value pairs after the first value. You can ignore the tilda `~` in the code below for now, as we will see what it means in the next section:

```
LIST = { "[" ~ NUMBER ~ ("," ~ NUMBER)* "]" }
```
The rule above states that a list starts with a `[` , then there is a `NUMBER` , after which there can be zero or more pairs of `, number` groups. These are grouped together in brackets and followed with an asterisk `*` on the whole bracketed group. Finally, the list ends with a closing bracket `]`. 

This rule will match `[0]` , `[1,2]` , `[1,2,3]`, and so on. However, it will fail on `1` as there is no opening bracket `[` present, as well as `[1` as there is no closing bracket `]` present.

Finally, a question mark `?` matches either zero or one, but not more than one. For example, to allow a trailing comma in the above list, we can state it as follows:

```
LIST = { "[" ~ NUMBER ~ ("," ~ NUMBER)* ","? "]" }
```

This change will allow both `[1]` and `[1,]` .

Beyond these three options, there are other ways to specify repetitions, including ways to allow repetition a fixed number of times, or at most `n` times, or between `n` and `m` times. These details can be found [in the Pest docs](https://pest.rs/book/grammars/syntax.html#repetition), but the above three are enough for the example.

### Implicit matching with sequences

The tilda `~` we saw in the previous section is used to denote a sequence. For example, `A ~ B ~ C` translates to, “match rule A, then match B, then match C.” 

Using the explicit `~` to denote this sequence works due to the fact that there is some implicit matching of whitespace around the `~` symbol. This is because in many cases, coding rules and grammar ignore whitespace. For example, `if ( true)` is the same as `if(  true   )` and `if   (true  )`.

Hence, rather than the developer manually checking this in every place, the Pest-generated parser will automatically do that for us. The exact details of this implicit matching are explained in a later section below.

### Expressing alternate choices

Sometimes you might want to express multiple rules that are allowed to match a defined rule. For example, in JSON, a value can be a string OR an array OR an object, and so on. 

For such “OR” scenarios, we can express the idea of alternate choices using the vertical bar `|` symbol. The above JSON concept can be written as a rule like so:

```
VALUE = { STRING | ARRAY | OBJECT }
```
Note that as stated above when explaining PEG characteristics, these choices are made on a first-match basis. Thus, consider a rule such as the following:

```
RULE = { "cat" | "cataract" | "catastrophe" }
```

This rule will never match `cataract` and `catastrophe` because the parser will match the starting `cat-` part of both to the first rule `cat` , and then it will not try to match any further letters. After matching `cat`, the parser will pass the remaining inputs — `-aract` and `-astrophe` — to the next step, where it will probably not match anything and cause the parsing to fail. 

To make sure the vertical bar `|` has the intended effect, remember to always specify the most specific rule at the start and the most general at the end. For example, the correct way to express the above is as follows:

```
RULE = { "catastrophe" | "cataract" | "cat" }
```

Here, the order of `cataract` and `catastrophe` does not matter as they are not substrings of each other, and an input matching one will not match the other. Let’s take a quick look at an example case where this can happen:

```
all_queues = { "queue" | "que" | "q" }
```

The order used when matching `queue` and its variants `que` and `q` is important here, as the later strings are substrings of the first. The parser will first try to match the input to `queue`; only if it fails will the parser then try to match it to `que`. If that fails as well, the parser will finally try to match `q`.

### Understanding silents, atomics, and spacing

Now let us see what the underscore `_` and at `@` symbols mean. 

In the parser generated by Pest, each matched rule produces a `Pair` that consists of the input that matched and the rule it matched to. However, sometimes, we might want to match some rules to make sure grammar is followed, but otherwise want to ignore the contents of those rules as they are not important. 

In those cases, rather than it producing tokens which we then ignore in our code, we can denote that rule as silent by putting an underscore `_` before the opening curly bracket `{` in that rule’s definition. 

The most common use case of this strategy would be for ignoring comments. Even though we want the comments to follow grammar conventions — e.g., they must start with `//` and end with a newline — we don’t want them to show up during processing. Thus, to ignore comments, we can define them like so:

```
comments = _{ "//" ~ (!NEWLINE ~ ANY)* ~ NEWLINE }
```
This will try to match any comments. If there are any syntax errors — for example, if the comments start with only one `/` — it will produce an error. However, if the comments match successfully, the parser will not generate pairs for this rule.

Comments can theoretically show up at any place. Hence, we would need to put a `comments?` at every rule’s end, which would be tedious. 

To solve this issue, Pest provides two fixed rule names — `COMMENT` or `WHITESPACE` — and the generated parser will automatically allow these denoted comments or whitespaces to exist anywhere in the input. If we define either of the rules, the generated parser will implicitly check them around every tilda `~` and all repetitions. 

On the other hand, we don’t always want this behavior. For example, when we are writing rules that need to have a specific amount of whitespace, we cannot allow that space to be consumed by these implicit rules. 

As a workaround, we can define atomic rules — which do not perform implicit matching — by adding either an at `@` or dollar `$` symbol before the opening curly brackets `{` when defining the rule. The `@` makes the rule atomic and silent, whereas `$` will make the rule atomic and produce the tokens like any other rule.

### Built-in start and end of input rules

`SOI` and `EOI` are two special built-in rules that do not match anything, but instead, signify the start and end of the input. These are useful when you want to make sure that the whole input is parsed rather than just a part of it, or to allow whitespaces and comments at the start of a rule.

The above should cover the important basics for writing PEG rules, and the complete details can be found [in the Pest docs](https://pest.rs/book/grammars/syntax.html) if you need them. Now let us build an example parser using what we have learned!

## Demonstrating a simple parser with Pest

Building a parser with Pest gives you the ability to define and parse any syntax, including Rust. In our example project, we will be building a parser that will parse a simplified version of an HTML document to give information related to tags and attributes, along with the actual text.

Our example uses HTML because its syntax is widely known and understood without needing a great deal of explanation, but also provides enough complexity that we can show different things we will need to consider for parsing. After learning these basics, you can use the same knowledge to define and parse any syntax of your choosing. 

To start, create a new project and add `pest` and `pest_derive` as dependencies. 

Pest places importance on separating the rules and our application code. As a result, we have to define rules in a separate file and use the macros given by the Pest crate to build and import the parser in our code. To achieve this, we will create a file named `html.pest` in our `src` folder.

To start, we will first define `tag` as a rule. A tag starts with a less-than `<` symbol, immediately followed by either zero or one forward slashes `/` and then the tag name, which ends with either a `>` or `/>`. Thus, we can use a question mark `?` to detect the optional `/` and define the rule like so:

```
tag = ${ "<" ~ "/"? ~ ASCII_ALPHA+ ~ "/"? ~ ">" }
```

This rule is atomic, as we do not want to have the space between the less-than symbol `<` and the tag name. For now, this will also allow tags like `</abc/>` — which is invalid HTML — but we will take care of this later. As the tag name cannot be empty, we use a plus `+` symbol when matching alphabets.

Below we are also defining a `document` rule, which contains multiple tags and allows space between them:

```
document = { SOI ~ tag+ ~ EOI}
```
We used the plus `+` symbol, as the document should have at least one tag.

Finally, we define a `WHITESPACE` rule to allow whitespace and newlines between tags:

```
WHITESPACE = _{ " " | NEWLINE }
```

To actually build and import this into our project, we will add the following command:

```rust
use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "html.pest"]
pub struct HtmlParser;
```

In the code above, we started by importing the macro needed to derive the parser. We then defined our parser structure named `HtmlParser`, marked it with `#[derive(Parser)]`, and provided it the name of the file in which. we defined our rules using the `grammar =`  directive.

To see what it currently does, let’s set up the following:

```rust
const HTML:&str = "<html> </html>";

fn main() {
    // parse the input using the rule 'document'
    let parse = HtmlParser::parse(Rule::document, HTML).unwrap();
    // make an iterator over the pairs in the rule
    for pair in parse.into_iter(){
        // match the rule, as the rule is an enum
        match pair.as_rule(){
            Rule::document =>{
                // for each sub-rule, print the inner contents
                for tag in pair.into_inner(){
                    println!("{:?}",tag);
                }
            }
            // as we have  parsed document, which is a top level rule, there
            // cannot be anything else
            _ => unreachable!()
        }
    }
}
```

The above will produce the following output:
```bash
Pair { rule: tag, span: Span { str: "<html>", start: 0, end: 6 }, inner: [] }
Pair { rule: tag, span: Span { str: "</html>", start: 7, end: 14 }, inner: [] }
Pair { rule: EOI, span: Span { str: "", start: 14, end: 14 }, inner: [] }
```
This shows that the first match was an `<html>` tag, then an `</html>` tag, and finally, the end of input.

Let us try adding more tags and see if it still works:

```rust
const HTML:&str = "<html> <head> </head> <body></body> </html>";
```

The result should look like so:

```bash
Pair { rule: tag, span: Span { str: "<html>", start: 0, end: 6 }, inner: [] }
Pair { rule: tag, span: Span { str: "<head>", start: 7, end: 13 }, inner: [] }
Pair { rule: tag, span: Span { str: "</head>", start: 14, end: 21 }, inner: [] }
Pair { rule: tag, span: Span { str: "<body>", start: 22, end: 28 }, inner: [] }
Pair { rule: tag, span: Span { str: "</body>", start: 28, end: 35 }, inner: [] }
Pair { rule: tag, span: Span { str: "</html>", start: 36, end: 43 }, inner: [] }
Pair { rule: EOI, span: Span { str: "", start: 43, end: 43 }, inner: [] }
```

It correctly recognizes all the tags 🎉 

Now let us extend this to allow text inside the tags. To achieve this, we need to define `text`, which can be tricky. Why? Consider the following input:
```
<start> abc < def > </end>
```

With the above, if we define `text` as `ANY+` , it will gobble up everything starting from the `a` character in the `abc` string up to and including `</end>`.

If we instead define `text` as `ASCII_ALPHANUMERIC`, that will fix the above issue, but it will give us an error on the `<` symbol after the `abc` string, as the parser will expect it to be the start of a tag.

To overcome this, we define `text` like so:

```
document = { SOI ~ ( tag ~ text?)* ~ EOI }
...
text = { (ASCII_ALPHANUMERIC | other_symbols | non_tag_start | WHITESPACE )+ }
non_tag_start = ${ "<" ~ WHITESPACE+}
other_symbols = { ">" |"@" | ";" | "," }
```

Now, `text` is defined as any alphanumeric character OR `other_symbols` OR  `non_tag_start` OR `WHITESPACE` repeated one or more times. 

The `other_symbol` rule takes care of any non-alphanumeric symbols we want included. Meanwhile, `non_tag_start` is an atomic rule, which matches `<` strictly followed by one or more whitespaces. That way, we are restricting what we consider to be text. We are also forced to not leave any space between the tag-start symbol `<` and the tag’s name. This will do for our example.

Now, consider the following input:

```rust
const HTML:&str = "<html> <head> </head> <body> < def > </body> </html>";
```

We would get these results:

```bash
Pair { rule: tag, span: Span { str: "<html>", start: 0, end: 6 }, inner: [] }
Pair { rule: tag, span: Span { str: "<head>", start: 7, end: 13 }, inner: [] }
Pair { rule: tag, span: Span { str: "</head>", start: 14, end: 21 }, inner: [] }
Pair { rule: tag, span: Span { str: "<body>", start: 22, end: 28 }, inner: [] }
Pair { rule: text, span: Span { str: "< def >", start: 29, end: 36 }, inner: [...] }
Pair { rule: tag, span: Span { str: "</body>", start: 37, end: 44 }, inner: [] }
Pair { rule: tag, span: Span { str: "</html>", start: 45, end: 52 }, inner: [] }
Pair { rule: EOI, span: Span { str: "", start: 52, end: 52 }, inner: [] }
```

This what we expected.

Finally, we need to introduce attributes in tags so we can start parsing this into a document structure. To accomplish this, let’s define an `attr` as one or more `ASCII_ALPHA` character, followed by `=`, followed by quoted text:

```
attr = { ASCII_ALPHA+ ~ "=" ~ "\"" ~ text ~ "\""}
```

We will also modify the `tag` like so:

```
tag = ${ "<" ~ "/"? ~ ASCII_ALPHA+ ~ (WHITESPACE+ ~ attr)* ~ "/"? ~ ">" }
```

If we ran this on the following, which we have converted this to a raw string so we don’t have to escape quotes:

```
const HTML:&str = r#"<html lang=" en"> <head> </head> <body> < def > </body> </html>"#;
```

We would get the intended output:

```bash
Pair { rule: tag, span: Span { str: "<html lang=\" en\">", start: 0, end: 17 }, inner: [Pair { rule: attr, span: Span { str: "lang=\" en\"", start: 6, end: 16 }, inner: [Pair { rule: text, span: Span { str: " en", start: 12, end: 15 }, inner: [] }] }] }
Pair { rule: tag, span: Span { str: "<head>", start: 18, end: 24 }, inner: [] }
Pair { rule: tag, span: Span { str: "</head>", start: 25, end: 32 }, inner: [] }
Pair { rule: tag, span: Span { str: "<body>", start: 33, end: 39 }, inner: [] }
Pair { rule: text, span: Span { str: "< def >", start: 40, end: 47 }, inner: [...] }
Pair { rule: tag, span: Span { str: "</body>", start: 48, end: 55 }, inner: [] }
Pair { rule: tag, span: Span { str: "</html>", start: 56, end: 63 }, inner: [] }
Pair { rule: EOI, span: Span { str: "", start: 63, end: 63 }, inner: [] }
```

The `inner` field of the first pair contains the `attr` rule, as expected.

To help us determine the structure of the document, the nesting of the tags, and more, we will separate the `start_tag`, `end_tag`, and `self_closing_tag` definitions like so:

```
tag = ${ start_tag | self_closing_tag | end_tag }
start_tag = { "<" ~ ASCII_ALPHA+ ~ (WHITESPACE+ ~ attr)* ~ ">" }
end_tag = { "</" ~ ASCII_ALPHA+ ~ (WHITESPACE+ ~ attr)* ~ ">" }
self_closing_tag = { "<" ~ ASCII_ALPHA+ ~ (WHITESPACE+ ~ attr)* ~ "/>" }
```

Note that here, we can change the order of the `tag` definitions as they are mutually exclusive, meaning anything that is a `start_tag` cannot be a `self_closing_tag` and so on.

To check this, we use the following input:

```rust
const HTML:&str = r#"<html lang="en"> <head> </head> <body> <div class="c1" id="id1"> <img src="path"/> </div> </body> </html>"#;
```

The expected output is below, but note that it is manually formatted and the start and end positions have been truncated for better readability:

```bash
Pair { rule: tag, span: Span { str: "<html lang=\"en\">" ... }, 
  inner: [Pair { rule: start_tag, span: Span { str: "<html lang=\"en\">" ...}, 
    inner: [Pair { rule: attr, span: Span { str: "lang=\"en\"" ... }, 
      inner: [Pair { rule: text, span: Span { str: "en"}, inner: [] }] }] }] }

Pair { rule: tag, span: Span { str: "<head>" ... }, 
  inner: [Pair { rule: start_tag, span: Span { str: "<head>" ... }, inner: [] }] }

Pair { rule: tag, span: Span { str: "</head>" ... }, 
  inner: [Pair { rule: end_tag, span: Span { str: "</head>" ... }, inner: [] }] }

Pair { rule: tag, span: Span { str: "<body>" ... }, 
  inner: [Pair { rule: start_tag, span: Span { str: "<body>" ... }, inner: [] }] }

Pair { rule: tag, span: Span { str: "<div class=\"c1\" id=\"id1\">" ... }, 
  inner: [Pair { rule: start_tag, span: Span { str: "<div class=\"c1\" id=\"id1\">" ...}, 
    inner: [Pair { rule: attr, span: Span { str: "class=\"c1\"" ... }, 
      inner: [Pair { rule: text, span: Span { str: "c1" ... }, inner: [] }] }, 
  Pair { rule: attr, span: Span { str: "id=\"id1\"" ... }, 
      inner: [Pair { rule: text, span: Span { str: "id1" ... }, inner: [] }] }] }] }

Pair { rule: tag, span: Span { str: "<img src=\"path\"/>" ... }, 
  inner: [Pair { rule: self_closing_tag, span: Span { str: "<img src=\"path\"/>"...},
    inner: [Pair { rule: attr, span: Span { str: "src=\"path\"" ... }, 
      inner: [Pair { rule: text, span: Span { str: "path" ... }, inner: [] }] }] }] }

Pair { rule: tag, span: Span { str: "</div>" ...}, 
  inner: [Pair { rule: end_tag, span: Span { str: "</div>" ... }, inner: [] }] }

Pair { rule: tag, span: Span { str: "</body>" ...}, 
  inner: [Pair { rule: end_tag, span: Span { str: "</body>" ...}, inner: [] }] }

Pair { rule: tag, span: Span { str: "</html>" ...}, 
  inner: [Pair { rule: end_tag, span: Span { str: "</html>" ... }, inner: [] }] }

Pair { rule: EOI, span: Span { str: "" ... }, inner: [] }
```

As we can see, each of the tags is correctly identified as either `start_tag` or `end_tag` with the exception of the `img` tag, which is identified as `self_closing_tag`.

Now you can use these tokens to build a document tree structure. The [GitHub repo for this project](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/parser-with-pest) implements the code for converting this to a tree structure. This code can parse the following:

```html
    <html lang="en" l="abc"> 
    <head> 
    </head> 
    <body> 
        <div class="c1" id="id1"> 
            Hello 
            <img src="path"/> 
        </div> 
        <div>
            <p>
                <p>
                    abc
        </div>
        <p>
            jkl
        </p>
        <img/>
        </p> 
        </div>
    </body> 
    </html>
```

It can then print the hierarchy, which should look similar to the below:

```
- html
  - head
  - body
    - div
      - text(Hello)
      - img
    - div
      - p
        - p
          - text(abc)
    - p
      - text(jkl)
    - img
```

## Writing a parser for your own language

Using the concepts we have seen in the previous sections, you can write a similar parser for an existing language, or define your own syntax and write a parser for your own language as well. 

As an example, let us consider writing a parser for a subset of Rust’s syntax. Since writing a complete parser for Rust is essentially writing a frontend for Rust’s compiler, we won’t be covering the complete syntax here, nor showing detailed code examples.

First, let us consider built-in types and keywords. We can write parsing rules for these strings like so:

```
LET_KW = { "let" }
FOR_KW = { "for" }
...
U8_TYP = { "u8" }
I8_TYP = { "i8" }
...
TYPES = { U8_TYP | I8_TYP | ..}
```

Once this is done, we can define a variable name for a collection of characters encompassing `ASCII_ALPHA` characters, `ASCII_DIGIT` characters, and the underscore `_` symbol like so:

```
VAR_NAME = @{ ("_"|ASCII_ALPHA)~(ASCII_ALPHA | ASCII_DIGIT | "_")* }
```

This will allow a variable name to start with either an underscore or an alphabetical character, and the name can contain alphabetical characters, numbers or underscores. 

After this, defining a let expression that declares a variable without value is straightforward -

```
VAR_DECL = {LET_KW ~ VAR_NAME ~ (":" ~ TYPES)? ~ ("=" ~ VALUE)?~ ";"}
```
We start with the `let` keyword, which is followed by the variable name, and then optionally a variable type and an optional value to be assigned ending with a required semicolon. The value itself can be defined as either a number or a string or another variable:

```
VALUE = { NUMBER | STRING | VAR_NAME }
```

In this way, we can define constructs supported and parse the grammar of any language.

Going outside of Rust’s syntax, we can define our custom syntax as well:

```
VAR_DECL = { "let there be" VAR_NAME ~( "which stores" ~ TYPES )? ~ ("which is equal to" ~ VALUE)? "." }
```

This will allow us to declare variables in the format below:

```
let there be num which stores i8 which is equal to 5.
let there be counter which is equal to 7.
let there be greeting which stores string.
```

In this way, we can define our own syntax and grammar, parse it using Pest, and build our own language.

## Conclusion

In this article, we saw why we need to use parser generators to generate parsers rather than writing them by hand. We also explored the Pest parser generator and using PEG. Finally, we saw an example Rust parser project using Pest for parsing a simplified HTML document’s syntax.

The code for this, including building the document structure, can be found in [my GitHub repo](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/parser-with-pest). Thanks for reading!

