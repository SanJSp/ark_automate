/**
 * @category Client
 * @module
 */

/**
 * @description Will update the variables for the specified activity
 * @param {String} robotId - String including the Id of the robbot
 * @param {String} activityId - String including the Id of the activity
 * @param {Array} newVariableList - Array of the variables which will be used to update the ssot
 */
const updateVariablesForRobot = async (
  robotId,
  activityId,
  newVariableList,
  outputVariableName
) => {
  const requestString = `/ssot/updateVariables/?robotId=${robotId}&activityId=${activityId}`;
  const updateObject = {
    parameters: newVariableList,
    output: outputVariableName,
  };
  const response = await fetch(requestString, {
    body: JSON.stringify(updateObject),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return response;
};

/**
 * @description Fetch all parameter objects for a specifc robot
 * @param { String } robotId Id of the robot we want to get all the parameters for
 */
const getAllParametersForRobot = async (robotId) => {
  const response = await fetch(`/ssot/getAllParameters/${robotId}`);
  return response;
};

/**
 * @description Will send a backend call to update all given parameter objects with the new one's
 * @param {Array} updatedParameters All updated parameters objects to overwrite the old attribute objects with
 */
const updateManyParameters = async (updatedParameters) => {
  const response = await fetch(`/ssot/updateManyParameters`, {
    body: updatedParameters,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return response;
};

export {
  updateVariablesForRobot,
  getAllParametersForRobot,
  updateManyParameters,
};
