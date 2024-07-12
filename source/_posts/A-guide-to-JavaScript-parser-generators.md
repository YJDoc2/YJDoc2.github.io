---
title: A guide to JavaScript parser generators
date: 2024-05-30
tags: [javascript, tutorial, compiler]
logrocket: https://blog.logrocket.com/guide-javascript-parser-generators/
categories: logrocket
---

Parsers play a crucial role in interpreting and processing code or data in development. Parser generators, in turn, help automate the creation of parsers and make it easier for developers to handle complex parsing needs efficiently. 

In this article, we will explore parsers and parser generators, along with how to use three popular parser generators to create parsers for custom languages or specific needs. As a note, this post assumes you have functioning knowledge of JavaScript. Some regex knowledge is helpful but not required.

## What are parsers?

Parsers are programs that take an input of unstructured data and convert it into some kind of structured data, alongside validating it. They’re fairly common in today’s development world and are an important part of compilers and interpreters. 

Apart from those, parsers are also useful when we have some plain text inputs that we want to convert into some in-memory structure. Example usages of parsers include converting a JSON text file into an actual JSON object in memory, or when browsers convert CSS stylesheets into actual page formatting. 

While parsers might be hidden from our sight, they ensure that the code we write is syntactically correct, and help us to detect error locations when it is not.

Parsers usually come hand-in-hand with lexers. A lexer converts the plain text input into a stream of tagged pieces called tokens for the parser to consume. For example, a text code line such as `let a = 5;` would get converted into token stream similar to the following:

```
'let' token {position...}
identifier 'a' {position ...}
assignment operator {position ...}
raw integer {position ... , value = 5 }
'semicolon' token {position ...}
```

Additionally, parsers are useful when we want to create a custom configuration language or store some custom data structure as a plain text file. They help with converting in-memory representations of data to and from text files, as well as validating the input given, and thus can show users when they have made an error.

As an example, imagine you’re developing a game and want to set various character parameters via configuration files for testing purposes. You also plan to extend this functionality so users can customize their characters to some extent via these config files as well.

For this, you might consider using JSON, a well-supported format that you can store easily — but it’ll be tedious for you and your users to write it by hand and match all the curly braces.

Alternatively, you can use some simpler format such as YAML, which would be much simpler to write and read. However, now you have to add another dependency for parsing YAML, and even when you are not using the full feature set of YAML standard, you have to ship its whole parser along with your game. 

While this example is a little contrived, writing custom parsers is a fitting solution when you need to have some plain text representation specific to your needs and domain, and when more general options such as JSON or YAML might not fit those requirements well.

Another benefit of having a custom parser is the “[parse don’t validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)” ideology. Imagine that your configuration language looks something like this :

```
name: Rincewind
class: wizard
item_randomess: Very High
```

Here, if we use YAML or JSON, values for all three would be of `string` type. However, for our configurations, we need some more restrictions: while the name can be any string, the class must be `Wizard`, `Dwarf`, and `Human`; any other value is considered invalid. We also require that the `item_randomness` must be `very low`, `low`, `medium`, `high`, or `very high`. 

When using YAML or JSON, after converting the input, we would again need to do a check to make sure these restrictions are enforced. However, if we use a custom parser, we can catch the invalid values while we are parsing, and mark any errors right away. This provides users more context regarding the error and saves us from writing separate validations.

## What are parser generators?

We can write a parser from scratch to parse our configuration format. It can even be fun to do so:


- We can split the input at newlines, then further split each line with colon
- Then, we can try to figure out the keys and their corresponding values
- After, we can make sure the values are valid and create an object from the given values

Such handwritten parsers can be quite powerful and allow us to implement complex constraints and checks for our configuration language. If you want to do it that way, check out the famous recursive-descent parsing technique, which is used by many popular language parsers such as rust.

That said, writing such parsers can be tedious, and potentially error-prone. You might need to write a lot of code by yourself to get even basic quality-of-life features like error reporting and location. Also, you will need to spend some time on optimizing your parser if needed.

An alternative to this is using parser generators. These libraries allow us to write the rules for our parsers. The parser generator will then create a parser using those rules. Benefits of parser generators include that they usually come with built-in error reporting and helpful error messages, and the parser definitions can be much easier to maintain.

Of course, like anything else in development, there are some tradeoffs:


