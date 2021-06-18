require("dotenv").config();
const express = require("express");
const router = express.Router();
const postModel = require("../models/post");

//Login route
router.post("/find", async (req, res) => {
  postModel.findOne({ _id: req.body._id }, (err, data) => {
    if (!data) {
      res.status(401).json({
        message: "Post doesn't exist.",
      });
    } else {
      res.status(200).json({
        message: "Post found.",
        post: data,
      });
    }
  });
});

//Register route
router.post("/add", async (req, res) => {
  console.log(req.body);

  let newPost = new postModel({
    title: req.body.title,
    content: req.body.content,
    date: req.body.date,
  });

  newPost.save((err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.json({
      message: "Everything OK",
    });
  });
});

//All posts route
router.get("/all", async (req, res) => {
  postModel.find({}, (err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      message: "Retrieved all posts",
      posts: data,
    });
  });
});

//Update post route
router.post("/update", async (req, res) => {
  console.log(req.body);

  postModel.findOneAndUpdate(
    { _id: req.body._id },
    {
      title: req.body.title,
      content: req.body.content,
      date: req.body.date,
    },
    (err, data) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.json({
        data,
      });
    }
  );
});

//Delete route
router.post("/delete", async (req, res) => {
  postModel.deleteOne({ _id: req.body._id }, function (err) {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
    } else {
      res.status(200).json({
        message: "Deleted",
      });
    }
  });
});

module.exports = router;
