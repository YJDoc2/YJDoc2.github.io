---
title: Exploring test-driven development methods in Deno
date: 2022-10-26
tags: [javascript, tutorial]
logrocket: https://blog.logrocket.com/test-driven-development-methods-deno/
categories: logrocket
---

You might have heard the term “test-driven development” somewhere, or you might be interested in knowing how you can make your code more reliable by writing tests. 

This article will explain what test-driven development (TDD) means, when it can be used, and how we can use Deno’s inbuilt testing API to write tests, which can help us make our code more reliable. We will also see how we can port existing tests written using libraries like Chai or Mocha into Deno.

Particularly, in this article, we will see :

- What is test-driven development?
- Exploring various types of testing
-  types of testing
    - Unit tests
    - Integration tests
- When to use TDD
- A brief introduction to Deno
- Basic Deno testing using inbuilt API
- Step-by-step testing in Deno
- Behavior-driven testing in Deno
- Getting coverage information from Deno
- Using external libraries like Chai or Mocha for testing
- Conclusion

As a note, you will need to be comfortable reading and writing basic JavaScript code. This includes variable and function declarations,  basic scoping properties, and importing/exporting stuff. A bit of familiarity with Deno is helpful, but not required, to read this guide.

If you are already familiar with the concept of test-driven development, you can jump straight to our sections on Deno testing. Otherwise, let’s start with an introduction to test-driven development, types of testing, and when to use TDD.

## What is test-driven development?

Imagine you have a great idea for the next billion-dollar startup. To make it a reality, you have to write some code, and make it work — simple! You start by writing some code, running it, seeing what it does, fixing some bugs, and then again writing some more code, and on and on and on.

In the beginning, this approach is great. You are producing some working code, getting a step closer to the billion dollars, and all is going well. But as your code size grows and more features get added, you start running into some problems. 

Sometimes, when adding a new feature, you accidentally break something existing. Since your product is now becoming increasingly complex, it is hard to make sure you are checking every possible scenario to make sure nothing is broken.

You might keep a list of things to look out for, a list of dependencies, so you know which changes might potentially affect what part of your code. But again, this becomes tedious to do manually, and as the features grow, keeping it updated and making sure you’re ticking everything each time itself becomes a bit chore. 

That’s exactly where testing comes in.

You can write tests to ensure that every possible scenario is getting run and that they are all working out as expected in your code. Using a simple command, you can run these tests in a fraction of the time that it would have taken to do all of them manually. 

Since you can write a test once, then run it each time, you can be sure that no item from the list is accidentally skipped.

Test-driven development (TDD) takes this even further. One way to think about how TDD works is like this:

You start the development process by writing a test, even before implementing a feature. The test should check that the new feature works as intended across multiple inputs. Naturally, as the implementation does not exist yet, the test will fail. Then, you should write just enough code to make the test pass.

So when you want to add a new feature to your project — say, a user sign-up function — you will first think of what possible inputs the feature might come across. Then, you will write the tests to check that those inputs give expected outputs, such as: 

- An error if the name input is empty
- Another error if the name input is longer than your accepted limit
- A test to make sure that non-Latin Unicode characters are handled correctly
- One more test to see if a new user gets created when all inputs are right

Of course, the sign-up function itself does not exist yet, so these tests will not do anything right now. But in the process of writing these tests, you have identified various cases your code needs to handle, and now you have the tests to make sure your code handles those cases once it is written. 

Your next step is to write just enough code to pass these tests. That way, you will not write excess code that might be kept unnecessarily and forgotten, never used.

Because of the tests, whenever you add some changes to a new feature, you can be sure that it does not accidentally break your existing code. Additionally, because you are always writing the tests before the code, you can make sure that there are always tests to check that the added code works as intended!

Further, you can add various steps in your CI to make sure these tests are run on each pull request, and that requests and changes are accepted only if the tests pass. That way, you can be sure that the main branch of your project is always working correctly for known inputs and conditions.

## Exploring various types of testing

Given the diverse nature of code, there are equally diverse ways of testing that code. Each testing method helps to make sure the code is working in different ways. Consider the different use cases for unit and integration testing, for example.