- You will need to add a library as a dependency and hope that it is well-maintained
- You will need to express your constraints in the format the library needs
- Sometimes, the library might not be expressive enough to provide all of your constraints, so you may need another validation step after the parsing

That said, using parsing generator libraries are still usually a much better option than creating a custom parser. They require us to write less code, they usually do better with optimizations, and the parsers are easier to maintain. To see this in action, we’ll explore three libraries: Peggy, Ohm, and Chevrotain.

Let the parsing begin!

## A brief regular expression refresher

Regular expressions provide us with a concise way for denoting patterns. These originated from the formal definition of regular languages and are used in other contexts as well. Much of the regex syntax is used to define patterns in parsers, so let’s see a short note on commonly used syntax:


- `+` — Used to denote a repetition with at least one occurrence of the term. For example, `a+` indicates `a`, `aa`, `aaa` and so on, but not an empty string
- `*` — Similar to `+` but allows no occurrences instead of requiring at least one. So, `a*` can indicate an empty string as well as `a`, `aa`, and so on
- `?` — Used to denote at the most one occurrence of a term, so `a?` indicates an empty string or `a`, but not `aa` or `aaa` and so on

These three symbols are commonly used. Understanding these should be enough to understand the examples in this post.

### Peggy

The Peggy JavaScript parser generator library allows us to write our configuration grammar rules into a file. It provides a CLI to convert those into a parser module. 

