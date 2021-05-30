/* eslint-disable no-unused-vars */
require('express');
const mongoose = require('mongoose');
const ssotToRobotParser = require('../utils/ssotToRobotParsing/ssotToRobotParser.js');
const ssotModels = require('../api/models/singleSourceOfTruthModel.js');
const userAccessObject = require('../api/models/userAccessObjectModel.js');
const jobsModel = require('../api/models/robotJobModel.js');

mongoose.set('useFindAndModify', false);

/**
 * @description Fetches the ssot of a given robot from the database and parses the ssot to robot code
 * @param {String} robotId the id of the robot we want the robot code for
 * @param {String} jobId the id of the current job
 */
exports.getRobotCodeForJob = async (robotId, jobId) => {
  try {
    const robotCode = ssotToRobotParser.parseCodeForJob(robotId, jobId);
    return robotCode;
  } catch (err) {
    return console.error(err);
  }
};

/**
 * @description Fetches the ssot of a given robot from the database and parses the ssot to robot code
 * @param {String} robotId the id of the robot we want the robot code for
 */
exports.getRobotCode = async (robotId) => {
  try {
    const robotCode = ssotToRobotParser.parseSsotById(robotId);
    return robotCode;
  } catch (err) {
    return console.error(err);
  }
};

/**
 * @description Finds a specific robot job and retrieves the parameter array
 * @param {String} jobId the id of the robot job that we want to get all the parameters from
 */
exports.getRobotJobParameters = async (jobId) => {
  const robotJobParameters = await mongoose
    .model('job')
    .findById(jobId, {
      parameters: 1,
    })
    .exec();
  return robotJobParameters;
};

/**
 * @description Fetches the ssot from the database and parses the ssot to robot code
 * @param {String} robotId the id of the robot we want the robot code for
 */
exports.getAllUserIds = async () => {
  try {
    const userObjs = await mongoose.model('userAccessObject').find();
    let userIds = [];
    if (userObjs.length > 0) {
      userIds = userObjs.map((obj) => String(obj.userId));
    }
    return userIds;
  } catch (err) {
    return console.error(err);
  }
};

/**
 * @description Creates a Job in the database for a robot execution of a specific user
 * @param {String} userId the id of the user that wants to execute a robot
 * @param {String} robotId the id of the robot to be executed
 * @param {String} status the current status of the job (either waiting, executing, successful or failed)
 * @param {Array} parameters different parameters the user defined before executing the robot
 */
exports.createJob = async (userId, robotId, status, parameters) => {
  const job = new jobsModel.Job({
    user_id: userId,
    robot_id: robotId,
    status,
    parameters,
  });
  try {
    const jobObj = await job.save();
    const { _id: objId } = jobObj;
    return objId;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

/**
 * @description Finds a specific job in the database and updates the status of the Job
 * @param {String} jobId the id of the job that we want to update
 * @param {String} status the current status of the job (either waiting, executing, success or failed)
 */
exports.updateRobotJobStatus = async (jobId, status) => {
  await jobsModel.Job.findByIdAndUpdate(jobId, { status }, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

/**
 * @description Updates the given Job when the run has failed with the list of failing activities
 * @param {String} jobId the id of the job that we want to update
 * @param {Array} errorLog the list of logs of the robots activites
 */
exports.updateRobotJobErrors = async (jobId, errorLog) => {
  const errors = errorLog.robotRun.activities
    .filter((activity) => activity.status === 'FAIL')
    .map((activity) => ({
      activityName: activity.activityName,
      tasks: activity.tasks,
      message: activity.message,
    }));
  await jobsModel.Job.findByIdAndUpdate(
    jobId,
    { loggedErrors: errors },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
};

/**
 * @description Finds all jobs with status waiting in the database for a specific user
 * @param {String} userId the id of the user we want all waiting jobs for
 */
exports.getAllWaitingJobsForUser = async (userId) => {
  const jobList = await jobsModel.Job.find(
    { user_id: userId, status: 'waiting' },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
  return jobList;
};
