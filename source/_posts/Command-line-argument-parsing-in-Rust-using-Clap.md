---
title: Command line argument parsing in Rust using Clap
date: 2022-04-19
tags: [rust, tutorial, compiler]
logrocket: https://blog.logrocket.com/using-clap-rust-command-line-argument-parsing/
categories: logrocket
---

In this article, we will see how to manually parse command line arguments passed to a Rust application, why manual parsing might not be a good choice for larger apps, and how the Clap library helps solve these issues, including:


- Setting up an example Rust application
- What is Clap?
- Adding Clap to a project
- Updating the help message
- Adding flags into Clap
- Fixing the empty string bug
- Logging with Clap
- Counting and finding projects

As a note, you should be comfortable reading and writing basic Rust, such as variable declarations, if-else blocks, loops, and structs.

## Setting up an example Rust application

Let’s say, for example, we have a projects folder that has a lot of node-based projects and we want to know, “Which of all the packages—including dependency packages—have we used, and how many times? 

After all, that combined 1GB of `node_modules` cannot be all unique dependencies, right 😰 …?

What if we made a nice little program that counts the number of times we use a package in our projects? 

To do this, let’s set up a project with  `cargo new package-hunter` in Rust. The `src/main.rs` file is now has the default main function:

```rust
fn main() {
    println!("Hello, world!");
}
```

The next step seems quite simple: get the arguments that pass to the application. So, write a separate function to extract other arguments later:

```rust
fn get_arguments() {
    let args: Vec<_> = std::env::args().collect(); // get all arguments passed to app
    println!("{:?}", args);
}
fn main() {
    get_arguments();
}
```


When we run it, we get a nice output, without any errors or panic:
```bash
# anything after '--' is passed to your app, not to cargo
> cargo run -- svelte 
    Finished dev [unoptimized + debuginfo] target(s) in 0.01s
     Running `target/debug/package-hunter svelte`
["target/debug/package-hunter", "svelte"]
```

Of course, the first argument is the command that invoked the application, and the second argument is the one passed to it. Seems pretty straightforward.

###  Writing a counting function

We can now merrily go on to write the counting function, which takes a name, and count directories with that name in the subdirectories:

```rust
use std::collections::VecDeque;
use std::fs;
use std::path::PathBuf;
/// Not the dracula
fn count(name: &str) -> std::io::Result<usize> {
    let mut count = 0;
    // queue to store next dirs to explore
    let mut queue = VecDeque::new();
    // start with current dir
    queue.push_back(PathBuf::from("."));
    loop {
        if queue.is_empty() {
            break;
        }
        let path = queue.pop_back().unwrap();
        for dir in fs::read_dir(path)? {
            // the for loop var 'dir' is actually a result, so we convert it
            // to the actual dir struct using ? here
            let dir = dir?;
            // consider it only if it is a directory
            if dir.file_type()?.is_dir() {
                if dir.file_name() == name {
                    // we have a match, so stop exploring further
                    count += 1;
                } else {
                    // not a match so check its sub-dirs
                    queue.push_back(dir.path());
                }
            }
        }
    }
    return Ok(count);
}
```
We update the `get_arguments` to return the first argument after the command, and in `main`, we call `count` with that argument. 

When we run this inside one of the project folders, it unexpectedly works perfectly, and returns the count as 1 because a single project will contain a dependency only once.

### Creating a depth limit

Now, as we go a directory up, and try to run it, we notice a problem: it takes a little more time because there are more directories to go through. 

Ideally, we want to run it from the root of our project directory, so we can find all the projects that have that dependency, but this will take even more time.

So, we decide to compromise and only explore directories until a certain depth. If the depth of a directory is more than the depth given, it will be ignored. We can add another parameter to the function and update it to consider the depth:

