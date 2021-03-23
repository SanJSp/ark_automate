/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const ssotModels = require('../models/singleSourceOfTruthModel.js');
const userAccessModels = require('../models/userAccessObjectModel.js');

// GET /ssot/:id
exports.getSingleSourceOfTruth = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');

    const { id } = req.params;
    const ssot = await mongoose.model('SSoT').findById(id).exec();
    res.send(ssot);
  } catch (err) {
    console.error(err);
  }
};

// GET /getAvailableRobotsForUser/78d09f66d2ed466cf20b06f7
exports.getRobotList = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const { userid } = req.params;
    const usableUserId = mongoose.Types.ObjectId(userid);

    const userAccessObjs = await mongoose
      .model('userAccessObject')
      .find(
        { userId: usableUserId },
        {
          AccessLevel: 0,
          _id: 0,
          userId: 0,
        }
      )
      .exec();

    const ssotIds = [];
    userAccessObjs.forEach((singleUserObj) => {
      ssotIds.push(singleUserObj.robotId);
    });

    const availableSsots = await mongoose
      .model('SSoT')
      .find(
        { _id: { $in: ssotIds } },
        {
          starterId: 1,
          robotName: 1,
        }
      )
      .exec();

    const ssots = [];
    availableSsots.forEach((ssot) => {
      ssots.push({
        _id: ssot.id,
        starterId: ssot.startedId,
        robotName: ssot.robotName,
      });
    });

    res.send(ssots);
  } catch (err) {
    console.error(err);
  }
};

// GET /renameRobot?id=78d09f66d2ed466cf20b06f7&newName=Bot+Browser
exports.renameRobot = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const { id } = req.query;
    const usableUserId = mongoose.Types.ObjectId(id);
    const { newName } = req.query;
    const newNameWithEmptyspace = newName.replace(/\+/g, ' ');

    const ssot = await mongoose
      .model('SSoT')
      .findByIdAndUpdate(
        { _id: usableUserId },
        { robotName: newNameWithEmptyspace },
        {
          new: true,
          useFindAndModify: false,
        }
      )
      .exec();

    res.send({
      starterId: ssot.starterId,
      robotName: ssot.robotName,
    });
  } catch (err) {
    console.error(err);
  }
};

// GET /shareRobotWithUser?userid=78d09f66d2ed466cf20b06f7&robotId=78d09f66d2ed466cf20b06f7
exports.shareRobotWithUser = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');

    const uao = await mongoose.model('userAccessObject').create({
      AccessLevel: 'ReadWrite',
      robotId: req.query.robotId,
      userId: req.query.userid,
    });

    res.send(uao);
  } catch (err) {
    console.error(err);
  }
};

// GET /retrieveMetadataForRobot/78d09f66d2ed466cf20b06f7
exports.retrieveRobotMetadata = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const { robotId } = req.params;

    const ssotData = await mongoose
      .model('SSoT')
      .findById(robotId, {
        starterId: 1,
        robotName: 1,
      })
      .exec();
  } catch (err) {
    console.error(err);
  }
};

// GET /createNewRobot?userid=78d09f66d2ed466cf20b06f7&robotName=NewRobot
exports.createNewRobot = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const { userid } = req.query;
    const usableUserId = mongoose.Types.ObjectId(userid);
    const { robotName } = req.query;
    const nameWithEmptyspace = robotName.replace(/\+/g, ' ');

    const ssot = await mongoose.model('SSoT').create({
      starterId: '',
      robotName: nameWithEmptyspace,
      elements: [],
    });

    const updatedSsot = await ssot
      .updateOne({
        _id: ssot.id,
      })
      .exec();

    const uao = await mongoose.model('userAccessObject').create({
      AccessLevel: 'ReadWrite',
      robotId: ssot.id,
      userId: usableUserId,
    });

    const returnObj = {
      robotName: nameWithEmptyspace,
      robotId: ssot.id,
    };

    res.send(returnObj);
  } catch (err) {
    console.error(err);
  }
};

// POST /overwriteRobot/78d09f66d2ed466cf20b06f7
exports.overwriteRobot = async (req, res) => {
  try {
    res.set('Content-Type', 'application/json');
    const updatedSsot = req.body;
    
    const ssotData = await mongoose
      .model('SSoT')
      .findByIdAndUpdate(
        updatedSsot['_id'], 
        updatedSsot,
        {
            new: true,
            useFindAndModify: false,
            upsert: true
        }
        )
      .exec();

    res.send(ssotData);
  } catch (err) {
    console.error(err);
  }
};
