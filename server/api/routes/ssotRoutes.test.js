/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const dbHandler = require('../../utils/TestingUtils/TestDatabaseHandler');
const dbLoader = require('../../utils/TestingUtils/databaseLoader');
const ssotRetrievalController = require('../controllers/ssotRetrievalController');
const ssotParsingController = require('../controllers/ssotParsingController');
const ssotVariableController = require('../controllers/ssotVariableController');
const ssotAttributesController = require('../controllers/ssotRpaAttributes');

// eslint-disable-next-line no-unused-vars
const rpaTaskModel = require('../models/rpaTaskModel');

const testData = require('../../utils/TestingUtils/testData');
const {
  testSsot,
  testRobotId,
  testUserId,
} = require('../../utils/TestingUtils/testData');

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => dbHandler.connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => dbHandler.closeDatabase());

describe('/ssot/getAvailableRobotsForUser', () => {
  it('retreives the list of robots for user correctly', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadUserAccessObjectsInDb();

    const request = httpMocks.createRequest({
      params: {
        userId: testUserId,
      },
    });
    const response = httpMocks.createResponse();
    await ssotRetrievalController.getRobotList(request, response);
    const data = await response._getData();
    expect(response.statusCode).toBe(200);
    // Catches error "Received: serializes to the same string"
    // Solution found here https://github.com/facebook/jest/issues/8475#issuecomment-537830532
    expect(JSON.stringify(data[0]._id)).toEqual(JSON.stringify(testRobotId));
  });
});