```rust
/// Not the dracula
fn count(name: &str, max_depth: usize) -> std::io::Result<usize> {
...
queue.push_back((PathBuf::from("."), 0));
...
let (path, crr_depth) = queue.pop_back().unwrap();
if crr_depth > max_depth {
    continue;
}
...
// not a match so check its sub-dirs
queue.push_back((dir.path(), crr_depth + 1));
...   
}
```
Now the application takes in two parameters: first one the package name, then the maximum depth to explore. 

However, we want the depth to be an optional argument, so if not given, it will explore all the subdirectories, else it will stop at the given depth.

For this, we can update the `get_arguments` function to make the second argument optional:

```rust
fn get_arguments() {
    let args: Vec<_> = std::env::args().collect();
    let mdepth = if args.len() > 2 {
        args[2].parse().unwrap()
    } else {
        usize::MAX
    };
    println!("{:?}", count(&args[1], mdepth));
}
```
With this, we can run it in both ways, and it works:

```bash
> cargo run -- svelte
> cargo run -- svelte 5
```
Unfortunately, this is not very flexible. When we give the arguments in reverse order, like `cargo run 5 package-name`, the application crashes as it tries to parse `package-name` as a number. 

### Adding flags

Now, we might want the arguments to have their own flags, something like `-f` and `-d` so we can give them in any order. (Also bonus Unix points for flags!)

We again update the `get_arguments` function, and this time add a proper struct for the arguments, so returning the parsed arguments is easier:

```rust
#[derive(Default)]
struct Arguments {
    package_name: String,
    max_depth: usize,
}
fn get_arguments() -> Arguments {
    let args: Vec<_> = std::env::args().collect();
    // atleast 3 args should be there : the command name, the -f flag, 
    // and the actual file name
    if args.len() < 3 {
        eprintln!("filename is a required argument");
        std::process::exit(1);
    }
    let mut ret = Arguments::default();
    ret.max_depth = usize::MAX;
    if args[1] == "-f" {
        // it is file
        ret.package_name = args[2].clone();
    } else {
        // it is max depth
        ret.max_depth = args[2].parse().unwrap();
    }
    // now that one argument is parsed, time for seconds
    if args.len() > 4 {
        if args[3] == "-f" {
            ret.package_name = args[4].clone();
        } else {
            ret.max_depth = args[4].parse().unwrap();
        }
    }
    return ret;
}

fn count(name: &str, max_depth: usize) -> std::io::Result<usize> {
...
}

fn main() {
    let args = get_arguments();
    match count(&args.package_name, args.max_depth) {
        Ok(c) => println!("{} uses found", c),
        Err(e) => eprintln!("error in processing : {}", e),
    }
}
```
Now, we can run it with fancy `-` flags like  `cargo run` `--` `-f svelte` or `cargo run` `--` `-d 5 -f svelte`.

### Issues with the arguments and flags

However, this has some pretty serious bugs: we can give the same argument twice, and thus skip the file argument entirely `cargo run` `--` `-d 5 -d 7`, or we can give invalid flags and this runs without any error message 😭 . 

We can fix this by checking that the `file_name` is not empty on line `27` above, and possibly printing what is expected when incorrect values are given. But, this also crashes when we pass a non-number to `-d`, as we directly call `unwrap` on `parse`.

Also, this application can be tricky for new users because it does not provide any help information. Users might not know what arguments will pass and in which order, and the application does not have an `-h` flag, like conventional Unix programs, to display that information.

Even though these are just little inconveniences for this specific app, as the number of options will grow as their complexity increases, it becomes harder and harder to maintain all of this manually. 

Which is where Clap comes in.

## What is Clap?

Clap is a library that provides functionality to generate parsing logic for arguments, provides a neat and tidy CLI for applications, including explanation of arguments, and an `-h` help command. 

Using Clap is pretty easy, and requires only minor changes to the current setup that we have. 

Clap has two common versions used in many Rust projects: V2 and V3. V2 primarily provides a builder based implementation for building a command line argument parser. 

V3 is a recent release (at the time of writing), which adds `derive` proc-macro along with the builder implementation, so we can annotate our struct, and the macro will derive the necessary functions for us. 