Tests that focus on small individual parts of code that make up the whole application are classified as unit tests. Other tests can also consider the application as a whole and make sure those parts are working together correctly. These are classified as integration tests.

### Unit tests

As the name says, unit tests focus on the individual, small units of the code that make up the complete application. These tests check that for a given input, the individual unit produces the correct output. 

For example, a unit test can check that a sign-up function that creates and stores a user in a DB is giving an error if an empty string is passed as the name. You can go even smaller and write unit tests to make sure that after calling the `create` function, the users are indeed getting stored in the DB with the correct values.

You can have multiple tests, each checking individual, small units of the code — even multiple tests for the same units, testing various edge conditions. With TDD, writing these can help you chalk out which individual elements are needed and how they are expected to function for various inputs.

Unit tests will make sure that each individual part of the code is working as expected. However, the system as a whole might still produce incorrect results. 

Consider our sign-up function example. You may have checked that the sign-up function throws errors as needed and that the DB saves users correctly, but the application as a whole might fail to create new users. This could be because you have forgotten to set up the DB correctly at the start-up of the application.

Your tests for each individual unit will abstract away the rest of the parameters. For example, when testing the save function, you would set up the DB for each test and tear it down afterward. Although the test does not give any failure, the sign-up fails to work in the application itself because you haven’t set up the DB correctly in the actual application.

To make sure the application as a whole is working as expected, you will need integration tests.

### Integration tests

Integration tests treat your application as a whole, looking at the complete system to make sure that the individual smaller units fit together correctly. 

These tests do not focus on individual units, but instead, treat them as black boxes. They are only concerned with making sure that for the given input, the system as a whole is giving the appropriate output.

For example, consider the sign-up action from before. An integration test will not concern itself with whether there is a single function validating the input and creating the user, or multiple functions working together to do that. 

Instead, it will focus on making sure that after giving correct inputs to sign up, the user can log in later, while for an incorrect input, the attempt to log in gives an appropriate error such as `User does not exist` .

These tests are important for making sure that any changes in smaller units of code do not create unintended consequences in the experience of the application as a whole.

Then there are also other types of tests such as end-to-end testing, which involves running a complete copy of your application, including the frontend, the backend, the database, and anything else, in a controlled environment, to make sure that all moving parts of the system are working together as expected.

As you might have noticed, the lines between types of tests are a bit blurred. Depending on how the code is organized, what one application might consider integration tests might be unit tests for some other application, and what one might consider end-to-end tests, another might run in their integration test suite. 

The important point to note here is that to make sure that your application is working as expected, you need to test each individual part of it as well as the combination of all parts, on various levels of granularity.

Of course, like many things, testing applications is easier said than done, and TDD might not always be the best idea. Let’s see when using TDD is useful, and when it might not be.

## When to use TDD

Like any other technology, TDD is just another tool in a developer’s toolbelt. The developer must judge if it is a good thing to use for a problem and try not to saw a piece of wood using a hammer. 

We will now see some guidelines about when and where TDD might be useful, and cases in which it won’t.

As stated before, in TDD, we start with what we expect the code to do, write tests to make sure the code does what it is expected to do, and then write code to do the things. Naturally, if we have nice, fixed specifications and clear requirements for the code, it is easier to write the tests. 

In such cases, TDD is a really good choice, as it will help you make sure that the code is not only working as expected, but also keeps working as expected with any changes introduced.

On the other side, if the requirements from the code are not yet clear, or they keep changing, then using TDD might not be a good idea. 

### Why using TDD may not be useful with constantly changing requirements

Consider the sign-up function from before. In the beginning, you only expected the form to take the user’s email and password, verify them, report any errors, and create the user’s account. 

You then realized you should also add a username field, rather than generating one at random, so you made the appropriate changes and updated the tests. 

But then, you realized that each username must be unique, so you wrote another test to validate the rule that duplicate usernames are not permitted and give an error if the input matched an existing username. 

Later, the requirements changed; it was decided that multiple users can enter the same usernames, and you would just append a random hash after the duplicates internally to make them unique from your side. So, you updated the tests again.