describe('ssot/get/:id', () => {
  it('retrieves a ssot by id correctly', async () => {
    await dbLoader.loadSsotInDb();

    const request = httpMocks.createRequest({
      params: {
        id: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.getSingleSourceOfTruth(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data._id)).toEqual(JSON.stringify(testRobotId));
  });
});

describe('ssot/renameRobot', () => {
  it('sets the robotName to the requested string', async () => {
    await dbLoader.loadSsotInDb();

    const request = httpMocks.createRequest({
      query: {
        id: testRobotId,
        newName: 'newTestRobot',
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.renameRobot(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data.robotName)).toEqual(
      JSON.stringify('newTestRobot')
    );

    // verify if really in DB
    const ssot = await mongoose.model('SSoT').findById(testRobotId).exec();
    expect(JSON.stringify(ssot.robotName)).toEqual(
      JSON.stringify('newTestRobot')
    );
  });
});

describe('ssot/shareRobotWithUser', () => {
  it('successfully creates a userAccessObject for robot and user', async () => {
    const request = httpMocks.createRequest({
      query: {
        userId: testUserId,
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.shareRobotWithUser(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data.userId)).toEqual(JSON.stringify(testUserId));
    expect(JSON.stringify(data.robotId)).toEqual(JSON.stringify(testRobotId));

    // verify if really in DB
    const userAccessObject = await mongoose
      .model('userAccessObject')
      .find({
        userId: testUserId,
        robotId: testRobotId,
      })
      .exec();

    expect(JSON.stringify(userAccessObject[0].robotId)).toBe(
      JSON.stringify(testRobotId)
    );
    expect(JSON.stringify(userAccessObject[0].userId)).toEqual(
      JSON.stringify(testUserId)
    );
  });
});

describe('ssot/createNewRobot', () => {
  it('successfully creates a new ssot', async () => {
    const request = httpMocks.createRequest({
      query: {
        userId: testUserId,
        robotName: testSsot.robotName,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.createNewRobot(request, response);
    expect(response.statusCode).toBe(200);

    const data = await response._getData();
    const newRobotId = data.robotId;

    // verify if really in DB
    const request2 = httpMocks.createRequest({
      params: {
        userId: testUserId,
      },
    });
    const response2 = httpMocks.createResponse();
    await ssotRetrievalController.getRobotList(request2, response2);

    const data2 = await response2._getData();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data2[0]._id)).toEqual(JSON.stringify(newRobotId));
  });
});

describe('ssot/parser/getForId/:robotId', () => {
  it('successfully retrieves parsed code for ssot', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadAttributesInDb();
    await dbLoader.loadParametersInDb();

    const request = httpMocks.createRequest({
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotParsingController.getRobotCodeForId(request, response);
    expect(response.statusCode).toBe(200);

    const data = await response._getData();
    expect(data).toMatch('*** Settings ***');
    expect(data).toMatch('*** Tasks ***');
  });
});

describe('ssot/overwriteRobot/:robotId', () => {
  it('successfully retrieves overwritten ssot', async () => {
    await dbLoader.loadSsotInDb();

    const adaptedSsot = JSON.parse(JSON.stringify(testSsot)); // deep copy workaround
    adaptedSsot.elements = [
      {
        predecessorIds: [],
        successorIds: [],
        _id: '6062f0ad92ffd3044c6ee382',
        type: 'MARKER',
        name: 'Start Event',
        id: 'Event_1wm4a0f',
      },
    ];

    const request = httpMocks.createRequest({
      method: 'POST',
      params: {
        robotId: testRobotId,
      },
      body: adaptedSsot,
    });
    const response = httpMocks.createResponse();
    await ssotRetrievalController.overwriteRobot(request, response);

    expect(response.statusCode).toBe(200);

    const data = await response._getData();
    expect(data.elements.length).toBe(1);

    // verify if really in DB
    const newSsot = await mongoose.model('SSoT').findById(testRobotId).exec();
    expect(JSON.stringify(data)).toEqual(JSON.stringify(newSsot));
  });
});

describe('ssot/updateManyParameters', () => {
  it('successfully updates parameter for a task', async () => {
    await dbLoader.loadParametersInDb();
    const updatedValue = 'StonksOnlyGoDown.xls';

    const request = httpMocks.createRequest({
      method: 'POST',
      body: [
        {
          activityId: testSsot.elements[2].id,
          robotId: testRobotId,
          rpaParameters: [
            {
              name: 'filename',
              type: 'String',
              isRequired: true,
              infoText: 'Path to filename',
              index: 0,
              value: updatedValue,
            },
          ],
        },
      ],
    });
    const response = httpMocks.createResponse();

    await ssotVariableController.updateMany(request, response);
    expect(response.statusCode).toBe(200);
    const data = await response._getData();
    expect(data.modifiedCount).toBe(1);

    // verify if really in DB
    const newParamObject = await mongoose
      .model('parameter')
      .findOne({
        robotId: testRobotId,
        activityId: testSsot.elements[2].id,
      })
      .exec();

    expect(newParamObject.rpaParameters[0].value).toEqual(updatedValue);
  });
});

describe('ssot/getAllParameters/:robotId', () => {
  it('successfully retreives all parameters for a robot', async () => {
    await dbLoader.loadParametersInDb();

    const request = httpMocks.createRequest({
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotVariableController.retrieveParametersForRobot(request, response);
    expect(response.statusCode).toBe(200);
    const data = await response._getData();
    expect(data.length).toBe(3);
    expect(JSON.stringify(data)).toEqual(
      JSON.stringify([
        testData.testParameter1,
        testData.testParameter2,
        testData.testParameter3,
      ])
    );
  });
});

describe('ssot/updateManyAttributes', () => {
  it('successfully updates all attributes for a robot', async () => {
    await dbLoader.loadAttributesInDb();

    const newAppValue = 'NewTestApp';
    const newTaskValue = 'NewTestTask';

    const request = httpMocks.createRequest({
      method: 'POST',
      body: [
        {
          activityId: 'Activity_175v5b5',
          robotId: '606199015d691786a44a608f',
          rpaApplication: newAppValue,
          rpaTask: newTaskValue,
        },
      ],
    });
    const response = httpMocks.createResponse();

    await ssotAttributesController.updateMany(request, response);
    expect(response.statusCode).toBe(200);
    const data = await response._getData();
    expect(data.modifiedCount).toBe(1);

    // verify if really in DB
    const newAttributesObject = await mongoose
      .model('rpaAttributes')
      .findOne({
        robotId: testRobotId,
        activityId: testSsot.elements[2].id,
      })
      .exec();

    expect(newAttributesObject.rpaApplication).toEqual(newAppValue);
    expect(newAttributesObject.rpaTask).toEqual(newTaskValue);
  });
});

describe('ssot/getAllAttributes/:robotId', () => {
  it('successfully retreives all Attributes for a robot', async () => {
    await dbLoader.loadAttributesInDb();

    const request = httpMocks.createRequest({
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotAttributesController.retrieveAttributesForRobot(
      request,
      response
    );
    expect(response.statusCode).toBe(200);
    const data = await response._getData();

    expect(data.length).toBe(3);
    expect(JSON.stringify(data)).toEqual(
      JSON.stringify([
        testData.testAttributes1,
        testData.testAttributes2,
        testData.testAttributes3,
      ])
    );
  });
});

describe('ssot/delete/:robotId', () => {
  it('successfully deletes the robots ssot', async () => {
    await dbLoader.loadSsotInDb();
    const ssotBefore = await mongoose.model('SSoT').find().exec();

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const usableTestRobotId = mongoose.Types.ObjectId(testRobotId);
    const foundSsots = await mongoose.model('SSoT').find().exec();
    expect(foundSsots.length).toBe(0);

    const foundSsotById = await mongoose
      .model('SSoT')
      .findById({ _id: usableTestRobotId })
      .exec();

    expect(foundSsotById).toBe(null);
    expect(foundSsotById).not.toBe(ssotBefore);
  });

  it('successfully deletes the user access object to a robot', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadUserAccessObjectsInDb();

    const loadedUserAccessObjects = await mongoose
      .model('userAccessObject')
      .find()
      .exec();
    expect(loadedUserAccessObjects.length).toBe(2);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const foundUserAccessObjects = await mongoose
      .model('userAccessObject')
      .find()
      .exec();
    expect(foundUserAccessObjects.length).toBe(
      loadedUserAccessObjects.length - 1
    );

    const usableTestRobotId = mongoose.Types.ObjectId(testRobotId);
    const foundUserAccessObjectsById = await mongoose
      .model('userAccessObject')
      .find({ robotId: usableTestRobotId })
      .exec();

    expect(foundUserAccessObjectsById.length).toBe(0);
  });

  it('successfully deletes the attributes to a robots activities', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadAttributesInDb();

    const loadedAttributes = await mongoose
      .model('rpaAttributes')
      .find()
      .exec();
    expect(loadedAttributes.length).toBe(3);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const foundAttributes = await mongoose.model('rpaAttributes').find().exec();
    expect(foundAttributes.length).toBe(0);
    expect(foundAttributes.length).not.toBe(loadedAttributes.length);
    expect(foundAttributes).not.toBe(loadedAttributes);
  });

  it('successfully deletes the parameters to a robots activities', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadParametersInDb();

    const loadedParameters = await mongoose.model('parameter').find().exec();
    expect(loadedParameters.length).toBe(3);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const foundParameters = await mongoose.model('parameter').find().exec();
    expect(foundParameters.length).toBe(0);
    expect(foundParameters.length).not.toBe(loadedParameters.length);
    expect(foundParameters).not.toBe(loadedParameters);
  });

  it('successfully deletes the jobs to a robot', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadJobInDb();

    const loadedJobs = await mongoose.model('job').find().exec();
    expect(loadedJobs.length).toBe(1);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const foundJobs = await mongoose.model('job').find().exec();
    expect(foundJobs.length).toBe(0);
    expect(foundJobs.length).not.toBe(loadedJobs.length);
    expect(foundJobs).not.toBe(loadedJobs);
  });

  it('sucessfully deletes every robot artifact to a given robotId', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadJobInDb();
    await dbLoader.loadParametersInDb();
    await dbLoader.loadAttributesInDb();
    await dbLoader.loadUserAccessObjectsInDb();
    await dbLoader.loadTasksInDb();

    const request = httpMocks.createRequest({
      method: 'DELETE',
      params: {
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.deleteRobot(request, response);
    expect(response.statusCode).toBe(200);

    // verify if really deleted
    const usableTestRobotId = mongoose.Types.ObjectId(testRobotId);
    const foundSsotById = await mongoose
      .model('SSoT')
      .findById({ _id: usableTestRobotId })
      .exec();
    expect(foundSsotById).toBe(null);

    const foundUserAccessObjectsById = await mongoose
      .model('userAccessObject')
      .find({ robotId: usableTestRobotId })
      .exec();
    expect(foundUserAccessObjectsById.length).toBe(0);

    const foundAttributes = await mongoose.model('rpaAttributes').find().exec();
    expect(foundAttributes.length).toBe(0);

    const foundParameters = await mongoose.model('parameter').find().exec();
    expect(foundParameters.length).toBe(0);

    const foundJobs = await mongoose.model('job').find().exec();
    expect(foundJobs.length).toBe(0);
  });
});

describe('/deleteParameters', () => {
  it('deletes removed activity related parameter', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadParametersInDb();

    let deletedActivityList = [
      testSsot.elements[2].id,
      testSsot.elements[3].id,
    ];
    deletedActivityList = JSON.stringify(deletedActivityList);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      query: {
        activityIdList: deletedActivityList,
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotVariableController.deleteForActivities(request, response);

    const foundParameters = await mongoose.model('parameter').find().exec();
    expect(foundParameters.length).toBe(1);

    expect(response.statusCode).toBe(200);
  });
});

describe('/deleteAttributes', () => {
  it('deletes removed activity related attributes', async () => {
    await dbLoader.loadSsotInDb();
    await dbLoader.loadAttributesInDb();

    let deletedActivityList = [
      testSsot.elements[2].id,
      testSsot.elements[3].id,
    ];
    deletedActivityList = JSON.stringify(deletedActivityList);

    const request = httpMocks.createRequest({
      method: 'DELETE',
      query: {
        activityIdList: deletedActivityList,
        robotId: testRobotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotAttributesController.deleteForActivities(request, response);

    const foundAttributes = await mongoose.model('rpaAttributes').find().exec();
    expect(foundAttributes.length).toBe(1);

    expect(response.statusCode).toBe(200);
  });
});
