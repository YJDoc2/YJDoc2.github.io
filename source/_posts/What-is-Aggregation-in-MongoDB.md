---
title: What is Aggregation in MongoDB
date: 2020-12-10
tags: [tutorial, mongodb]
---

Recently I came across the Aggregation facility of MongoDB for the first time, and it was a bit hard to understand for me... So, I decided to write this, to help others, as well as understanding more while writing this.

## Prelude

In case you know what is MongoDB and Joins in SQL, you can skip this and go to next section.

SQL databases, like MySQL,PostgresSQL, are databases which store data in a spreadsheet like format, where a table has a column for attributes and each row signifies a single record.

On the other hand No-SQL databases like MongoDB store data in form of documents, where a single document signifies one entry.

### Joins
When we have to reference one table from another table, we use the concept of foreign key in SQL databases. For example consider a simplified case of a library database where one person can borrow only one book at a time and each book has a single author.

One has to store records of user, and books. If we have to store which person has borrowed which book, we can add a column in users table, and store the ID of the borrowed book in that table. This is called as the foreign key. Now consider if we have to search for all people who had borrowed books by a specific author, one way to do it would be telling the DB - check the borrowed books column in person, join the record from book table, where the IDs match, and the select all the records where the author name field is the required name.

Now consider same case in No-SQL database. Each person will have a field that will somehow reference the books, and when querying we will ask the DB to somehow 'join' the documents and select the documents according to some condition. This is where aggregation comes in.

## Basic Schema

The basic schema of Books will be somewhat like this :

```javascript
Book{
     _id : ObjectId,
     // name, price, publisher etc.
     Author : String,
     // Some other data
};
```

Similarly the schema for User will be :

```javascript
User{
     _id : ObjectId,
     // Some data
     BorrowedBook : {
          type : ObjectId,
          ref : Book
     }
     // Some more data
}
```

Here we set the BorrowedBook field to have the type of ObjectId, which is a reference to the Book Schema. 

## Aggregate

The MongoDB defines aggregation pipeline, which allows us to do many things, along with doing join-like operations. This takes an array of various operations to be carries out,which will be evaluated on the documents, and return the result. These are carried out in pipeline , which means, each operation is done one after the other, and operations can be used to transform the data (lookup, unwind) , filter the data (match) or combine the data (sum,avg).

The syntax would be (Using Mongoose) : 

```javascript
User.aggregate([operations],options);
```

For our original case, for finding the books, we would use the lookup operation. The syntax of lookup is :


```javascript
lookup:
     {
       from: <collection to join>,
       localField: <field from the input documents>,
       foreignField: <field from the documents of the "from" collection>,
       as: <output array field>
     }
```

The fields are :

- from : the ref collection in our schema. This is where we will look for the attribute stored in out User.
- localField : the field in the collection on which we are using the aggregate method. In our case this is User collection's BorrowedBook
- foreignField : Name of field in the other collections. In our case it is _id.
- as : This will the new field created in the results of this operation, storing the result of the query. 

As there is possibility that the field can match multiple documents in other collection (It may or may not be unique, as far as the general execution is considered), the result is stored in an array. So now we need to convert this array to a single field. For this unwind is used :

```javascript
{ unwind: <field name> }
```

This will create a new document for each value in array, with the array field now containing only that single value. This is done only for the aggregation and not stored in database. For example,

```javascript
{
name : 'abc',
numbers : [1,2,3]
}
```

Here using unwind on numbers field will create :


```javascript
{name : 'abc', numbers:1},{name : 'abc', numbers:2},{name : 'abc', numbers:3}
```

And After this we need to match the books which have the specific author name we  are looking for, for which we can use match :


```javascript
{ match: { <query> } }
```

This will filter out the created documents, and provide only the ones which match the query to the next stage. So now our final query will be :


```javascript
User.aggregate([
{lookup:{
     from:Book,
     localField:BorrowedBook,
     foreignField:_id,
     as:book}
     }
}, // stage 1
{unwind : book}, // stage 2
{match : {book.author:"required author"}} // stage 3
]);
```
This will give us the list of users who have borrowed a book written by a specific author.

# Other usage
Aggregate pipeline can be used in various ways. With various options to combine, this provides a powerful way for transforming , filtering and collecting data. Some of other stages and options provided are :

- skip : skip the first n documents, and app the rest to next stage
- set : can be used to set/create new fields in the documents, or overwrite the existing fields in the document.
- sort : sort the data in specific order according to specific fields
- sample :randomly select n documents from input as the output
- project : allows to pass specific fields only of documents to next stage.

More detailed explanation with examples can be found on the MongoDB docs : 
- stages : [https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/)
- operators : [https://docs.mongodb.com/manual/reference/operator/aggregation/](https://docs.mongodb.com/manual/reference/operator/aggregation/)

Thank you!
