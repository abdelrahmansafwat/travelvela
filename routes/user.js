require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const userModel = require("../models/user");
const { v4: uuidv4 } = require("uuid");

//Login route
router.post("/login", async (req, res) => {
  userModel.findOne({ email: req.body.email }, (err, data) => {
    if (!data) {
      res.status(401).json({
        message: "Email doesn't exist.",
      });
    } else {
      //validate password
      bcrypt.compare(req.body.password, data.password, (err, isValid) => {
        if (err) {
          res.status(500).json({
            message: "An error occured. Please try again.",
          });
          return;
        }
        if (!isValid) {
          res.status(401).json({
            message: "Wrong email/password.",
          });
          return;
        } else {
          const accessToken = jwt.sign(
            { email: data.email, privilege: data.privilege },
            process.env.JWT_SECRET
          );

          res.status(200).json({
            privilege: data.privilege,
            accessToken: accessToken,
          });
        }
      });
    }
  });
});

//Register route
router.post("/register", async (req, res) => {
  console.log(req.body);

  var exists = false;

  await userModel.find({ email: req.body.email }, function (err, docs) {
    //console.log("Checking if email exists...");
    if (docs.length) {
      exists = true;

      res.status(409).json({
        message: "Email already exists.",
      });
    }
  });

  if (!exists) {
    let newUser = new userModel({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
    });

    newUser.save((err, data) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.json({
        email: req.body.email,
        message: "Everything OK",
      });
    });
  }
});

//User information route
router.post("/information", async (req, res) => {
  console.log(req.body);

  userModel.findOne({ email: req.body.email }, (err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.json({
      data,
    });
  });
});

//All user information route
router.get("/all-information", async (req, res) => {
  userModel.find({}, (err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    dataWithoutPasswords = data.map((x) => _.omit(x, "password"));
    res.status(200).json({
      message: "Retrieved all users",
      users: dataWithoutPasswords,
    });
  });
});

//Wallet route
router.post("/wallet", async (req, res) => {
  console.log(req.body);

  userModel.findOne({ email: req.body.email }, "wallet", (err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.json({
      data,
    });
  });
});

//Update user route
router.post("/update", async (req, res) => {
  console.log(req.body);

  userModel.findOneAndUpdate(
    { _id: req.body._id },
    {
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      privilege: req.body.privilege,
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

//Forgot user password route
router.post("/forgot-password", async (req, res) => {
  console.log(req.body);

  userModel.findOneAndUpdate(
    { email: req.body.email },
    {
      forgotPasswordToken: { token: uuidv4(), expiration: Date.now },
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

//Forgot user password route
router.post("/forgot-password/update", async (req, res) => {
  console.log(req.body);

  userModel.findOneAndUpdate(
    { "forgotPasswordToken.token": req.params.token },
    {
      password: req.body.password,
    },
    (err, data) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      var hours = Math.floor(Math.abs(Date.now - data.expiration) / 36e5);
      if (hours < 1) {
        res.json({
          data,
        });
      } else {
        res.status(500).json({
          message: "Token expired",
        });
        return;
      }
    }
  );
});

//Update user password route
router.post("/update-password", async (req, res) => {
  console.log(req.body);

  userModel.findOneAndUpdate(
    { email: req.body.email },
    {
      password: req.body.password,
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

module.exports = router;
