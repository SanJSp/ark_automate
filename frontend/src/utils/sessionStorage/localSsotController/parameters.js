/**
 * @category Frontend
 * @module
 */
import { deleteParametersForActivities } from '../../../api/routes/robots/rpaParameter';
import getRpaFunctionalitiesObject from '../localFunctionalitiesController/functionalities';
import { getAttributeObjectForActivity } from './attributes';

const PARAMETER_STORAGE_PATH = 'parameterLocalStorage';

/**
 * @description Creates a parameter object in the parameter session storage
 * @param {Array} localParameterStorage An Array containing the current parameter objects
 * @param {string} robotId Id of the selected robot
 * @param {string} activityId Id of the selected activity
 * @param {String} application Name of the rpa application the activity has selected
 * @param {String} task Name of the rpa task the activity has selected
 * @returns {Object} Newly created parameter object
 */
const createParameterObject = (
  localParameterStorage,
  robotId,
  activityId,
  application,
  task
) => {
  const rpaFunctionalitiesObject = getRpaFunctionalitiesObject(
    application,
    task
  );

  const rpaParameters = [];
  if (rpaFunctionalitiesObject && rpaFunctionalitiesObject.inputVars) {
    rpaFunctionalitiesObject.inputVars.forEach((element) => {
      const elementCopy = element;
      elementCopy.value = '';
      rpaParameters.push(elementCopy);
    });
  }
  let newParameterObject;
  if (rpaFunctionalitiesObject && rpaFunctionalitiesObject.outputValue) {
    newParameterObject = {
      activityId,
      robotId,
      outputValue: `${activityId}_output`,
      rpaParameters,
    };
  } else {
    newParameterObject = {
      activityId,
      robotId,
      rpaParameters,
    };
  }

  localParameterStorage.push(newParameterObject);
  sessionStorage.setItem(
    'parameterLocalStorage',
    JSON.stringify(localParameterStorage)
  );
  return newParameterObject;
};

/**
 * @description Retrieves the parameter object session storage
 * @returns {Array} Parameter session storage
 */
const getParameterStorage = () =>
  JSON.parse(sessionStorage.getItem(PARAMETER_STORAGE_PATH));

/**
 * @description Retrieves the parameter object for an activity from the session storage
 * @param {String} activityId Id of the activity for which to get the parameter object for
 * @returns {Object} Parameter object for the activity
 */
const getParameterObjectForActivity = (activityId) => {
  const localParameterStorage = JSON.parse(
    sessionStorage.getItem(PARAMETER_STORAGE_PATH)
  );
  return localParameterStorage.find(
    (element) => element.activityId === activityId
  );
};

/**
 * @description Checks if the parameter object is filled correctly
 * @param {String} parameterObject Parameter object for which to check if it is filled correctly
 * @param {String} rpaFunctionalitiesObject Rpa functionalities object (rpa-task) needed to check for correctness
 * @returns {Boolean} Indicates if parameter object is filled correctly
 */
const checkIfParameterObjectCorrect = (
  parameterObject,
  rpaFunctionalitiesObject
) => {
  if (
    rpaFunctionalitiesObject &&
    rpaFunctionalitiesObject.inputVars.length &&
    parameterObject.rpaParameters.length
  ) {
    const rpaFunctionalitiesParameterLength =
      rpaFunctionalitiesObject.inputVars.length;
    const parameterObjectLength = parameterObject.rpaParameters.length;
    const rpaFunctionalitiesFirstParameterInfoText =
      rpaFunctionalitiesObject.inputVars.find(
        (element) => element.index === 0
      ).infoText;
    const firstParameterInfoText = parameterObject.rpaParameters.find(
      (element) => element.index === 0
    ).infoText;

    if (
      rpaFunctionalitiesParameterLength === parameterObjectLength &&
      rpaFunctionalitiesFirstParameterInfoText === firstParameterInfoText
    ) {
      return true;
    }
  }
  return false;
};

/**
 * @description Retrieves the parameter object for the activity from the session storage and checks if the paramter object is correctly filled.
 * If no paramter object for the activity exists but an attribute object then it will create a new parameter object and add it to the session storage.
 * If no parameter object and no attributes object exists for the activity it will return undefined.
 * @param {String} robotId Id of the robot/ssot for which the parameter object will be retrieved
 * @param {String} activityId Id of the activity for which the parameter object will be retrieved
 * @returns {Object} Parameter object for the activity
 */
const getParameterObject = (robotId, activityId) => {
  let localParameterStorage = getParameterStorage();
  const parameterObject = getParameterObjectForActivity(activityId);
  const attributeObject = getAttributeObjectForActivity(activityId);
  const application =
    attributeObject !== undefined ? attributeObject.rpaApplication : undefined;
  const task =
    attributeObject !== undefined ? attributeObject.rpaTask : undefined;
  if (parameterObject) {
    const rpaFunctionalitiesObject = getRpaFunctionalitiesObject(
      application,
      task
    );
    if (
      checkIfParameterObjectCorrect(parameterObject, rpaFunctionalitiesObject)
    ) {
      return parameterObject;
    }
    localParameterStorage = localParameterStorage.filter(
      (element) => element.activityId !== activityId
    );
  }

  if (application && task) {
    return createParameterObject(
      localParameterStorage,
      robotId,
      activityId,
      application,
      task
    );
  }

  return undefined;
};

