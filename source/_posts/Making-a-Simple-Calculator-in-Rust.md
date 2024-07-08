---
title: Making a Simple Calculator in Rust
date: 2020-10-14
tags: [rust, compiler, tutorial]
---

Recently I came across [lalrpop](https://github.com/lalrpop/lalrpop), a lexer-parser-generator in Rust. I had previously used flex-bison pair in C for the same, and after taking a look at lalrpop, I felt that it can be of same use in Rust. For a starter project I made a simple calculator, which can solve equations, as well as store and use variables.

### End result

``` bash
>>>>> 5*2
10
>>>>> 2**8
256
>>>>> 3/2
1.5
>>>>> var1 = 5
5
>>>>> var1 *2
10
>>>>> var2 + 2
Error : Undefined Symbol
>>>>> var1 ** 2
25
>>>>> 

```

## Some (Informal) Definitions :

- A **Lexer** is something that takes in stream of text, and gives a stream of tokens.
- A **Token** can be thought as small, individual parts of our 'language' we are writing. For this calculator, the language can be thought of as maths, and number, operators as tokens. In greater view, for  programming languages, numbers, string literals, variables, keywords are all tokens.
- A **Parser** is something that takes in a stream of Tokens, and processes them according to some defined patterns. In this calculator, the pattern can be thought as `'2' '+' '3'`, where '2' , '3' and '+' are tokens, and the action taken could be addition of the values.

For this project, we will use the default lexer that lalrpop crate provides, and write the 'rules' (patterns) for parsing in `parser.lalrpop` file.

## First step

Let's start by creating a Rust project, run `cargo init` in the project directory

```bash
cargo init .
```

After that, we will edit the `Cargo.toml` file, and add the lalrpop and regex dependencies :

```toml
[dependencies]
lalrpop-util = "0.19.1"
regex = "1"
```

Lalrpop has a decent documentation and starting guide, found [here](http://lalrpop.github.io/lalrpop/index.html), and we will start by using some of the basic code that is provided their. It is not hard to write it up ourselves, but it provides some start point for our calculator quite easy and fast.

## Writing Parser Rules

Let's create file called as `parser.lalrpop` in `src/` , and copy the code given [here](http://lalrpop.github.io/lalrpop/tutorial/004_full_expressions.html), which will set up a starting point to parse equations for integers. To make it a bit more general, we will change the i32 to f32,and after a bit of shortening of names for convenience, the code will look like as this:


```
use std::str::FromStr;

grammar;

pub Expr:f32 = {
    <e:Expr> "+" <f:Factor> => e+f,
    <e:Expr> "-" <f:Factor> => e-f,
    <Factor>
};

Factor:f32 = {
    <f:Factor> "*" <t:Term> => f*t,
    <f:Factor> "/" <t:Term> => f/t,
    <Term>
};

Term: f32 = {
    Num,
    "(" <Expr> ")",
};

Num: f32 = <s:r"[0-9]+\.?[0-9]*"> => f32::from_str(s).unwrap();

```
Now to explain the code :

- `grammar` is the function that will be used to parse our input. Even though not used right now, we'll use this later. The rules are given as top down approach, as the order of rules is used for tie-breaking, but it is easier to understand in a bottom-up fashion.
- `Num` is the smallest and simplest token, which defines a floating point number.
- `Term` is used to define a smallest part of an expression, and can be wither a number, or an `Expr` in a bracket.
- `Factor` can be a `Term` or an existing `Factor` * or / a `Term`. This it as this : for expression `2*3/6`, we'll see '2' and classify it as `Num`. This can be further classified as a `Term`, and also an `Factor`. After seeing '\*', we try to match the rules, and find that it can be matched with First rule of `Factor`, knowing that '2' is an `Factor`, we can reduce '2*3' as '6', which is classified as an `Factor` again. After seeing '/' we try to find the rule, match with second rule in `Factor`, and solve it as '6/6' as 1.
- `Expr` is either a `Factor` or an existing `Expr` + or - `Factor`.

The reason to split up `Factor` and `Expr` is so we can maintain order of importance. As to make an `Expr`, we need a `Factor`, thus multiplication and division are given precedence over addition and subtraction. 

To run this we will first need to compile parser from lalrpop rules to Rust, which is done by lalrpop crate, but we need to specify that in the build section :

```toml
#Cargo.toml
build = "src/build.rs"

[build-dependencies]
lalrpop = { version = "0.19.1", features = ["lexer"] }
```

We will also crate a `build.rs` file in `src/`, with a single main function :


```Rust
extern crate lalrpop;

fn main() {
    lalrpop::process_root().unwrap();
}
```

This is not the main function of our program, but the program that is run before compiling our program, hence the name `build.rs` . This basically looks into the root folder of the project and compile lalrpop files to rust files.

To test the application, make a file `main.rs` in `src/` :

```rust
#[macro_use]
extern crate lalrpop_util;
lalrpop_mod!(pub parser); //defines parser mod
fn main(){
     // Output 4
     match parser::ExprParser::new().parse("2+2") {
            Ok(v) => println!("{}", v),
            Err(e) => println!("Error : {}", e),
        }
}
```

The name `ExprParser` is due to fact we have made the `Expr` as pub in out lalrpop file. Whichever parts are pub in lalrpop file, will have a corresponding parser in parser.

Let us add an exponentiation operation in our calculator. In the token `Factor`:
```
Factor:f32 = {
    <f:Factor> "**" <t:Term> => f.powf(t),
    <f:Factor> "*" <t:Term> => f*t,
    <f:Factor> "/" <t:Term> => f/t,
    <Term>
};
```
Now we can write 2**4 to get 2<sup>4</sup>.

Finally , let's add ability to store and use variables. For that we will first need to define variables or `Symbol` token in the lalrpop file. As generally in programming languages, we will allow variable to start with an underscore or a letter, and have letters, underscores, or numbers in it.
In the parser.lalrpop file , at very end , add :

```
Symbol:String = <s:r"[_a-zA-Z][_a-zA-Z0-9]*"> => s.to_owned();
```

Now we will take a HashMap to store the variables and corresponding values in. To take that as argument in our parser, we use the `grammar` mentioned before. As we want the variables to persist till end of program, we will need to use same HashMap again and again, hence, we will take it by mutable reference, instead of by value:

```
use std::collections::HashMap;
use lalrpop_util::ParseError;

grammar<'s>(symtab:&'s mut HashMap<String,f32>);
```

We bound the lifetime by requiring the HashMap to live as long as the parsing of single line is going on. The ParseError is required to return error as we will see shortly. Now we have to modify out `Term` definition to accommodate for variables:

```
Term: f32 = {
    <Num>,
    "(" <Expr> ")",
    <s:Symbol> =>? match symtab.get(&s){
        Some(v)=>Ok(*v),
        None=>Err(ParseError::User{error:"Undefined Symbol"})
    }
};
```
Here the `=>?` means that it can return a f32 or an error, which is converted to a Result internally when compiling from lalrpop to Rust.
Here, we define `Term` to mean either a number, a bracketed `Expr` or a `Symbol`. For the Symbol, we check if it exists in out HashMap or not : if it does, we return corresponding value, if not we return an error.

This only defines the use of a variable. To initially assign value to variable, we need a `name = value` kind of statement. To define this rule, we define a new Token `Statement` above `Expr`, and make it public, removing `pub` from `Expr`.

```
pub Statement: f32 = {
    Expr,
    <s:Symbol> "=" <e:Expr>  =>{
        symtab.insert(s,e);
        e
    }
}
```

Here, a `Statement` can either be an expression, which will simply return its value, or an assignment, in which case, we will insert the value for the name as the key, and return the value. If the variable already exists, it will be silently overwritten.

Finally, The `parser.lalrpop` is :


```
use std::str::FromStr;
use std::collections::HashMap;
use lalrpop_util::ParseError;

grammar<'s>(symtab:&'s mut HashMap<String,f32>);

pub Statement: f32 = {
    Expr,
    <s:Symbol> "=" <e:Expr>  =>{
        symtab.insert(s,e);
        e
    }
}

Expr:f32 = {
    <e:Expr> "+" <f:Factor> => e+f,
    <e:Expr> "-" <f:Factor> => e-f,
    <Factor>
};

Factor:f32 = {
    <f:Factor> "**" <t:Term> => f.powf(t),
    <f:Factor> "*" <t:Term> => f*t,
    <f:Factor> "/" <t:Term> => f/t,
    <Term>
};


Term: f32 = {
    <Num>,
    "(" <Expr> ")",
    <s:Symbol> =>? match symtab.get(&s){
        Some(v)=>Ok(*v),
        None=>Err(ParseError::User{error:"Undefined Symbol"})
    }
};

Num: f32 = <s:r"[0-9]+\.?[0-9]*"> => f32::from_str(s).unwrap();

Symbol:String = <s:r"[_a-zA-Z][_a-zA-Z0-9]*"> => s.to_owned();
```

Now in the main file we set up the input method :

``` Rust
#[macro_use]
extern crate lalrpop_util;
use std::collections::HashMap;
use std::io::BufRead;
use std::io::Write;

lalrpop_mod!(pub parser);

fn main() {
    let mut symtab = HashMap::new();
    print!(">>>>> ");
    std::io::stdout().flush().unwrap();
    for line in std::io::stdin().lock().lines() {
        let line = line.expect("Input Error");
        match parser::StatementParser::new().parse(&mut symtab, line.trim()) {
            Ok(v) => println!("{}", v),
            Err(e) => println!("Error : {}", e),
        }
        print!(">>>>> ");
        std::io::stdout().flush().unwrap();
    }
}
```
This declares a HashMap, prints '>>>>>' as a decoration for input, and then continuously reads the input, and gives each line to the parser, printing the result or error returned.

This was a basic project I came up with to see how lalrpop can be used. It can be further modified by adding constants or functions. 
Hope you had fun reading this! 

Thank you!
