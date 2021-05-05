/**
 * @category Client
 * @module
 */

/**
 * @description Fetch the ssot correlating to the specified Id
 * @param { String } robotId - String including the Id of the robot to be retrieved
 */
const getSsotFromDB = async (robotId) => {
  const requestString = `/ssot/get/${robotId}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description Fetch all those ssot names and ids, which are available for the current user
 * @param { String } userId - String including the user id
 */
const fetchSsotsForUser = async (userId) => {
  const requestString = `/ssot/getAvailableRobotsForUser/${userId}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description This function renames the robot in the ssot
 * @param { String } robotId - String including the robotId
 * @param { String } newName - String with the new RobotName
 */
const changeSsotName = async (robotId, newName) => {
  const adjustedName = newName.replace(/\s/g, '+');
  const requestString = `/ssot/renameRobot?id=${robotId}&newName=${adjustedName}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description Fetches all the metadata for a single robot
 * @param {String} robotId - String including the robotId
 */
const retrieveMetadataForRobot = async (robotId) => {
  const requestString = `/ssot/retrieveMetadataForRobot/${robotId}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description Create a new robot with the specified name for the specified user
 * @param {String} newName - String including the userId
 */
const createNewRobot = async (userId, newName) => {
  const adjustedName = newName.replace(/\s/g, '+');
  const requestString = `/ssot/createNewRobot?userId=${userId}&robotName=${adjustedName}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description Will send a backend call to delete a robot
 * @param {String} robotId Id of the robot that is deleted
 */
const deleteRobotFromDB = async (robotId) => {
  const requestStringParameters = `/ssot/delete/${robotId}`;
  await fetch(requestStringParameters, { method: 'DELETE' }).catch((err) => {
    console.error(err);
  });
};

/**
 * @description Sends a callout to the backend to delete parameters for the given activities
 * @param {String} robotId Id of the robot that is being used
 * @param {String} unusedActivityListString Stringified List of Activity Ids
 */
const deleteParametersForActivities = (robotId, unusedActivityListString) => {
  const requestStringParameters = `/ssot/deleteParameters?robotId=${robotId}&activityIdList=${unusedActivityListString}`;
  fetch(requestStringParameters, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  }).catch((err) => {
    console.error(err);
  });
};

/**
 * @description Sends a callout to the backend to delete attributes for the given activities
 * @param {String} robotId Id of the robot that is being used
 * @param {String} unusedActivityListString Stringified List of Activity Ids
 */
const deleteAttributesForActivities = (robotId, unusedActivityListString) => {
  const requestStringParameters = `/ssot/deleteAttributes?robotId=${robotId}&activityIdList=${unusedActivityListString}`;
  fetch(requestStringParameters, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  }).catch((err) => {
    console.error(err);
  });
};

/**
 * @description Overwrites an existing sssot in the backend with a new one
 * @param {String} robotId Id of the robot that is being overwritten
 * @param {String} ssot New ssot to be written to the database
 */
const updateRobot = async (robotId, ssot) => {
  const requestStringSsot = `/ssot/overwriteRobot/${robotId}`;
  // eslint-disable-next-line no-unused-vars
  const response = await fetch(requestStringSsot, {
    body: ssot,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return response;
};

export {
  getSsotFromDB,
  fetchSsotsForUser,
  changeSsotName,
  retrieveMetadataForRobot,
  createNewRobot,
  deleteRobotFromDB,
  deleteParametersForActivities,
  deleteAttributesForActivities,
  updateRobot,
};
