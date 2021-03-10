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

// GET /getAvailableBotsForUser/78d09f66d2ed466cf20b06f7
exports.getBotList = async (req, res) => {
    try {
        res.set('Content-Type', 'application/json');
        const { userid } = req.params;

        const usableUserId = mongoose.Types.ObjectId(userid);
        const availableSSOTsById = await mongoose.model('userAccessObject').find(
            { userId: usableUserId },
            {
                AccessLevel: 0,
                _id: 0,
                userId: 0
            }
        ).exec();

        const SSOTIds = [];
        availableSSOTsById.forEach((singleUserObj) => {
            SSOTIds.push(singleUserObj.robotId);
        });

        const availableSSOTs = await mongoose.model('SSoT').find(
            { _id: { $in: SSOTIds } },
            {
                robotMetadata: 1
            }
        ).exec();

        const SSOTs = [];
        availableSSOTs.forEach((singleSSOT) => {
            SSOTs.push(singleSSOT.robotMetadata);
        });

        res.send(SSOTs);
    } catch (err) {
        console.error(err);
    }
};

// GET /renameBot?id=Browser&newName=Open+Browser
exports.renameBot = async (req, res) => {
    try {
        res.set('Content-Type', 'application/json');
        const { id } = req.query;
        const { newName } = req.query;
        const newNameWithEmptyspace = newName.replace(/\+/g, ' ');

        const ssot = await mongoose.model('SSoT').findByIdAndUpdate(
            { _id: id },
            { 'robotMetadata.robotName': newNameWithEmptyspace },
            {
                new: true,
                useFindAndModify: false
            }
        ).exec();

        res.send(ssot.robotMetadata);
    } catch (err) {
        console.error(err);
    }
};

// GET /shareBotWithUser?userid=78d09f66d2ed466cf20b06f7&botId=78d09f66d2ed466cf20b06f7
exports.shareBotWithUser = async (req, res) => {
    try {
        res.set('Content-Type', 'application/json');
        const { userid } = req.query;
        const { botId } = req.query;

        const uao = await mongoose.model('userAccessObject').create({
            AccessLevel: 'ReadWrite',
            robotId: botId,
            userId: userid
        });


        res.send(uao);
    } catch (err) {
        console.error(err);
    }
};

// GET /retrieveMetadataForBot/78d09f66d2ed466cf20b06f7
exports.retrieveBotMetadata = async (req, res) => {
    try {
        res.set('Content-Type', 'application/json');
        const { botId } = req.params;

        const ssotData = await mongoose.model('SSoT').findById(
            botId,
            {
                robotMetadata: 1
            }
        ).exec();


        res.send(ssotData.robotMetadata);
    } catch (err) {
        console.error(err);
    }
};