But then there came a requirement to support external authentication such as OAuth, so now that code had to be written, and tests had to be updated again. 

As you might have noticed, writing tests for any of the above is not the challenge. The issue here is the constant changing of requirements, along with the architecture not being fixed yet. If the requirements were fixed from the start, you might spend considerably less time on writing and updating the tests.

This also adds another consideration; namely, when tests should be introduced. 

If we tried to add them at the very beginning, when the requirements are not fixed, they would need a lot of efforts to be kept updated. However, if the need for delivering the code outweighs the need to run tests, they might just be ignored and never run. 

On the other hand, if tests are introduced too late, the size of the project may already be quite large, meaning there would be a lot of tests to add. Because of the large project size, the team might miss some edge cases, and tests would require a lot of time and resources to be added, resulting in them being ignored in favor of writing actual working application code. 

It is a tricky business to maintain the balance of adding the tests early enough that the project is not too large, but late enough that the project’s specifications are, for the most part, clear and fixed.

In another case, the project may be very small, allowing you to comfortably and thoroughly trace all execution paths manually. Writing tests in such case might be more overhead than necessary. 

For such simple projects, it might be preferable to skip writing tests initially and instead introduce tests as the project grows to make sure everything is functioning as expected.

## A brief introduction to Deno

Deno is a Javascript runtime that is somewhat similar to Node js. In fact, the creator of Node even helped create Deno. Some features that set Deno apart from Node include:


- Same JS, different runtime
- Stricter security
- Top-level await
- TypeScript out of the box
- Consolidated modules

Let’s review these features in more detail.

Deno, just like Node, is a JavaScript runtime. Any valid JS code that does not need Node APIs will work on Deno just as it does in Node.

By default, the program run with Deno runs with the minimal permissions required in a sandbox-like environment. This means that by default, it cannot make any Internet requests, access filesystems, or run any background process without separate permissions, which must be given explicitly through flags when running a Deno program.

You can directly await at the top level in Deno, unlike in Node, whereas you need to use promises or immediately execute functions to write async code at the top level.

Deno can run TypeScript code without needing any intermediate transpiler like Babel to compile your TypeScript to JS first.

Finally, you can bid goodbye to `node_modules` in each individual projects! Deno caches the required modules in a single place and reuses them across projects.

In the next section, we will explore in depth how Deno supports testing natively; in other words, you don’t have to use external libraries to write and run tests. Let’s start by writing simple tests using Deno’s inbuilt testing API.

## Basic Deno testing using inbuilt API

We will start by writing some simple tests for an application that requires storing user data in a DB. That means there will be functions for adding, deleting, and updating users. For demo purposes, we will work with a mock DB using in-memory JS objects instead of an actual DB.

The first function we need is `fetchUsers`, which should fetch users based on their similarity to a given username. For our purposes, we simply want to fetch all users whose usernames contain the given string.

As per TDD, the cases we need to consider first are that our function should return:

- Appropriate users when a valid string is given
- Nothing if an empty string is given (as otherwise all users in the DB would be returned)
- An empty list if no matching user is found

We will start by importing the required modules in our test file:

```js
import { assertEqual } from 'https://deno.land/std/testing/asserts.ts';
import { fetchUsers } from './stubs.ts';
```

`assertEquals` is Deno’s inbuilt function used for assertions, somewhat like what Chai provides. `stubs.ts` contains all of our mock API functions.

After this, we can define our test by simply using the `test` API as follows:

```js
Deno.test('Testing user fetching',()=>{
    const name = 'testUser1';
    const users = fetchUsers(name);
    assertEquals(users.length,1);
})
```
We started by calling `Deno.test` to register the test to Deno’s runtime. We provided it with a descriptive name of  `Testing User fetching` to make it easier to recognize in test results, as well as to understand what it’s for when glancing through quickly.

Then, we gave our test an arrow function, which will actually call the function to be tested — in this case, `fetchUsers` — and verify that its output is as expected. In the function, we called `fetchUsers` with the `name` of `testUser1`. We expect it to return an array with single element, as only one of our mock users has a username containing that string.