We can also dynamically generate parsers using Peggy. However, it’s slower and not recommended for most use cases. You can use [their playground](https://peggyjs.org/online.html) as well to experiment with the below example.

A Peggy grammar file contains the grammar rules and corresponding actions to take when a rule matches. At the start of the grammar definitions, we can also specify the global and per-parse initializers.

Code specified in the global initializer using `{{ … }}` will be run exactly once, when the parser is first imported. This is useful for importing functions from other modules and declaring constants or helper functions. For example, we can use this to import the character class enum that might be defined in some other file.  

Per-parse initializers using `{ … }` will be run at the start of each parse, and can be useful to declare the variables used in a single parse. We will use the per-parse initializer to declare our config object as shown below:

```
{{
  // const characterClass = require('../character.js');
}}
{
  const config = {};
}
```

Now this config object will be available to all the actions and predicates (explained below) and will be reset at the start of each parse.

Next, we will declare some helper rules in Peggy:

```
RuleName "helper info" = rule expression/pattern { action }
```

We start a rule with its name, such as `CharacterName` or `CharacterClass`. Then, we optionally provide some helper information in a string that will be displayed in error messages. For example, you can write out an explanation of the rule to help users. 

After, we have an equal sign followed by the rule expression or the pattern to be matched. Finally, we have an action, or the JavaScript code that will be run when the rule pattern matches. The return value of this code block will be the output of the rule. 

Including an action is optional, so you can skip it. If no action is specified, the output of the rule is array of outputs of individual parts of the rule expression.

We can also specify a predicate between the pattern and the action by using the following:


- `& { … }` — The `&` predicate, which is called a positive predicate. The rule match will succeed only if the predicate returns `true`, otherwise, the rule will be ignored and parsing will try some other rule
- `! { … }` — The `!` predicate, which is called a negative predicate. the rule will matches only if it returns `false`

These can be used to further constraint the rule dynamically, where the constraints cannot be expressed as a fixed pattern, but must be checked using some additional code:

```
Class = "Wizard"i / "Dwarf"i / "Human"i
RndVal = "very low"i / "low"i / "medium"i / "high"i / "very high"i
_ "whitespace" = [ \t\n\r]*
```

In the code above, we define three helper rules: `Class`, `RndVal`, and `_`. 

`Class` will match `wizard` OR `dwarf` OR `human` strings. The `/` here signifies that the first match will be accepted, and it will check the pattern (in this, case strings) one by one in order. The `i` indicates that the string match should be done in case-insensitive way. 

`RndVal` will also match one of its given strings: `very low`, `low`, `medium`, `high`, or `very high`. It uses the `/` and `i` symbols the same way the `Class` rule does.

The whitespace rule is named `_` for ease of use. It will match a blank space, a tab, a newline, or a carriage return, zero or more times.

Now we can declare a rule to parse the character name:

```js
CharacterName "Name" = "name"i _? ":" _? val:$[a-zA-Z]+{
 config.name = val;
}
```

This defines the rule as starting with a match of string `name`, then optionally some space, then a colon, then again some optional space, and finally, a string containing letters `a-z` or `A-Z` one or more times. 

This string will be given to the action block as a variable named `val` which is indicated using `val:` before the pattern. The `$` symbol indicates that the `val` should have the whole matching string and not a list of individual characters matched by the `+` symbol. In the action, we set the config’s name field to the actual value.

We can similarly define the `CharacterClass` rule like so:

```js
CharacterClass = "class"i _? ":" _? cls:Class {
  // config.class = characterClass[cls]; // use enum imported in global initializer
  config.class = cls
}
```

The rule will start matching with the case-insensitive string `class`, then some optional white space, a colon, another optional white space, and finally, match the value using the `Class` rule we defined earlier. In case input doesn’t match, it will show it as an error.

Then we can define the `ItemRandom` rule:

```js
ItemRandom = "item_randomness"i _? ":" _? rand:RndVal {
    let temp =  rand.toLowerCase();
    let bounds = {
    "very low"  : [ 0.05 , 0.2 ],
    "low"       : [ 0.2 , 0.4 ],
    "medium"    : [ 0.4 , 0.6 ],
    "high"      : [ 0.6 , 0.8 ],
    "very high" : [ 0.8 , 1 ]
    }[temp];
    let r = Math.random();
    config.itemRand = bounds[0]+(bounds[1]-bounds[0])*r
}
```

Here, we start the rule with an `item_randomness` key and the whitespace-colon-whitespace combination. Then, we match our `RndVal` definition. 

In the action, we convert the matched string to lowercase and use an object as a map to find the appropriate bounds for the random value. Then, we get a random value between the given bounds and set it as the `itemRand` key in the config.

Finally we can define our top-level config definition like so:

```
Config = CharacterName / CharacterClass / ItemRandom
```

Now if you try it on our example config from start, it will match only one key before showing an error:

```
unexpected newline found.
```

That’s because the `/` symbol will match the first rule that matches once and then stop. If we want to consume the whole input, we need to repeat the process. Our input is essentially a list of these three rules delimited by white spaces and newlines. So, we can instead define it like so:

```
Config = (CharacterName / CharacterClass / ItemRandom)|.., _ | {return config}
```

The above defines the `Config` as a list of zero or more character name, character class, or item randomness rules delimited by the whitespace rule. In its action we return the config object.

The list format for list is `pattern |.. , separator| {action}`, where `..` indicates unbounded repetition and `separator` is the separator between the items (the whitespace `_` rule).

Now this will match the multi-line example config. We could go further by using the `error` function provided by library to create parsing errors — for example, when we define same parameter twice — but we’ll leave this exercise up to you for the purposes of this tutorial.

To convert this into a parser module, save the grammar definition into a file with a clear name — for example, `grammar.pegjs` — and then run the command below:

```bash
npx peggy grammar.pegjs
```

This will generate a file named `grammar.js`. You can then import and use it like so:

```js
    const parser = require('grammar.js');
    parser.parse("config string");
```

You can explore [the Peggy docs](https://peggyjs.org/documentation.html) if you’re interested in exploring the library in more detail.

### Ohm

Ohm is another parser generator you can use to create parsers in JavaScript. Like Peggy, Ohm provides a [playground](https://ohmjs.org/editor) where you can explore the parsers.

The general format for parsing rules in Ohm looks like so:

```
Rule name 
  = Rule expression
```

We can also provide the expression on the same line as rule name, but for readability we’ll use the above format.

There are two important differences between Peggy parser definitions and Ohm parser definitions:


- The rule name’s letter casing decides the parsing behavior in Ohm. For example, `characterName` and `CharacterName` do not have the same parsing behavior. We will explore this in more detail below
- Actions (semantics) and parsing (syntax) are separated. Instead of defining the actions with the rule pattern, we specify them separately

If the rule name begins with a capital letter, such as `CharacterName`, then all space characters — spaces, tabs, newlines, etc. — are automatically skipped and cannot be matched in the rule pattern. 

That also means you can’t separate parts of inputs based on spaces or newlines and have general character matching without a fixed pattern, as we do here for `name`. We can’t use such rules because the space will always be skipped and the rule would keep consuming inputs. These are called syntactic rules.

Alternatively, if the rule name begins with a lowercase letter, such as `characterClass`, then spaces are not skipped. They just need to be explicitly defined in the rule definition. These are called lexical rules.

At the top level of our grammar definition, we define the grammar name:

```js
ConfigGrammar{
...
}
```

Then, inside the curly braces, we define its rules:

```
Config
        = ListOf< ConfigKey, "">
ConfigKey
        = characterName | CharacterClass | ItemRand
```

The first rule is the default and will be used to parse the input. We define the default rule `Config` as list of `ConfigKeys` separated by empty strings. This is because it’s a semantic rule, so it will ignore spaces and newlines between multiple `ConfigKeys` automatically. 

`ListOf` is an inbuilt rule useful for defining lists, while `ConfigKey` is one of `characterName`, `CharacterClass`, or `ItemRand`.

We define `characterName` as a lexical rule, because if we ignore spaces here and use syntactic rule, the `letter+` part will keep consuming characters until it finds a non-letter character. It would end up consuming part of next config key, which we don’t want. 

Thus, we define it as starting with the string `"name"`, followed by `spaces`, then `":"`, followed by `spaces` again, and finally, one or more letters:
 
```
characterName
    = "name" spaces ":" spaces letter+
```

`spaces` is an inbuilt rule which matches zero or more space characters such as space, tabs, newlines, etc. The `letter+` will consume all letters of names but will stop at a space or newline.
 
Next, we define `CharacterClass` as starting with the string `"class"`, followed by a `":"`, and then the `class` rule. Note that because this is a semantic rule, we don’t have to explicitly define spaces — the rule will automatically ignore them:

```
CharacterClass
    = "class" ":"  class
```

The `class` rule is defined as either `caseInsensitive<"Wizard">`, `caseInsensitive<"Dwarf">` or `caseInsensitive<"Human">`. `caseInsensitive` is an inbuilt rule, which allows for case-insensitive value matching:

```
class
  = caseInsensitive<"Wizard"> 
    | caseInsensitive<"Dwarf"> 
    | caseInsensitive<"Human">
```

Similarly we define `ItemRand` as `"item_randomness"` followed by a `":"` and `randomness` values:

```
ItemRand
        = "item_randomness" ":" randomness
randomness
        = caseInsensitive<"very low"> 
        | caseInsensitive<"low"> 
        | caseInsensitive<"medium"> 
        | caseInsensitive<"high"> 
        | caseInsensitive<"very high">
```

We can use this like so:

```js
const ohm = require('ohm-js');
const configGrammar = ohm.grammar(String.raw`
<GRAMMAR-HERE>
`);
const userInput = "<USER_CONFIG>";
const m = configGrammar.match(userInput.trim());
console.log(m.succeeded());
```

Ohm separates grammar parsing from grammar semantics. So, if we want to create the config object from the parsed grammar, we need to create a `semantics` object and use that as demonstrated below.

We start by creating `semantics` object from the grammar:

```js
const semantics = configGrammar.createSemantics();
```

Then, we define an operation that we can use to process the given string. Here, we will call it `"parse"`, but it can be named anything. Note that this will also be the name of the method that will get added to the semantic object:

```js
semantics.addOperation("parse", {...});
```

The second parameter passed here is an object, which should have a function for each of our non-terminal rules — that is, rules that aren’t just fixed strings and have sub-parts in them. These functions will take parameters according to the rule definition. Let’s see an example to make this less confusing.

At the top level, we have the `Config` rule, which — as we defined above — is a list of `ConfigKeys`. Thus, we will add the following in the object:

```js
Config(config) {
  const obj = {}; // the actual config object which we are creating
  for (const c of config.asIteration().children) {
    let v = c.parse(); //this calls 'parse' method,as that is the operation name given
    obj[v[0]] = v[1];
  }
  return obj;
},
```

Here, we get a single argument since the rule only has one part — the `ListOf` sub-rule. We convert it to an iterator using the `asIteration` method and iterate over all its children, which will be the individual `ConfigKey` rule matches. 

Then, we call `parse` on them and set the object keys according to their return values. Alternatively, we could have defined the object in a global/enclosing scope and directly used that in the sub-rules.

Now, because `ConfigKey` has exactly one child — one of `characterName | CharacterClass | ItemRand` — it will automatically invoke the parse function on those, and we don’t need to explicitly define it.

We then have to define `characterName` as follows. Note that the name case matches exactly with rule name:

```js
characterName(_1, _2, _3, _4, name) {
  return ["name", name.sourceString];
},
```

Here, the method takes five arguments, one for each `"name"`, space, `":"`, space, and actual name string in the rule pattern. In our case, we’re only concerned with the last one, and we use `sourceString` property on `name` to get the actual name string that matched.

Then, we’ll define `CharacterClass` like so:

```js
CharacterClass(_1, _2, cls) {
  return ["class", cls.sourceString.toLowerCase()];
},
```

We ignore the `"class"` and `":"` parameters and use the actual matched string.

Similarly we define `item_randomness` like so, keeping the randomness calculation the same as before:

```js
ItemRand(_1, _2, r) {
  let temp = r.sourceString.toLowerCase();
  let bounds = {
    "very low": [0.05, 0.2],
    low: [0.2, 0.4],
    medium: [0.4, 0.6],
    high: [0.6, 0.8],
    "very high": [0.8, 1],
  }[temp];
  let rand = Math.random();
  return ["itemRand", bounds[0] + (bounds[1] - bounds[0]) * rand];
},
```

If we used all of this like so:

```js
    console.log(semantics(m).parse());
```

We would get the following:

```
{ name: 'Rincewind', class: 'wizard', itemRand: 0.87 }
```

You can check out more about [Ohm in its GitHub repo](https://github.com/ohmjs/ohm), which includes its syntax and API docs, along with several detailed commented examples.

### Chevrotain

Chevrotain is another parser generator library. It's more hands-on in the sense that we need to define our own tokens and parsing rules directly in JavaScript instead of using a grammar definition language like with the previous two libraries. 

In Chevrotain, we define our lexer and parser, then provide the rules and corresponding actions for those rules. Let’s see how we can define the same parser using Chevrotain. Note that we’re using a `.mjs` file to use module capabilities instead of a plain `.js` file.

First, we’ll import the required functions and definitions:

```js
import { createToken, Lexer, EmbeddedActionsParser } from "chevrotain";
```

Then, we define tokens for our lexer as demonstrated below:

```js
const nameKey = createToken({ name: "nameKey", pattern: /name/ });
const classKey = createToken({ name: "classKey", pattern: /class/ });
const irandKey = createToken({ name: "irandKey", pattern: /item_randomness/ });
const colon = createToken({ name: "colon", pattern: /:/ });
const whiteSpace = createToken({name: "WhiteSpace",pattern: /\s+/,group: Lexer.SKIPPED,});
const nameString = createToken({ name: "nameString", pattern: /[a-zA-Z]+/ });
const classString = createToken({name: "classString",pattern: /human|dwarf|wizard/i,});
const irandString = createToken({name: "randString",pattern: /very low|low|medium|high|very high/i,});
```

Here, we define each of the valid tokens in our config language using the `createToken` function. It takes an object with the token name and a regex pattern to match. We also specify the group of the `whiteSpace` token as `SKIPPED`, so the lexer will automatically skip these and not forward these to our parser.

After, we define our lexer and pass the token list to it:

```js
const allTokens = [ nameKey, classKey, classString, irandKey, irandString, whiteSpace,
  colon, nameString ];
const lexer = new Lexer(allTokens);
```

Chevrotain uses class based parsers, so to implement our parser, we have to create a class extending the base parser class. 

With Chevrotain, you can either embed action in the parser (similar to Peggy) or separate the parsing and actions (similar to Ohm). Here, for simplicity, we will embed the actions into the parser itself, and thus use the `EmbeddedActionsParser` base class:

```js
class ConfigParser extends EmbeddedActionsParser {
  constructor() {
    super(allTokens);
    ....
  }
}
```

We only need to implement the constructor, as the parser rule definitions are to be defined in the constructor. After calling `super`, we can define our top-level rule of `Config`. Note that the use of the `$` symbol is a convention defined in Chevrotain’s examples:

```js
...
const $ = this;
$.RULE("config", () => {
  return $.SUBRULE($.configKeys);
});
...
```

Here, we define the rule using the `RULE` function, which takes the rule name as its first argument and a callback function that’s used to define the rule parsing. 

We delegate the actual parsing to the sub-rule named `configKeys` using the `SUBRULE` function. Note that the name we provide as the first string parameter is also used as the actual function name for rules, such as `configKeys` here.

Then, we define the `configKeys` rule like so:

```js
$.RULE("configKeys", () => {
      let obj = {};
      $.MANY(() => {
        $.OR([
        {ALT: () => {obj.name = $.SUBRULE($.characterName);},},
        {ALT: () => {obj.class = $.SUBRULE($.characterClass);},},
        {ALT: () => {obj.item_randomness = $.SUBRULE($.itemRandomness);},},
        ]);
      });
      return obj;
    });
```

The rule is defined using `MANY` and `OR` functions. `MANY` takes a single rule parsing function, and expects zero or more matches of that rule. The `OR` takes an array of rules, and accepts first one to match, evaluating in the order given.

In each rule we invoke sub-rules for `characterName` ,`characterClass`, and `itemRandomness`, assigning their `return` values to the corresponding fields, and finally returning the object.

We then define those individual rules like so:

```js
$.RULE("characterName", () => {
  $.CONSUME(nameKey);
  $.CONSUME(colon);
  let name = $.CONSUME(nameString).image;
  return name;
});
```

The `CONSUME` function expects the given token. If the token is not found, it throws an error. Here, in the rule, we first consume the `nameKey` token, then consume the `colon` token, and finally consume the `nameString` token. 

The `image` field of the `return` value of `CONSUME` contains the actual string that matched. Since this is what we want here, we return it.

The other two rules are also defined similarly:

```js
 $.RULE("characterClass", () => {
  $.CONSUME(classKey);
  $.CONSUME(colon);
  let cls = $.CONSUME(classString).image.toLowerCase();
  return cls;
});
$.RULE("itemRandomness", () => {
  $.CONSUME(irandKey);
  $.CONSUME(colon);
  let temp = $.CONSUME(irandString).image.toLowerCase();
  let bounds = {
    "very low": [0.05, 0.2],
    low: [0.2, 0.4],
    medium: [0.4, 0.6],
    high: [0.6, 0.8],
    "very high": [0.8, 1],
  }[temp];
  let rand = Math.random();
  return $.ACTION(() => bounds[0] + (bounds[1] - bounds[0]) * rand);
});
```

The more interesting part of this is the `return` value for `itemRandomness` rule. After calculating the actual random value like before, instead of just returning it, we call the `ACTION` function, pass the calculation to it, and return that.

This is because Chevrotain does an analysis and build pass using the defined rules when building the parser. To do so, it passes dummy tokens through the rules and uses those to determine the relationship between the rules. 

However, in that pass, the values returned by the `CONSUME` function are also dummy and don’t actually have the corresponding values (such as `very low`). Hence, the `bounds`  array is `undefined` and we get an error when we try to access the `0`th position.

There are two potential solutions for this issue:


- Define the actual processing (such as the random value calculation) separately from the parser rules, similar to Ohm
- Use the `ACTION` function, which does not run in analysis phase, but only in the actual parsing phase

We use the second approach for this example, as we are using the embedded actions parser. The `ACTION` takes a callback function and returns its return value, but runs only in the actual parsing phase.

Finally in the constructor, at the very end, we must add the following:

```js
this.performSelfAnalysis();
```
This is important, as it runs the analysis phase to make the parser more efficient and generates the required information for parsing.

We can then use this like so:

```js
const parser = new ConfigParser();
const lexResult = lexer.tokenize(
  "name: Rincewind\nclass: Wizard\nitem_randomness: very high\n",
);
parser.input = lexResult.tokens;
const value = parser.config();
console.log(value);
```
We create a new instance of our parser class, tokenize the input using the lexer, and set that as the input of the parser. Then, we call the `config` rule we defined and log the parsed value.

## Conclusion

In this post, we explored what parsers and why writing a custom parser using parser generator libraries can be a good idea for domain specific languages. To put this knowledge to practical use, we saw how to use three example parser generator libraries — Peggy, Ohm, and Chevrotain — to generate the parsers.

The code we explored in this tutorial is available in the [Github epository here](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/javascript-parser-generators). Thanks for reading!

