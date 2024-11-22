const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    const userExist = users.find((user) => user.username === username);
    return !userExist
}

const authenticatedUser = (username, password) => { //returns boolean
    const userExist = users.find((user) => user.username === username && user.password === password);
    return userExist;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization["username"] || {};
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Ensure the user is logged in
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to post a review" });
    }

    // Validate that the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty" });
    }

    // Find the book in the books database
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    book.reviews[username] = review;

    return res.status(201).json({ message: `The review for the book with ISBN ${isbn} has been added/updated` });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization["username"] || {};
    const isbn = req.params.isbn;

    // Ensure the user is logged in
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to post a review" });
    }

    // Find the book in the books database
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has left a review on the book
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "You have not posted a review for this book" });
    }

    // Delete the review
    delete book.reviews[username];

    console.log(books);

    return res.status(201).json({ message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