Finally, we called `assertEquals` with actual (indicated by a `-` symbol) and expected (indicated by a `+` symbol) values. If they are not equal, the function will throw an `assertionError` and the test will fail.

When the test passes, the output should look like the following:

```bash
running 1 test from ./simple_test.ts
testing user fetching ... ok (7ms)

ok | 1 passed | 0 failed (30ms)
```

This shows which tests were run from which file, how much time each test took, how many passed, and how many failed.

If the test had failed — say, because the `fetchUsers` was implemented incorrectly or the mock database was populated incorrectly — and returned an empty array instead, we would have gotten output similar to this:

```bash
running 1 test from ./simple_test.ts
testing user fetching ... FAILED (9ms)

 ERRORS 

testing user fetching => ./simple_test.ts:6:6
error: AssertionError: Values are not equal:


    [Diff] Actual / Expected


-   0
+   1

  throw new AssertionError(message);
        ^
    at assertEquals (https://deno.land/std@0.155.0/testing/asserts.ts:184:9)
    at LogRocket-Blog-Code/tdd-in-deno/simple_test.ts:9:5

 FAILURES 

testing user fetching => ./simple_test.ts:6:6

FAILED | 0 passed | 1 failed (32ms)

error: Test failed
```

The output above shows that the test named `test user fetching` from file `./simple_test.ts` has failed, and the failure is due to `assertEquals` throwing `assertionError`; it got an actual value of `0` where it expected `1`. Thus, we can see what exactly differed, and we can try to reason what went wrong.

Similarly, we can define multiple tests. As noted before, we need to test for three conditions for testing our `fetchUsers` function. We can write one test per each case:

```js
Deno.test('return empty array on empty string',()=>{
    const users = fetchUsers('');
    assertEquals(users.length,0);
});
Deno.test('return all users matching given name',()=>{
    const users = fetchUsers('test');
    assertEquals(users.length,3);
    assertEquals(users[0].name,'testUser1');
    assertEquals(users[1].name,'testUser2');
    assertEquals(users[2].name,'testUser3');
});
Deno.test('return empty array on not matching name',()=>{
    const users = fetchUsers('abc');
    assertEquals(users.length,0);
})
```

Giving the tests descriptive names can help you quickly understand their purposes and expected outputs. When all three tests pass, you should see an output similar to the following:

```bash
running 3 tests from ./simple_test.ts
return empty array on empty string ... ok (5ms)
return all users matching given name ... ok (4ms)
return empty array on not matching name ... ok (4ms)

ok | 3 passed | 0 failed (36ms)
```

This approach allows us to write simple tests that do not have to perform multiple complex steps in order to run. Next, we will see how those tests can be written using Deno’s step feature in testing.

## Step-by-step testing in Deno

Splitting one test into several steps can be useful when you have to carry out multiple complex operations within a test and verify each operation’s results. 

In such a scenario, with tests written using a similar simple approach as before, one operation failing during the test would cause the test as whole to appear to fail. This would leave us scrambling to figure out the point at which the test failed using stack trace.

If we instead wrote each operation and its assertions as their own steps in a test, we could quickly check which particular one failed, as well as how that failure affected other steps.

Here we will consider a case where we want to update a user in a particular way: first fetching the user with given username, then updating some data and insert that as a new user in DB, and finally deleting the old user data from DB. 

Note that this is not the best practice for user updation, but will suffice for our demonstration of step-by-step testing.

To achieve this updation process, we must first fetch a user and assert that we have gotten expected results. Then, we must update the data and insert it in DB, asserting that a new user is stored. Finally, we must delete the old user object and check that the old user object does not exist.

Each function given as test function to `Deno.test` is given a test context parameter. Using those parameters, we can specify the steps in the test by calling `t.step` and giving it the step name and the actual step as a function:

