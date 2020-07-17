const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
const { errors, isValid } = validateRegisterInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {

      let book1 = {
        id: "We21AwAAQBAJ",
        title: "Principles and Practice Using C++",
        author: "Bjarne Stroustrup",
        description: "An Introduction to Programming by the Inventor of C++ Preparation for Programming in the Real World The book assumes that you aim eventually to write non-trivial programs, whether for work in software development or in some other technical field ...",
        img: "http://books.google.com/books/content?id=We21AwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
      };
      let book2 = {
        id: "yQRErgEACAAJ",
        title: "Grokking Algorithms",
        description: "Summary Grokking Algorithms is a fully illustrated, friendly guide that teaches you how to apply common algorithms to the practical problems you face every day as a programmer. You'll start with sorting and searching and, as you build up your ...",
        img: "http://books.google.com/books/content?id=We21AwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
      };
      let book3 = {
        id: "PXa2bby0oQ0C",
        title: "JavaScript: The Good Parts",
        description: "Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad, having been developed and released in a hurry before it could be refined. This authoritative book scrapes away these bad features to reveal ...",
        img: "http://books.google.com/books/content?id=PXa2bby0oQ0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
      };
      book1 = JSON.stringify(book1);
      book2 = JSON.stringify(book2);
      book3 = JSON.stringify(book3);

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        //bookList: [book1, book2, book3]
        bookList: []
      });
      newUser.bookList.push(book1);
      newUser.bookList.push(book2);
      newUser.bookList.push(book3);
// Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
const { errors, isValid } = validateLoginInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
const email = req.body.email;
  const password = req.body.password;
// Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
// Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          email: user.email
        };
// Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});
//add the book as a json string..
router.post("/addBook", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        return res.status(400);
      } else {
        console.log(req.body.book);
        user.bookList.push(req.body.book);
        user.save();
        return res.status(200).json({success: {booklist: user.bookList}});
        //or just retun success status
        //return res.status(200).json({success: "Book Added"});
      }
    });
})
router.post("/getBookList", (req, res) => {
  User.findOne({ email: req.body.email  }).then(user => {
      if (!user) {
        return res.status(400);
      } else {
        for(let i=0; i < user.bookList.length; i++){
          user.bookList[i] = JSON.parse(user.bookList[i])
        }
        return res.status(200).json({booklist: user.bookList});
      }
    });
})
module.exports = router;
