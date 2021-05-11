/**
 * @category Client
 * @module
 */

/**
 * @description Fetch all parameter objects for a specifc robot
 * @param { String } robotId Id of the robot we want to get all the parameters for
 */
const getAllParametersForRobot = async (robotId) => {
  const requestString = `/robots/parameters/${robotId}`;
  const response = await fetch(requestString);
  return response;
};

/**
 * @description Will send a backend call to update all given parameter objects with the new one's
 * @param {Array} updatedParameters All updated parameters objects to overwrite the old attribute objects with
 */
const updateManyParameters = async (updatedParameters) => {
  const requestStringParameters = `/robots/parameters`;
  // eslint-disable-next-line no-unused-vars
  const response = await fetch(requestStringParameters, {
    body: JSON.stringify({ updatedParameters }),
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return response;
};

export { getAllParametersForRobot, updateManyParameters };
