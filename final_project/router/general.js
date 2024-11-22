const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Unable to register customer. Username and/or password not provided"});
    } else if (!isValid(username)) {
        return res.status(404).json({message: "Username already exists!"});
    } else {
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "Customer successfully registered. Now you can login"})
    }
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//     res.send(JSON.stringify({ books }, null, 4));
// });

public_users.get('/', async function (req, res) {
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Books not found"));
        }
    })
        .then((bookList) => {
            res.status(200).send(JSON.stringify({ books: bookList }, null, 4));
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//     const isbn = req.params.isbn;
//     let bookDetails = books[isbn];
//     res.send(JSON.stringify(bookDetails, null, 4));
// });

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        const bookDetails = books[isbn];
        if (bookDetails) {
            resolve(bookDetails);
        } else {
            reject(new Error("Book not found"));
        }
    })
        .then((bookDetails) => {
            res.status(200).send(JSON.stringify(bookDetails, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error.message });
        });
});



// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//     const author = req.params.author;
//     const bookKeys = Object.keys(books);

//     // Initialize an array to store matching books
//     let authorBooks = {"booksbyauthor": []};

//     // Iterate through the 'books' keys
//     for (let key of bookKeys) {
//         if (books[key].author === author) {
//             bookDetails = {
//                 "isbn": key,
//                 "title": books[key].title,
//                 "reviews": books[key].reviews
//             }
//             authorBooks["booksbyauthor"].push(bookDetails);
//         }
//     }
//     res.send(JSON.stringify(authorBooks, null, 4))
// });

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let authorBooks = { booksbyauthor: [] };

        for (let key of bookKeys) {
            if (books[key].author === author) {
                const bookDetails = {
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews,
                };
                authorBooks.booksbyauthor.push(bookDetails);
            }
        }

        if (authorBooks.booksbyauthor.length > 0) {
            resolve(authorBooks);
        } else {
            reject(new Error("No books found for the specified author"));
        }
    })
        .then((authorBooks) => {
            res.status(200).send(JSON.stringify(authorBooks, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error.message });
        });
});


// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//     const title = req.params.title;
//     const bookKeys = Object.keys(books);

//     // Initialize an array to store matching books
//     let titleBooks = {"booksbytitle": []};

//     // Iterate through the 'books' keys
//     for (let key of bookKeys) {
//         if (books[key].title === title) {
//             bookDetails = {
//                 "isbn": key,
//                 "author": books[key].author,
//                 "reviews": books[key].reviews
//             }
//             titleBooks["booksbytitle"].push(bookDetails);
//         }
//     }
//     res.send(JSON.stringify(titleBooks, null, 4))
// });

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let titleBooks = { booksbytitle: [] };

        for (let key of bookKeys) {
            if (books[key].title === title) {
                const bookDetails = {
                    isbn: key,
                    author: books[key].author,
                    reviews: books[key].reviews,
                };
                titleBooks.booksbytitle.push(bookDetails);
            }
        }

        if (titleBooks.booksbytitle.length > 0) {
            resolve(titleBooks);
        } else {
            reject(new Error("No books found for the specified title"));
        }
    })
        .then((titleBooks) => {
            res.status(200).send(JSON.stringify(titleBooks, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error.message });
        });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn].reviews, null, 4))
});

module.exports.general = public_users;
