/**
 * @category Client
 * @module
 */

/**
 * appTaskLocalStorage
 */

const APPLICATION_TASK_STORAGE_PATH = 'appTaskLocalStorage';
const PARAMETER_STORAGE_PATH = 'parameterLocalStorage';

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
 * TODO => kann weg
 */
const getAttributes = async (robotId, activityId) => {
    let localStorage = sessionStorage.getItem(APPLICATION_TASK_STORAGE_PATH);
    localStorage = JSON.parse(localStorage);
    const matchingActivity = localStorage.find((element) => (element.ssotId === robotId && element.activityId === activityId));

    if (matchingActivity) {
        return matchingActivity;
    }

    const requestString = `/ssot/getAttributes?botId=${robotId}&activityId=${activityId}`;
    const response = await fetch(requestString);
    let addedStorage = localStorage;

    addedStorage.push(response);
    addedStorage = JSON.stringify(addedStorage);
    // sessionStorage.setItem(APPLICATION_TASK_STORAGE_PATH, addedStorage);
    return response;
};

/**
 * TODO
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
 * TODO
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
 * TODO
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
 * TODO
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

module.exports = {
    getAttributes,
    setRpaTask,
    setRpaApplication,
    getParameters,
    setParameter,
    getOutputValue,
    setOutputValue
}