```js
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { fetchUsers,insertUser,deleteUser, User } from './stubs.ts';

Deno.test('update User Name',async (t)=>{
    const name = 'testUser1';
    const newName = 'testUserUpdated';
    let user:User;
    
    await t.step('fetch user',()=>{
        const temp = fetchUsers(name);
        assertEquals(temp.length,1);
        assertEquals(temp[0].name,name);
        user = temp[0];
    });
    await t.step('update and store',()=>{
        const newUser:User = {
            ...user,
            name:newName,
        }
        insertUser(newUser);
        
        let temp = fetchUsers(newName);
        assertEquals(temp.length,1);
        assertEquals(temp[0].name,newName);
        assertEquals(temp[0].id,user.id);
        assertEquals(temp[0].password,user.password);
        temp = fetchUsers(name);
        assertEquals(temp.length,1);
        assertEquals(temp[0].name,name);
    });
    await t.step('delete old user data',()=>{
        deleteUser(user.name,user.id);
        let temp = fetchUsers(name);
        assertEquals(temp.length,0);
        temp = fetchUsers(newName);
        assertEquals(temp.length,1);
    })
})
```

Note that the `t.step` is an async function, and must be `await`ed before calling it for the next step. The above will produce a result similar to the below:

```bash
running 1 test from ./stepped_test.ts
update User Name ...
  fetch user ... ok (3ms)
  update and store ... ok (3ms)
  delete old user data ... ok (3ms)
update User Name ... ok (15ms)

ok | 1 passed (3 steps) | 0 failed (34ms)
```

Here, we can see that for the test file `stepped_test.ts`, one test is run, which had three steps, and each step passed.

## Behavior-driven testing in Deno

Deno also has a BDD module, which allows you to write tests in a way similar to libraries such as Chai or Mocha and provides hooks like `beforeEach` and `afterEach` .

To use the BDD API, first import it:

```js
import {describe,it,afterEach,beforeEach} from "https://deno.land/std@0.155.0/testing/bdd.ts";
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
```
Then we can write the tests similar to those libraries:

```js
import { fetchUsers,insertUser,deleteUser, User } from './stubs.ts';

describe('User DB operations testing',()=>{
    it('fetches correct user based on username',()=>{
        const user = fetchUsers('testUser');
        assertEquals(user.length,3);
    });
    it('inserts user correctly',()=>{
        const newUser:User ={
            name:'newTestUser',
            id:'newtestuser',
            password:'newtestuser'
        };
        insertUser(newUser);
        const user = fetchUsers('new');
        assertEquals(user.length,1);
        assertEquals(user[0].name, 'newTestUser');
    });
    it('deletes user correctly',()=>{
        deleteUser('newTestUser','newtestuser');
        const user = fetchUsers('test');
        assertEquals(user.length,3);
    })
});
```

The above code defines a test suite named `User DB operations testing` and performs three tests in that suite: fetching an user, inserting an user, and deleting an user.

We can also define some functions to be run before and after each of the test cases using `beforeEach` and `afterEach`, as well as functions to be run before and after all the tests using `beforeAll` and `afterAll`. These are useful for setting and resetting the state before and after each test. 

For example, we might want to reset a DB to blank after each test and populate it with known values before each test so we can control what data is seen by test. Another example is if the tests require some resource, such as a directory or certain files, you can create them using `beforeAll` and clean them using `afterAll`.

Here, we will see the usefulness of setting and resetting values in our mock setup. We have introduced an `InventoryObject`, which stores information about an item in the inventory, and to which user it belongs to. 

Unlike in previous tests, where we were directly operating on the user DB, in this scenario we want to first make the copy of the inventory DB using `getDefaultInventory` and then run the tests using that. 

For this purpose, we used `beforeEach` to get the state and set an internal variable to it, then set the variable to an empty array in the `afterEach`:

