require("dotenv").config();
const express = require("express");
const FormData = require("form-data");
const axios = require("axios");
const router = express.Router();
const SSLCommerz = require("sslcommerz-nodejs");
const { v4: uuidv4 } = require("uuid")
const reservationModel = require("../models/reservation");
const authenticate = require("../middlewares/authenticate");

let settings = {
  isSandboxMode: false, //false if live version
  store_id: process.env.STORE_ID,
  store_passwd: process.env.STORE_PASSWORD,
};
let sslcommerz = new SSLCommerz(settings);

//Find route
router.post("/find", async (req, res) => {
  console.log(req.body);
  var birmanUrl = "http://api.tktbd.com/api/birman";
  var flynovoairUrl = "http://api.tktbd.com/api/flynovoair";
  var usbairUrl = "http://api.tktbd.com/api/usbair";
  var intapiUrl = "http://api.tktbd.com/api/intapi";

  var birmanData = null;
  var flynovoairData = null;
  var usbairData = null;
  var intapiData = null;

  await axios
    .post(birmanUrl, {
      departure_code: req.body.departure_code,
      arrival_code: req.body.arrival_code,
      departure_date: req.body.departure_date,
      arrival_date: req.body.arrival_date,
      adult: req.body.adult,
      child: req.body.child,
      infant: req.body.infant,
      oneway: req.body.oneway,
    })
    .then(function (response) {
      console.log(response.data);
      birmanData = response.data;
    })
    .catch(function (error) {
      console.log(error);
      if (error) {
      }
    });

  await axios
    .post(flynovoairUrl, {
      departure_code: req.body.departure_code,
      arrival_code: req.body.arrival_code,
      departure_date: req.body.departure_date,
      arrival_date: req.body.arrival_date,
      adult: req.body.adult,
      child: req.body.child,
      infant: req.body.infant,
      oneway: req.body.oneway,
    })
    .then(function (response) {
      console.log(response.data);
      flynovoairData = response.data;
    })
    .catch(function (error) {
      console.log(error);
      if (error) {
      }
    });

  await axios
    .post(usbairUrl, {
      departure_code: req.body.departure_code,
      arrival_code: req.body.arrival_code,
      departure_date: req.body.departure_date,
      arrival_date: req.body.arrival_date,
      adult: req.body.adult,
      child: req.body.child,
      infant: req.body.infant,
      oneway: req.body.oneway,
    })
    .then(function (response) {
      console.log(response.data);
      usbairData = response.data;
    })
    .catch(function (error) {
      console.log(error);
      if (error) {
      }
    });

    await axios
    .post(intapiUrl, {
      departure_code: req.body.departure_code,
      arrival_code: req.body.arrival_code,
      departure_date: req.body.departure_date,
      arrival_date: req.body.arrival_date,
      adult: req.body.adult,
      child: req.body.child,
      infant: req.body.infant,
      oneway: req.body.oneway,
    })
    .then(function (response) {
      console.log(response.data);
      intapiData = response.data;
    })
    .catch(function (error) {
      console.log(error);
      if (error) {
      }
    });

  res.status(200).json({
    flynovoair: flynovoairData,
    birman: birmanData,
    usbair: usbairData,
    intapi: intapiData,
  });
});

//Delete route
router.post("/delete", async (req, res) => {
  reservationModel.deleteOne({ _id: req.body._id }, function (err) {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  });
});

//Reserve route
router.post("/reserve", async (req, res) => {
  console.log(req.body);

  let transactionId = uuidv4();
  let gateWayUrl = "";

  let post_body = {};
  post_body["total_amount"] = req.body.total;
  post_body["currency"] = "BDT";
  post_body["tran_id"] = transactionId;
  post_body["success_url"] = req.body.url.replace("applive", "") + "api/reservation/reserve/success";
  post_body["fail_url"] = req.body.url.replace("applive", "") + "api/reservation/reserve/fail";
  post_body["cancel_url"] = req.body.url.replace("applive", "") + "api/reservation/reserve/cancel";
  post_body["emi_option"] = 0;
  post_body["cus_name"] = req.body.passengers[0].firstName + req.body.passengers[0].lastName;
  post_body["cus_email"] = req.body.passengers[0].email;
  post_body["cus_phone"] = req.body.passengers[0].phone;
  post_body["cus_add1"] = "customer address";
  post_body["cus_city"] = "Dhaka";
  post_body["cus_country"] = "Bangladesh";
  post_body["shipping_method"] = "NO";
  post_body["multi_card_name"] = "";
  post_body["num_of_item"] = req.body.passengers[0].numberOfTickets;
  post_body["product_name"] = "Ticket";
  post_body["product_category"] = "Tickets";
  post_body["product_profile"] = "general";
  await sslcommerz
    .init_transaction(post_body)
    .then(function(response) {
      console.log(response.GatewayPageURL);
      gateWayUrl = response.GatewayPageURL;
      console.log(gateWayUrl);
    })
    .catch((error) => {
      console.log(error);
    });

  let newReservation = new reservationModel({
    email: req.body.email,
    passengers: req.body.passengers,
    selectedGoingTicket: req.body.selectedGoingTicket,
    selectedReturningTicket: req.body.selectedReturningTicket,
    oneWay: req.body.oneWay,
    departureDate: req.body.departureDate,
    arrivalDate: req.body.arrivalDate,
    reservationId: transactionId,
    total: req.body.total,
    numberOfTickets: req.body.numberOfTickets,
    status: "Pending"
  });

  console.log(gateWayUrl);

  newReservation.save(function(err, data) {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      message: "OK",
      gateWayUrl: gateWayUrl
    });
  });
});

//Reserve success route
router.post("/reserve/success", async (req, res) => {
  console.log(req.body);
  reservationModel.findOneAndUpdate(
    { reservationId: req.body.tran_id },
    {
      details: req.body,
      status: "Processing"
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
  res.redirect("/success");
});

//Reserve fail route
router.post("/reserve/fail", async (req, res) => {
  console.log(req.body);
  reservationModel.findOneAndUpdate(
    { reservationId: req.body.tran_id },
    {
      details: req.body,
      status: "Failed"
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
    });
  res.redirect("/fail");
});

//Reserve cancel route
router.post("/reserve/cancel", async (req, res) => {
  console.log(req.body);
  reservationModel.findOneAndUpdate(
    { reservationId: req.body.tran_id },
    {
      details: req.body,
      status: "Cancelled"
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
    });
  res.redirect("/cancel");
});

//All reservations route
router.get('/all', async (req, res) => {
  reservationModel.find({}, (err, data) => {
      if (err) {
          res.status(500).json({
            message: err.message,
          });
          return;
      }
      //dataWithoutPasswords = data.map(x => _.omit(x, 'password'))
      res.status(200).json({
          message: "Retrieved all reservations",
          reservations: data,
      });
  })
});

//All reservations for specific user route
router.post('/all/specific-user', async (req, res) => {
  console.log(req.body);
  reservationModel.find({ "passengers.email" : req.body.email }, (err, data) => {
      if (err) {
          res.status(500).json({
            message: err.message,
          });
          return;
      }
      //dataWithoutPasswords = data.map(x => _.omit(x, 'password'))
      res.status(200).json({
          message: "Retrieved all reservations",
          reservations: data,
      });
  })
});

//Reserve status route
router.post("/reserve/status", async (req, res) => {
  console.log(req.body);
  reservationModel.findOneAndUpdate(
    { reservationId: req.body.reservationId },
    {
      status: req.body.status
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
    });
});

module.exports = router;
