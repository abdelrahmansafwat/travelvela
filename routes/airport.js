const express = require("express");
const router = express.Router();
const airportModel = require("../models/airport");

//Find route
router.get("/find/:q", async (req, res) => {
  console.log(req.params);
  /*
  var data = await airportModel.fuzzySearch(req.params.q);
  console.log(data[0]);
  res.status(200).json({
    data
  });
  */

  /*
  await airportModel.find({ $text: { $search: req.params.q } }, (err, data) => {
    if (!data) {
      res.status(401).json({
        message: "Airport not found.",
      });
    } else {
      console.log(data);
      res.status(200).json({
        data
      });
    }
  });
  */
  /*
  var codeSearch = [];
  var textSearch = await airportModel.find({
    $text: { $search: req.params.q },
  });

  if (req.params.q.length === 3) {
    codeSearch = await airportModel.find({ code: req.params.q.toUpperCase() });
  }

  var data = codeSearch.concat(textSearch);

  res.status(200).json({
    data
  });
  */
  var codeSearch = [];
  var textSearch = await airportModel.fuzzySearch(req.params.q);
  //console.log(data[0]);
  
  if (req.params.q.length === 3) {
    codeSearch = await airportModel.find({ code: req.params.q.toUpperCase() });
  }

  var data = codeSearch.concat(textSearch);

  res.status(200).json({
    data,
  });
});

module.exports = router;
