/* eslint-disable no-undef */
const mongoose = require('mongoose');
const { expect } = require('chai');
const dbHandler = require('../utils/TestingUtils/testDatabaseHandler');
const { testRpaTask1 } = require('../utils/TestingUtils/testData');
const taskModel = require('./rpaTaskModel.js');
const RpaTask = mongoose.model('rpa-task');

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

describe('tasks can be created', () => {
  const task = new RpaTask(testRpaTask1);
  it('should throw no errors for correct job', async () => {
    task.save((err) => {
      expect(err).to.not.exist;
    });
  });
});

describe('tasks have validation for missing parameters', () => {
  const task = new RpaTask({});
  it('should be invalid if Application is empty', async () => {
    task.save((err) => {
      expect(err.errors.Application).to.exist;
      expect(err.errors.Application.message).equal('Application required');
    });
  });

  it('should be invalid if Task is empty', async () => {
    task.save((err) => {
      expect(err.errors.Task).to.exist;
      expect(err.errors.Task.message).equal('Task required');
    });
  });

  it('should be invalid if Code is empty', async () => {
    task.save((err) => {
      expect(err.errors.Code).to.exist;
      expect(err.errors.Code.message).equal('Code required');
    });
  });
});
