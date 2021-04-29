/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const ssotModels = require('../models/singleSourceOfTruthModel.js');
const userAccessModels = require('../models/userAccessObjectModel.js');
const rpaModels = require('../models/rpaTaskModel');

// POST /ssot/updateManyParameters/
// do not forget the payload in the body for this request
exports.updateMany = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const parameterList = req.body;

    const updateList = [];
    parameterList.forEach((element) => {
      const updateElement = {
        updateOne: {
          filter: {
            robotId: element.robotId,
            activityId: element.activityId,
          },
          update: element,
          upsert: true,
        },
      };
      updateList.push(updateElement);
    });

    const updatedObjects = await mongoose
      .model('parameter')
      .bulkWrite(updateList);

    res.send(updatedObjects);
  } catch (err) {
    console.error(err);
  }
};

// GET /getAllParameters/604f537ed699a2eb47433184'
exports.retrieveParametersForRobot = async (req, res) => {
  const { robotId } = req.params;

  const parameterObjects = await mongoose
    .model('parameter')
    .find({
      robotId,
    })
    .exec();

  res.send(parameterObjects);
};
