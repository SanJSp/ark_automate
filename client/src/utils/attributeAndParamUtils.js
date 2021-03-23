/**
 * @category Client
 * @module
 */

/**
 * appTaskLocalStorage
 */

const ROBOT_ID_PATH = 'robotId';
const APPLICATION_TASK_STORAGE_PATH = 'appTaskLocalStorage';
const PARAMETER_STORAGE_PATH = 'parameterLocalStorage';

/**
 * @description this function returns the robotId of the currently opened robot from the session storage
 * @returns currently saved robotId from session storage
 */
const getRobotId = () => {
    const localStorage = JSON.parse(sessionStorage.getItem(ROBOT_ID_PATH));
    return localStorage;
};

/**
 * @description this function writes the robotId of the currently opened robot to the session storage
 * @param {String} robotId the robotId ot the currently opened robot
 */
const setRobotId = (robotId) => {
    sessionStorage.setItem(ROBOT_ID_PATH, JSON.stringify(robotId));
};

/**
 * @description stores the RPA Application for the currently selected activity in the session storage
 * @param {string} robotId id of the currently opened robot
 * @param {string} activityId id of the currently selected activity
 * @param {string} newApplication name of the selected application from dropdown
 */
const setRpaApplication = async (robotId, activityId, newApplication) => {
    const localStorage = JSON.parse(sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH));

    let matchingActivity = localStorage.find((element) => (element.activityId === activityId));
    const arrayWithoutMatchingElement = localStorage.filter((element) => element.ssotId === robotId && element.activityId !== activityId);

    if (matchingActivity) {
        matchingActivity.rpaApplication = newApplication;
    } else {
        matchingActivity = {
            activityId,
            ssotId: robotId,
            rpaApplication: newApplication,
        };
    }

    arrayWithoutMatchingElement.push(matchingActivity);
    sessionStorage.setItem(APPLICATION_TASK_STORAGE_PATH, JSON.stringify(arrayWithoutMatchingElement));
};

/**
 * @description stores the RPA Task for the currently selected activity in the session storage
 * @param {string} robotId id of the currently opened robot
 * @param {string} activityId id of the currently selected activity
 * @param {string} newTask name of the selected task from dropdown
 */
const setRpaTask = (robotId, activityId, newTask) => {
    const localStorage = JSON.parse(sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH));

    const matchingActivity = localStorage.find((element) => (element.activityId === activityId));
    const arrayWithoutMatchingElement = localStorage.filter((element) => element.ssotId === robotId && element.activityId !== activityId);

    if (matchingActivity) {
        matchingActivity.rpaTask = newTask;
    }

    arrayWithoutMatchingElement.push(matchingActivity);
    sessionStorage.setItem(APPLICATION_TASK_STORAGE_PATH, JSON.stringify(arrayWithoutMatchingElement));
};

/**
 * TODO 
 */
const getRpaApplication = (activityId) => {
    const localStorage = JSON.parse(sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH));
    const matchingEntry = localStorage.find((element) => (element.activityId === activityId));

    let selectedApplication;
    if (matchingEntry) {
        selectedApplication = matchingEntry.rpaApplication;
    }
    return selectedApplication;
};

/**
 * TODO 
 */
const getRpaTask = (activityId) => {
    const localStorage = JSON.parse(sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH));
    const matchingEntry = localStorage.find((element) => (element.activityId === activityId));

    let selectedTask;
    if (matchingEntry) {
        selectedTask = matchingEntry.rpaTask;
    }
    return selectedTask;
};

/**
 * @description Will retrieve the value of the input variables name from either session storage, 
 * an existing object in the database or create a new one and will save it in local session storage
 * @param {String} robotId Id of the robot/ssot for which to retrieve the value
 * @param {String} activityId Id of the activity for which to retrieve the value for
 * @returns {Array} Array of the different parameter objects the activity has
 */
const getParameters = async (robotId, activityId) => {
    let localStorage = sessionStorage.getItem(PARAMETER_STORAGE_PATH);
    localStorage = JSON.parse(localStorage);
    const matchingParameterObject = localStorage.find((element) => (element.ssotId === robotId && element.activityId === activityId));

    if (matchingParameterObject.rpaParameters) {
        return matchingParameterObject.rpaParameters;
    }

    const requestString = `/ssot/getVariables?botId=${robotId}&activityId=${activityId}`;
    const response = await fetch(requestString);
    if (response && response.rpaParameters) {
        let addedStorage = localStorage;
        addedStorage.push(response);
        addedStorage = JSON.stringify(addedStorage);
        sessionStorage.setItem(PARAMETER_STORAGE_PATH, addedStorage);
        return response.rpaParameters;
    }

    const attributes = await getAttributes(robotId, activityId);
    const variableReqString = `/ssot/getVariablesForTaskApplication?task=${attributes.task}&application=${attributes.rpaApplication}`;
    const variableResponse = await fetch(variableReqString);
    if (variableResponse) {
        const responseObject = {
            rpaParameters: [],
            ssotId: robotId,
            activityId
        };
        responseObject.rpaParameters = [];
        variableResponse.inputVars.forEach((element) => {
            const elementCopy = element;
            elementCopy.value = '';
            responseObject.rpaParameters.push(elementCopy);
        });
        if (variableResponse.outputValue) responseObject.outputVariable = `${activityId}_output`;

        let addedStorage = localStorage;
        addedStorage.push(responseObject);
        addedStorage = JSON.stringify(addedStorage);
        sessionStorage.setItem(PARAMETER_STORAGE_PATH, addedStorage);
        return responseObject.rpaParameters;
    }
};