```js
describe("Inventory operations", () => {
  let inv:Array<InventoryObject>;
  beforeEach(()=>{
    inv = getDefaultInventory();
  });
  afterEach(()=>{
    inv = [];
  });
  it('inserts object into inventory',()=>{
    insertIntoInventory(inv,{
      ojbType:'book',
      name:'just Another book',
      id:4,
      owner:'testUser3'
    });
    assertEquals(inv.length,4);
    assertEquals(inv[3],{
      ojbType:'book',
      name:'just Another book',
      id:4,
      owner:'testUser3'
    });
  });
  
  it('deletes object from inventory',()=>{
    inv = deleteFromInventory(inv,3);
    assertEquals(inv.length,2);
    const defaultInv = getDefaultInventory();
    assertEquals(inv[0],defaultInv[0]);
    assertEquals(inv[1],defaultInv[1]);
  })

});
```
This covers two main ways of writing tests using Deno’s inbuilt API. Before seeing how we can use external libraries such as Chai or Mocha, we will first see how we can get code coverage information from the test directly from Deno.

## Getting coverage information from Deno

Deno provides a built-in way to generate code coverage information by running tests. To generate that information, we first have to write our tests, which ideally should cover all possible paths in the code. 

After that, we can simply run `deno test` and give it an additional flag:
```bash
--coverage=dir-name-to-store-info
```
Deno will then run the test and use the directory given to store the coverage information. Then we can run `deno coverage dir-name`, which prints out the code coverage info for each source file, such as the following:

```bash
cover LogRocket-Blog-Code/tdd-in-deno/stubs.ts ... 100.000% (65/65)
```
The printed result above shows that for the `stubs.ts` file, the tests have run each of the possible code line at least once; thus, the coverage is 100 percent.

In cases where some lines were never run in any test, Deno will also print those lines in the coverage information. For example, if we commented the fetch user test with an empty string, it will generate the following output:

```bash
cover LogRocket-Blog-Code/tdd-in-deno/stubs.ts ... 95.385% (62/65)
  54 |   if (name.length === 0) {
  55 |     return [];
  56 |   } else {
```
The printed result above tells us which lines of code were not executed in the tests. 

**Note** that we must delete the `coverage dir` before generating the coverage data again, as Deno does not delete this information by itself. If not deleted, the coverage information from previously run tests can get mixed up with current run, so the output given may not necessarily be correct.

## Using external libraries like Chai and Mocha for testing

So far, we have looked at how to write tests using Deno’s inbuilt API. But maybe you are used to writing tests using external libraries, or you are shifting a Node project to Deno that already has tests written in Chai and Mocha, which you would like to use as validations when porting the code. 

In such cases, Deno also allows using other libraries for testing without us needing to make many changes.

To use external libraries in Deno, we simply have to import them, just like Deno’s inbuilt testing modules. Note that the URL for importing Chai as shown below is different than one for Mocha:

```js
import chai from "https://cdn.skypack.dev/chai@4.3.4?dts";
import { describe, it } from "https://deno.land/x/deno_mocha/mod.ts";
const assert = chai.assert;
const expect = chai.expect;
```
With the ability to import libraries, we can write and run tests written using Chai and Mocha easily. See an example below:

```js
describe("User DB operations testing using chai/mocha", () => {
  it("fetches correct user based on username", () => {
    const user = fetchUsers("testUser");
    assert(user.length === 3);
  });
  
  it("inserts user correctly", () => {
    const newUser: User = {
      name: "newTestUser",
      id: "newtestuser",
      password: "newtestuser",
    };
    insertUser(newUser);
    const user = fetchUsers("new");
    expect(user).to.have.lengthOf(1);
    expect(user[0].name).to.be.a("string");
    expect(user[0].name).to.equal("newTestUser");
  });
  
  it("deletes user correctly", () => {
    deleteUser("newTestUser", "newtestuser");
    const user = fetchUsers("test");
    expect(user).to.have.lengthOf(3);
  });
});
```

These tests are run in the same way as other tests: by calling `deno test` .

## Conclusion

In this article, we have taken a high-level look at what test-driven development is and how it can be useful for a project. We have explored when using TDD can be beneficial and when it might not be so. 

In regards to Deno testing methods, we have seen how we can write and run tests using Deno’s built-in testing API, as well as how we can get code coverage information from Deno. We have also seen how we can use external libraries such as Chai or Mocha to run tests.

The code for this can be found in [this Github repo](https://github.com/YJDoc2/LogRocket-Blog-Code/tree/main/tdd-in-deno). Thank you for reading!

