/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const dbHandler = require('../utils/TestingUtils/TestDatabaseHandler');
const ssotRetrievalController = require('../controllers/ssotRetrievalController');
const ssotParsingController = require('../controllers/ssotParsingController');
const testData = require('../utils/TestingUtils/testData');

const SsotModel = mongoose.model('SSoT');
const UserAccessObjectModel = mongoose.model('userAccessObject');

const loadSsotInDb = async () => {
  const ssot = new SsotModel(testData.testSsot);
  await ssot.save();
};

const loadUserAccessObjectInDb = async () => {
  const userAccessObject = UserAccessObjectModel(testData.testUserAccessObject);
  await userAccessObject.save();
};

const loadAttributesInDb = async () => {
  const RpaAttribute = mongoose.model('rpaAttributes');
  const rpaAttribute = new RpaAttribute(testData.testAttributes1);
  await rpaAttribute.save();
  const rpaAttribute2 = new RpaAttribute(testData.testAttributes2);
  await rpaAttribute2.save();
  const rpaAttribute3 = new RpaAttribute(testData.testAttributes3);
  await rpaAttribute3.save();
};

const loadParametersInDb = async () => {
  const RpaParam = mongoose.model('parameter');
  const rpaParamter = new RpaParam(testData.testParameter1);
  await rpaParamter.save();
  const rpaParamter2 = new RpaParam(testData.testParameter2);
  await rpaParamter2.save();
  const rpaParamter3 = new RpaParam(testData.testParameter3);
  await rpaParamter3.save();
};

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
    await loadSsotInDb();
    await loadUserAccessObjectInDb();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/getAvailableRobotsForUser',
      params: {
        userId: testData.userId,
      },
    });
    const response = httpMocks.createResponse();
    await ssotRetrievalController.getRobotList(request, response);
    const data = await response._getData();
    expect(response.statusCode).toBe(200);
    // Catches error "Received: serializes to the same string"
    // Solution found here https://github.com/facebook/jest/issues/8475#issuecomment-537830532
    expect(JSON.stringify(data[0]._id)).toEqual(
      JSON.stringify(testData.ssotId)
    );
  });

  it('throws an error when bad param passed', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/getAvailableRobotsForUser',
      params: {
        userId: '123',
      },
    });
    const response = httpMocks.createResponse();
    await ssotRetrievalController.getRobotList(request, response);
    expect(console.error).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe('ssot/get/:id', () => {
  it('retreives a ssot by id correctly', async () => {
    await loadSsotInDb();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/get/',
      params: {
        id: testData.ssotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.getSingleSourceOfTruth(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data._id)).toEqual(JSON.stringify(testData.ssotId));
  });
});

describe('ssot/renameRobot', () => {
  it('sets the robotName to the requested string', async () => {
    await loadSsotInDb();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/renameRobot',
      query: {
        id: testData.ssotId,
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
    const request2 = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/get/',
      params: {
        id: testData.ssotId,
      },
    });
    const response2 = httpMocks.createResponse();

    await ssotRetrievalController.getSingleSourceOfTruth(request2, response2);
    const data2 = await response2._getData();
    expect(JSON.stringify(data2.robotName)).toEqual(
      JSON.stringify('newTestRobot')
    );
  });
});

describe('ssot/retrieveRobotMetadata', () => {
  it('gets the correct robot metadata', async () => {
    await loadSsotInDb();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/retrieveRobotMetadata',
      params: {
        robotId: testData.ssotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.retrieveRobotMetadata(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data.robotName)).toEqual(
      JSON.stringify(testData.testSsot.robotName)
    );
    expect(JSON.stringify(data.starterId)).toEqual(
      JSON.stringify(testData.testSsot.starterId)
    );
  });
});

describe('ssot/shareRobotWithUser', () => {
  it('successfully creates a userAccessObject for robot and user', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/shareRobotWithUser',
      query: {
        userId: testData.userId,
        robotId: testData.ssotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.shareRobotWithUser(request, response);
    const data = await response._getData();

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data.userId)).toEqual(
      JSON.stringify(testData.userId)
    );
    expect(JSON.stringify(data.robotId)).toEqual(
      JSON.stringify(testData.ssotId)
    );

    // verify if really in DB
    const userAccessObject = await UserAccessObjectModel.find({
      userId: testData.userId,
      robotId: testData.ssotId,
    }).exec();
    expect(JSON.stringify(userAccessObject[0].robotId)).toBe(
      JSON.stringify(testData.ssotId)
    );
    expect(JSON.stringify(userAccessObject[0].userId)).toEqual(
      JSON.stringify(testData.userId)
    );
  });
});

describe('ssot/createNewRobot', () => {
  it('successfully creates a new ssot', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/createNewRobot',
      query: {
        userId: testData.userId,
        robotName: testData.testSsot.robotName,
      },
    });
    const response = httpMocks.createResponse();

    await ssotRetrievalController.createNewRobot(request, response);
    expect(response.statusCode).toBe(200);

    const data = await response._getData();
    const newSsotId = data.robotId;

    // verify if really in DB
    const request2 = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/getAvailableRobotsForUser',
      params: {
        userId: testData.userId,
      },
    });
    const response2 = httpMocks.createResponse();

    await ssotRetrievalController.getRobotList(request2, response2);
    const data2 = await response2._getData();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(data2[0]._id)).toEqual(JSON.stringify(newSsotId));
  });
});

describe('ssot/getRobotCode', () => {
  it('successfully retrieves parsed code for ssot', async () => {
    await loadAttributesInDb();
    await loadParametersInDb();

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/ssot/getRobotCode',
      query: {
        robotId: testData.ssotId,
      },
    });
    const response = httpMocks.createResponse();

    await ssotParsingController.getRobotCode(request, response);
    expect(response.statusCode).toBe(200);

    const data = await response._getData();
    expect(data).toMatch('*** Settings ***');
    expect(data).toMatch('*** Tasks ***');
  });
});