/**
 * @description Will set the parameters in local session storage
 * @param {String} robotId Id of the robot/ssot for which to change the value
 * @param {String} activityId Id of the activity for which to change the value for
 * @param {String} newParameterObject The new parameter object
 */
const setParameter = (robotId, activityId, newParameterObject) => {
    let localStorage = sessionStorage.getItem(PARAMETER_STORAGE_PATH);
    localStorage = JSON.parse(localStorage);
    const matchingElement = localStorage.find((element) => (element.ssotId === robotId && element.activityId === activityId));
    let arrayWithoutMatchingElement = localStorage.filter((element) => element.ssotId !== robotId && element.activityId !== activityId);

    if (matchingElement) {
        const parametersWithoutMatch = matchingElement.rpaParameters.filter((element) => (
            element.name !== newParameterObject.name &&
            element.type !== newParameterObject.type &&
            element.index !== newParameterObject.index
        ));
        parametersWithoutMatch.push(newParameterObject);
    } else {
        alert('There has been an error setting the parameter!');
    }
    matchingElement.rpaParameters = parametersWithoutMatch;
    arrayWithoutMatchingElement.push(matchingElement);
    arrayWithoutMatchingElement = JSON.stringify(arrayWithoutMatchingElement);
    // sessionStorage.setItem(APPLICATION_TASK_STORAGE_PATH, arrayWithoutMatchingElement);
};

/**
 * @description Will retrieve the value of the output variables name from either session storage, 
 * an existing object in the database or create a new one and will save it in local session storage
 * @param {String} robotId Id of the robot/ssot for which to retrieve the value
 * @param {String} activityId Id of the activity for which to retrieve the value for
 * @returns {String} The value for the name of the output variable
 */
const getOutputValue = async (robotId, activityId) => {
    let localStorage = sessionStorage.getItem(PARAMETER_STORAGE_PATH);
    localStorage = JSON.parse(localStorage);
    const matchingParameterObject = localStorage.find((element) => (element.ssotId === robotId && element.activityId === activityId));

    if (matchingParameterObject.outputVariable) {
        return matchingParameterObject.outputVariable;
    }

    const requestString = `/ssot/getVariables?botId=${robotId}&activityId=${activityId}`;
    const response = await fetch(requestString);

    if (response && response.outputVariable) {
        let addedStorage = localStorage;
        addedStorage.push(response);
        addedStorage = JSON.stringify(addedStorage);
        sessionStorage.setItem(PARAMETER_STORAGE_PATH, addedStorage);
        return response.outputVariable;
    }

    const attributes = await getAttributes(robotId, activityId);
    const variableReqString = `/ssot/getVariablesForTaskApplication?task=${attributes.task}&application=${attributes.rpaApplication}`;
    const variableResponse = await fetch(variableReqString);
    if (variableResponse) {
        const responseObject = {
            rpaParameters: [],
            ssotId: robotId,
            activityId
        };
        responseObject.rpaParameters = [];
        variableResponse.inputVars.forEach((element) => {
            const elementCopy = element;
            elementCopy.value = '';
            responseObject.rpaParameters.push(elementCopy);
        });
        if (variableResponse.outputValue) responseObject.outputVariable = `${activityId}_output`;


        let addedStorage = localStorage;
        addedStorage.push(responseObject);
        addedStorage = JSON.stringify(addedStorage);
        sessionStorage.setItem(PARAMETER_STORAGE_PATH, addedStorage);
        return responseObject.outputVariable;
    }
};

/**
 * @description Will set the new value as the name of the output variable in local session storage
 * @param {String} robotId Id of the robot/ssot for which to change the value
 * @param {String} activityId Id of the activity for which to change the value for
 * @param {String} newValueName The new value for the name of the output variable
 */
const setOutputValue = (robotId, activityId, newValueName) => {
    let localStorage = sessionStorage.getItem(PARAMETER_STORAGE_PATH);
    localStorage = JSON.parse(localStorage);
    const matchingElement = localStorage.find((element) => (element.ssotId === robotId && element.activityId === activityId));
    let arrayWithoutMatchingElement = localStorage.filter((element) => element.ssotId !== robotId && element.activityId !== activityId);

    if (matchingElement) {
        matchingElement.outputVariable = newValueName;
    } else {
        alert('There has been an error setting the output variable name!');
    }

    arrayWithoutMatchingElement.push(matchingElement);
    arrayWithoutMatchingElement = JSON.stringify(arrayWithoutMatchingElement);
    // sessionStorage.setItem(APPLICATION_TASK_STORAGE_PATH, arrayWithoutMatchingElement);
};

/**
 * TODO
 */
const upsert = async () => {
    const ssot = sessionStorage.getItem('ssotLocal');
    const robotId = JSON.parse(sessionStorage.getItem(ROBOT_ID_PATH));
    const requestStringSsot = `/ssot/overwriteRobot/${robotId}`;
    const responseSsot = await fetch(requestStringSsot, {
        body: ssot,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    console.log(`ssot answer: ${responseSsot}`);

    const attributes = sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH);
    const requestStringAttributes = `/ssot/updateManyAttributes`;
    const responseAttributes = await fetch(requestStringAttributes, {
        body: attributes,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    console.log(`attribute answer: ${responseAttributes}`);

    const parameterObject = sessionStorage.getItem(PARAMETER_STORAGE_PATH);
    const requestStringParameters = `/ssot/updateManyParameters`;
    const responseParameters = await fetch(requestStringParameters, {
        body: parameterObject,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    console.log(`parameter answer: ${responseParameters}`);
};

module.exports = {
    getRobotId,
    getRpaTask,
    setRobotId,
    setRpaTask,
    setRpaApplication,
    getParameters,
    setParameter,
    getOutputValue,
    setOutputValue,
    getRpaApplication,
    upsert
}