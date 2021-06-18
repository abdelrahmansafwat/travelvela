require("dotenv").config();
const express = require("express");
const router = express.Router();
const couponModel = require("../models/coupon");

//Login route
router.post("/find", async (req, res) => {
  couponModel.findOne({ code: req.body.code }, (err, data) => {
    if (!data) {
      res.status(401).json({
        message: "Coupon doesn't exist.",
      });
    } else {
      //validate password
      if (err) {
        res.status(500).json({
          message: "An error occured. Please try again.",
        });
        return;
      }
      if (data.expiration < new Date()) {
        res.status(401).json({
          message: "Coupon expired.",
        });
        return;
      } else {
        res.status(200).json({
          message: "Coupon found.",
          coupon: data,
        });
      }
    }
  });
});

//Register route
router.post("/add", async (req, res) => {
  console.log(req.body);

  var exists = false;

  couponModel.findOne({ code: req.body.code }, function (err, docs) {
    //console.log("Checking if email exists...");
    if (docs) {
      exists = true;

      res.status(409).json({
        message: "Coupon already exists.",
      });
    }
  });

  if (!exists) {
    let newCoupon = new couponModel({
        code: req.body.code,
        expiration: req.body.expiration,
        fixed: req.body.fixed,
        value: req.body.value,
    });

    newCoupon.save((err, data) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.json({
        code: req.body.code,
        message: "Everything OK",
      });
    });
  }
});

//All coupons route
router.get("/all", async (req, res) => {
  couponModel.find({}, (err, data) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      message: "Retrieved all coupons",
      coupons: data,
    });
  });
});

//Update coupon route
router.post("/update", async (req, res) => {
  console.log(req.body);

  couponModel.findOneAndUpdate(
    { _id: req.body._id },
    {
        code: req.body.code,
        expiration: req.body.expiration,
        fixed: req.body.fixed,
        value: req.body.value,
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
  couponModel.deleteOne({ _id: req.body._id }, function (err) {
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