Both of these have their own benefits, and for a more detailed differences and features list, we can check out their [documentation and help pages](https://github.com/clap-rs/clap), which provide examples and suggests which situations derive and builder are suitable for.

In this post, we will see how to use Clap V3 with the proc-macro.

## Adding Clap to a project

To incorporate Clap into our project, add the following in the `Cargo.toml`:

```toml
[dependencies]
clap = { version = "3.1.6", features = ["derive"] }
```

This adds Clap as a dependency with its derive features.

Now, let’s remove the `get_arguments` function and its call from `main`:

```rust
use std::collections::VecDeque;
use std::fs;
use std::path::PathBuf;
#[derive(Default)]
struct Arguments {
    package_name: String,
    max_depth: usize,
}
/// Not the dracula
fn count(name: &str, max_depth: usize) -> std::io::Result<usize> {
    let mut count = 0;
    // queue to store next dirs to explore
    let mut queue = VecDeque::new();
    // start with current dir
    queue.push_back((PathBuf::from("."), 0));
    loop {
        if queue.is_empty() {
            break;
        }
        let (path, crr_depth) = queue.pop_back().unwrap();
        if crr_depth > max_depth {
            continue;
        }
        for dir in fs::read_dir(path)? {
            let dir = dir?;
            // we are concerned only if it is a directory
            if dir.file_type()?.is_dir() {
                if dir.file_name() == name {
                    // we have a match, so stop exploring further
                    count += 1;
                } else {
                    // not a match so check its sub-dirs
                    queue.push_back((dir.path(), crr_depth + 1));
                }
            }
        }
    }
    return Ok(count);
}
fn main() {}
```

Next, in `derive` for the `Arguments` structure, add `Parser` and `Debug`:

```rust
use clap::Parser;
#[derive(Parser,Default,Debug)]
struct Arguments {...}
```

Finally, in `main`, call the parse method:

```rust
let args = Arguments::parse();
println!("{:?}", args);
```

If we run the application with `cargo run`, without any arguments, we get an error message:

```bash
error: The following required arguments were not provided:
    <PACKAGE_NAME>
    <MAX_DEPTH>

USAGE:
    package-hunter <PACKAGE_NAME> <MAX_DEPTH>

For more information try --help
```
This is already better error reporting that our manual version!

And as a bonus, it automatically provides an `-h` flag for help, which can print the arguments and their order:

```bash
package-hunter 

USAGE:
    package-hunter <PACKAGE_NAME> <MAX_DEPTH>

ARGS:
    <PACKAGE_NAME>    
    <MAX_DEPTH>       

OPTIONS:
    -h, --help    Print help information
```
And now, if we provide something other than a number for `MAX_DEPTH`, we get an error saying the string provided is not a number:

```bash
> cargo run -- 5 test
error: Invalid value "test" for '<MAX_DEPTH>': invalid digit found in string

For more information try --help
```
If we provide them in the correct order, we get the output of `println`:

```bash
> cargo run -- test 5
Arguments { package_name: "test", max_depth: 5 }
```
All of this with just two new lines and no need to write any parsing code or error handling! 🎉 

## Updating the help message

Currently, our help message is a bit bland because it only shows the argument’s name and order. It would be more helpful to users if they can see what a particular argument is meant for, maybe even the application version in case they want to report any error.

Clap also provides options for this:

```rust
#[derive(...)]
#[clap(author="Author Name", version, about="A Very simple Package Hunter")]
struct Arguments{...}
```
Now, the `-h` output shows all the details and also provides a `-V` flag to print out the version number:

```bash
package-hunter 0.1.0
Author Name
A Very simple Package Hunter

USAGE:
    package-hunter <PACKAGE_NAME> <MAX_DEPTH>

ARGS:
    <PACKAGE_NAME>    
    <MAX_DEPTH>       

OPTIONS:
    -h, --help       Print help information
    -V, --version    Print version information
```

It can be a bit tedious to write multiple lines about information in the macro itself, so instead, we can add a doc comment using `///` for the struct, and the macro will use it as the about information (in case both are present, the one in macro takes precedence over the doc comment):

```rust
#[clap(author = "Author Name", version, about)]
/// A Very simple Package Hunter
struct Arguments {...}
```
This provides the same help as before.

To add information about the arguments, we can add similar comments to the arguments themselves:

```bash
package-hunter 0.1.0
Author Name
A Very simple Package Hunter

USAGE:
    package-hunter <PACKAGE_NAME> <MAX_DEPTH>

ARGS:
    <PACKAGE_NAME>    Name of the package to search
    <MAX_DEPTH>       maximum depth to which sub-directories should be explored

OPTIONS:
    -h, --help       Print help information
    -V, --version    Print version information
```
This is much more helpful!

Now, let us bring back the other features we had, such as argument flags (`-f` and `-d`) and setting the depth argument optional.

## Adding flags into Clap

Clap makes flag arguments ridiculously simple: we simply add another Clap macro annotation to the struct member with  `#[clap(short, long)]`. 

Here, `short` refers to the shorthand version of the flag, such as `-f`, and `long` refers to the complete version, such as `--file`. We can choose either or both. With this addition, we now have the following:

```bash
package-hunter 0.1.0
Author Name
A Very simple Package Hunter

USAGE:
    package-hunter --package-name <PACKAGE_NAME> --max-depth <MAX_DEPTH>

OPTIONS:
    -h, --help                           Print help information
    -m, --max-depth <MAX_DEPTH>          maximum depth to which sub-directories should be explored
    -p, --package-name <PACKAGE_NAME>    Name of the package to search
    -V, --version                        Print version information
```

With both the arguments having flags, there are now no positional arguments; this means we cannot run `cargo run` `--` `test 5` because Clap will look for the flags and give an error that the arguments are not provided. 

Instead, we can run `cargo run` `--` `-p test -m 5` or `cargo run` `--` `-m 5 -p test` and it will parse both correctly, giving us this output:

```rust
Arguments { package_name: "test", max_depth: 5 }
```

Because we always need the package name, we can make it a positional argument so we don’t need to type the `-p` flag each time. 

To do this, remove the  `#[clap(short,long)]` from it; now the first argument without any flags will be considered as `package name`:

```bash
> cargo run -- test -m 5
Arguments { package_name: "test", max_depth: 5 }
> cargo run -- -m 5 test
Arguments { package_name: "test", max_depth: 5 }
```
One thing to note in shorthand arguments is that if two arguments begin with the same letter— that is, `package-name` and `path`—and both have a short flag enabled, then the application will crash at runtime for debug builds and give some confusing error messages for release builds. 

So, make sure that either:

- All arguments begin with different alphabets
- Only one of the arguments with the same starting alphabet has a `short` flag

The next step is to make the `max_depth` optional.

### Making an argument optional

To mark any argument as optional, simply make that argument’s type `Option<T>` where `T` is the original type argument. So in our case, we have the following:

```rust
#[clap(short, long)]
/// maximum depth to which sub-directories should be explored
max_depth: Option<usize>,
```
This should do the trick. The change also reflects in the help, where it does not list the max depth as a required argument:

```bash
package-hunter 0.1.0
Author Name
A Very simple Package Hunter

USAGE:
    package-hunter [OPTIONS] <PACKAGE_NAME>

ARGS:
    <PACKAGE_NAME>    Name of the package to search

OPTIONS:
    -h, --help                     Print help information
    -m, --max-depth <MAX_DEPTH>    maximum depth to which sub-directories should be explored
    -V, --version                  Print version information
```
And, we can run it without giving the `-m` flag:

```bash
> cargo run -- test
Arguments { package_name: "test", max_depth: None }
```

But, this is still a little cumbersome; now we must run `match` on `max_depth`, and if it is `None`, we set it to `usize::MAX` as before. 

Clap, however, has something for us here as well! Instead of making it `Option<T>`, we can set the default value of an argument if not given.

So after modifying it like this:

```rust
#[clap(default_value_t=usize::MAX,short, long)]
/// maximum depth to which sub-directories should be explored
max_depth: usize,
```
We can run the application with or without providing the value of `max_depth` (the max value for `usize` depends on your system configuration):

```bash
> cargo run -- test
Arguments { package_name: "test", max_depth: 18446744073709551615 }
> cargo run -- test -m 5
Arguments { package_name: "test", max_depth: 5 }
```
Now, let’s hook it up to the count function in `main` like before:

```rust
fn main() {
    let args = Arguments::parse();
    match count(&args.package_name, args.max_depth) {
        Ok(c) => println!("{} uses found", c),
        Err(e) => eprintln!("error in processing : {}", e),
    }
}
```
And with this, we have our original functionality back, but with much less code and some extra added features!

## Fixing the empty string bug

The `package-hunter` is performing as expected, but alas, there is a subtle bug that has been there since the manual parsing stage and carried to the Clap-based version. Can you guess what it is?

Even though it is not a very dangerous bug for our small little app, it can be the Achilles heel for other applications. In our case, it will give a false result when it should give an error.

Try running the following :

```bash
> cargo run -- ""
0 uses found
```
Here, the `package_name` is passed in as an empty string when an empty package name should not be allowed. This happens due to the way the shell we run the command from passes the arguments to our app.

Usually, the shell uses spaces to split the argument list passed to the program, so `abc def hij` will be given as three separate arguments: `abc` , `def`, and `hij`. 

If we want to include the space in an argument, we must put quotes around it, like `"``abc efg hij``"`. That way the shell knows this is a single argument and it passes it as such.

On the other hand, this also allows us to pass empty strings or strings with only spaces to the app. Again, Clap to the rescue! It provides a way to deny empty values for an argument:

```rust
#[clap(forbid_empty_values = true)]
/// Name of the package to search
package_name: String,
```

With this, if we try to give an empty string as the argument, we get an error:

```bash
> cargo run -- ""
error: The argument '<PACKAGE_NAME>' requires a value but none was supplied
```
But, this still provides spaces as a package name, meaning  `"` ```"` is a valid argument. To fix this, we must provide a custom validator, which will check if the name has any leading or trailing spaces and will reject it if it does.

We define our validation function as the following:

```rust
fn validate_package_name(name: &str) -> Result<(), String> {
    if name.trim().len() != name.len() {
        Err(String::from(
            "package name cannot have leading and trailing space",
        ))
    } else {
        Ok(())
    }
}
```
And then, set it up for `package_name` as the following:

```rust
#[clap(forbid_empty_values = true, validator = validate_package_name)]
/// Name of the package to search
package_name: String,
```
Now, if we try to pass an empty string or string with spaces, it will give an error, as it should:

```bash
> cargo run -- "" 
error: The argument '<PACKAGE_NAME>' requires a value but none was supplied
> cargo run -- " "
error: Invalid value " " for '<PACKAGE_NAME>': package name cannot have leading and trailing space
```
This way, we can validate the arguments with a custom logic without writing all the code for parsing it.

## Logging with Clap

The application is working fine now, but we have no way to see what happened in the cases when it didn’t. For that, we should keep logs of what our application is doing to see what happened when it crashed.

Just like other command line applications, we should have a way for users to set the level of the logs easily. By default, it should only log major details and errors so the logs aren’t cluttered, but in cases when our application crashes, there should be a mode to log everything possible. 

Like other applications, let’s make our app take the verbosity level using a `-v` flag; no flag is the minimum logging, `-v` is intermediate logging, and `-vv` is maximum logging.

To do this, Clap provides a way so that the value of an argument is set to the number of times it occurs, which is exactly what we need here! We can add another parameter, and set it as the following:

```rust
#[clap(short, long, parse(from_occurrences))]
verbosity: usize,
```
Now, if we run it without giving it a `-v` flag, it will have value of zero, and otherwise count how many time `-v` flag occurs:

```bash
> cargo run -- test
Arguments { package_name: "test", max_depth: 18446744073709551615, verbosity: 0 }
> cargo run -- test -v
Arguments { package_name: "test", max_depth: 18446744073709551615, verbosity: 1 }
> cargo run -- test -vv
Arguments { package_name: "test", max_depth: 18446744073709551615, verbosity: 2 }
> cargo run -- -vv test -v
Arguments { package_name: "test", max_depth: 18446744073709551615, verbosity: 3 }
```
Using this value, we can easily initialize the logger and make it log appropriate amount of details. 

I have not added the dummy logger code here, as this post focuses on the argument parsing, but you can find it in the repository at the end.

## Counting and finding projects

Now that our application is working well, we want to add another functionality: listing the projects we have. That way, when we want a nice list of projects, we can quickly get one.

Clap has a powerful subcommand feature that can provide app with multiple subcommands. To use it, define another struct with its own arguments that will be the subcommand. The main argument struct contains the arguments common to all the subcommands, and then the subcommands.

We will structure our CLI as the following:

- The log verbosity and `max_depth` parameters will be in the main structure
- The count command will take the file name to find and output the count
- The `projects` command takes an optional start path to start the search
- The `projects` command takes an optional exclude paths list, which skips the given directories

Thus, we add the count and project enum as below:

```rust
use clap::{Parser, Subcommand};
...
#[derive(Subcommand, Debug)]
enum SubCommand {
    /// Count how many times the package is used
    Count {
        #[clap(forbid_empty_values = true, validator = validate_package_name)]
        /// Name of the package to search
        package_name: String,
    },
    /// list all the projects
    Projects {
        #[clap(short, long, default_value_t = String::from("."),forbid_empty_values = true, validator = validate_package_name)]
        /// directory to start exploring from
        start_path: String,
        #[clap(short, long, multiple_values = true)]
        /// paths to exclude when searching
        exclude: Vec<String>,
    },
}
```
Here, we move the `package_name` to the `Count` variant and add the `start_path` and `exclude` options in the `Projects` variant.

Now, if we check help, it lists both of these subcommands and each of the subcommand has its own help.

Then we can update the main function to accommodate them:

```rust
let args = Arguments::parse();
match args.cmd {
    SubCommand::Count { package_name } => match count(&package_name, args.max_depth, &logger) {
        Ok(c) => println!("{} uses found", c),
        Err(e) => eprintln!("error in processing : {}", e),
    },
    SubCommand::Projects {
        start_path,
        exclude,
    } => {/* TODO */}
}
```
We can also use the `count` command like before to count the number of uses:

```bash
> cargo run -- -m 5 count test
```
As `max_depth` is defined in the main `Arguments` struct, it must be given before the subcommand.

We can then give multiple values to the project’s command’s excluded directories, as needed:

```bash
> cargo run -- projects -e ./dir1 ./dir2
["./dir1", "./dir2"] # value of exclude vector
```
We can also set a custom separator, in case we don’t want the values to be separated by space, but by a custom character:

```rust
#[clap(short, long, multiple_values = true, value_delimiter = ':')]
/// paths to exclude when searching
exclude: Vec<String>,
```
Now we can use `:` to separate values:

```bash
> cargo run -- projects -e ./dir1:./dir2
["./dir1", "./dir2"]
```
This completes the CLI for the application. The project listing function is not shown here, but you can try writing that on your own or check its code in the GitHub repository.

## Conclusion

Now that you know about Clap, you can make clean and elegant CLIs for your projects. It has many other features, and if your project needs a specific functionality for the command line, there is a good chance that Clap already has it.

You can check out the [Clap docs](https://docs.rs/clap/latest/clap/) and Clap [GitHub page](https://github.com/clap-rs/clap) to see more information on the options that the Clap library provides.

You can also get the code for this [project here](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/a7ebf4fe270434dd804adfaa254b9d015e956a18/arg-parsing-with-clap). Thank you for reading!