/**
 * @description Sets a single parameter value in the session storage
 * @param {String} activityId Id of the activity for which to change the parameter value for
 * @param {Object} value Value object returned by the dropdown selection cotaining the new parameter value
 * @param {String} parameterName Name of the parameter that will be changed
 */
const setSingleParameter = (activityId, value, parameterName) => {
  const localParameterStorage = getParameterStorage();
  const matchingParameterObject = localParameterStorage.find(
    (element) => element.activityId === activityId
  );
  const newLocalParameterStorage = localParameterStorage.filter(
    (element) => element.activityId !== activityId
  );

  const matchingSingleParameter = matchingParameterObject.rpaParameters.find(
    (element) => element.name === parameterName
  );
  const newRpaParameters = matchingParameterObject.rpaParameters.filter(
    (element) => element.name !== parameterName
  );

  const editedParameter = matchingSingleParameter;
  editedParameter.value = value.target.value;
  newRpaParameters.push(editedParameter);

  const editedParameterObject = matchingParameterObject;
  editedParameterObject.rpaParameters = newRpaParameters;
  newLocalParameterStorage.push(editedParameterObject);

  sessionStorage.setItem(
    PARAMETER_STORAGE_PATH,
    JSON.stringify(newLocalParameterStorage)
  );
};

/**
 * @description Sets a property of a single parameter object in the session storage
 * @param {String} activityId Id of the activity for which to change a parameter property for
 * @param {String} parameterName Name of the parameter of which a property will be changed
 * @param {String} property Name of the property that will be changed
 * @param {Object} value Value object returned by the dropdown selection
 * @returns {Object} Updated parameter object
 */
const setPropertyForParameter = (
  activityId,
  parameterName,
  property,
  value
) => {
  const localParameterStorage = JSON.parse(
    sessionStorage.getItem(PARAMETER_STORAGE_PATH)
  );
  const newLocalParameterStorage = localParameterStorage.map(
    (parameterObject) => {
      if (parameterObject.activityId === activityId) {
        parameterObject.rpaParameters.map((elem) => {
          if (elem.name === parameterName) {
            // eslint-disable-next-line no-param-reassign
            elem[property] = value;
          }
          return elem;
        });
      }
      return parameterObject;
    }
  );
  sessionStorage.setItem(
    PARAMETER_STORAGE_PATH,
    JSON.stringify(newLocalParameterStorage)
  );
};

/**
 * @description Retrieves the parameter session storage and returns the current value of the property that will be checked
 * @param {string} robotId Id of the selected robot
 * @param {string} activityId Id of the selected activity
 * @param {string} parameterName Name of the parameter for which to get an update on the status of a property
 * @param {string} property Property of the parameters to get the current value of
 * @returns {String} Value of the property of the parameter or undefined if the activity has no parameter objects
 */
const parameterPropertyStatus = (
  robotId,
  activityId,
  parameterName,
  property
) => {
  const parameterObject = getParameterObject(robotId, activityId);
  if (typeof parameterObject !== 'undefined') {
    const rpaParameters = parameterObject.rpaParameters.filter(
      (element) => element.name === parameterName
    );
    if (rpaParameters[0]) {
      return rpaParameters[0][property];
    }
  }

  return undefined;
};

/**
 * @description Sets the new value as the name of the output variable in the session storage
 * @param {String} activityId Id of the activity for which the value of the output variable will be changed
 * @param {String} value New value for the name of the output variable
 */
const setOutputValueName = (activityId, value) => {
  const localParameterStorage = getParameterStorage();
  const matchingParameterObject = localParameterStorage.find(
    (element) => element.activityId === activityId
  );
  const newLocalParameterStorage = localParameterStorage.filter(
    (element) => element.activityId !== activityId
  );

  const editedParameterObject = matchingParameterObject;
  editedParameterObject.outputValue = value;
  newLocalParameterStorage.push(editedParameterObject);

  sessionStorage.setItem(
    PARAMETER_STORAGE_PATH,
    JSON.stringify(newLocalParameterStorage)
  );
};

/**
 * @description If there is more than one unused parameter object, delete it in the database
 * @param {Array} parameters List of all parameters saved in the session storage
 * @param {Array} usedElementIds ActivityIds that are still being used
 * @param {String} robotId Id of the robot
 */
const deleteUnusedParameterFromDB = (parameters, usedElementIds, robotId) => {
  const unusedParameters = parameters.filter(
    (singleParameter) => !usedElementIds.includes(singleParameter.activityId)
  );
  if (unusedParameters && unusedParameters.length > 0) {
    const unusedActivityIds = unusedParameters.map(
      (unusedParameterObject) => unusedParameterObject.activityId
    );
    deleteParametersForActivities(robotId, unusedActivityIds);
  }
};

export {
  getParameterStorage,
  setSingleParameter,
  setPropertyForParameter,
  parameterPropertyStatus,
  setOutputValueName,
  getParameterObject,
  deleteUnusedParameterFromDB,
};
