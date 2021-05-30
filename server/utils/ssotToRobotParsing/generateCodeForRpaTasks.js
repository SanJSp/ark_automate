/**
 * @category Server
 * @module
 */
const mongoose = require('mongoose');
const {
  ACTIVITY_IDENTIFIER,
  FOURSPACE,
  LINEBREAK,
} = require('./robotCodeConstants');
// eslint-disable-next-line no-unused-vars
const rpaModels = require('../../api/models/rpaTaskModel');

/**
 * @description Checks whether the given element is of type instruction and contains rpa attributes
 * @param {Object} currentElement Element that will be checked
 * @returns {Boolean} Value specifies if object is of type instruction and contains rpa attributes
 */
const isAnRpaInstruction = (currentElement) =>
  currentElement.type === ACTIVITY_IDENTIFIER;

/**
 * @description Creates a prefix to catch the output variable of an activity, if one is present
 * @param {Object} paramObject The parameter object that will be checked and looped through
 * @returns {String} String specifying the output variables name
 */
const setOutputValue = (paramObject) => {
  let newCodeLine = FOURSPACE;

  if (paramObject.outputValue) {
    newCodeLine += `\${${paramObject.outputValue}} = `;
  }
  return newCodeLine;
};

/**
 * @description Appends all provided parameters to a string which can be used to generate the RPAf file
 * @param {Object} parameterObject The parameter object that will be checked and looped through
 * @returns {String} String specifying the input parameters with the needed spacing in between
 */
const appendRpaInputParameter = (parameterObject) => {
  let newCodeLine = '';

  const sortedInputs = parameterObject.rpaParameters.sort(
    (a, b) => a.index - b.index
  );
  sortedInputs.forEach((parameter) => {
    newCodeLine += FOURSPACE;
    if (parameter.requireUserInput && parameter.value === '') {
      newCodeLine += `!!${parameter.name}!!`;
      return;
    }
    if (parameter.value === '') {
      newCodeLine += `%%${parameter.name}%%`;
      return;
    }
    if (parameter.value.search(/\$\$(.*?)\$\$/) >= 0) {
      // eslint-disable-next-line no-useless-escape
      newCodeLine += `$\{${parameter.value.split('$$')[1]}\}`;
      return;
    }

    newCodeLine += parameter.value;
  });

  return newCodeLine;
};

/**
 * @description Checks whether the given element has a successor element
 * @param {Object} currentElement Element to check
 * @returns {Boolean} Value specifies if element has a successor element
 */
const successorTasksExist = (currentElement) =>
  currentElement.successorIds !== undefined &&
  currentElement.successorIds[0] !== '';

/**
 * @description Generates the .robot code for the elements in the array of all elements recursively
 * @param {String} id Id of the element that the code will be generated for
 * @param {Array} elements All the elements from the ssot
 * @param {Array} parameters All parameter objects of the robot
 * @param {Array} attributes All attribute objects of the robot
 * @param {String} codeToAppend The current code that will be extended
 * @returns {string} Generated .robot code for the tasks section
 */
const writeCodeForElement = (
  id,
  elements,
  parameters,
  attributes,
  codeToAppend,
  duplicateTasks
) => {
  const currentElement = elements.find((element) => element.id === id);
  let combinedCode = codeToAppend;
  let newCodeLine = '';
  if (isAnRpaInstruction(currentElement)) {
    const currentAttributeObject = attributes.find(
      (attribute) => attribute.activityId === id
    );
    if (currentAttributeObject) {
      newCodeLine += currentElement.name + LINEBREAK;
      const currentParameterObject = parameters.find(
        (parameter) => parameter.activityId === id
      );
      if (currentParameterObject) {
        newCodeLine += setOutputValue(currentParameterObject);
      }
      if (duplicateTasks.includes(currentAttributeObject.rpaTask)) {
        newCodeLine += `RPA.${currentAttributeObject.rpaApplication}.${currentAttributeObject.rpaTask}`;
      } else {
        newCodeLine += currentAttributeObject.rpaTask;
      }
      if (currentParameterObject) {
        newCodeLine += appendRpaInputParameter(currentParameterObject);
      }

      newCodeLine += LINEBREAK;
      combinedCode += newCodeLine;
    }
  }

  if (successorTasksExist(currentElement)) {
    // Xor handling is needed here in the future
    currentElement.successorIds.forEach((successorId) => {
      combinedCode = writeCodeForElement(
        successorId,
        elements,
        parameters,
        attributes,
        combinedCode,
        duplicateTasks
      );
    });
  }
  return combinedCode.endsWith(LINEBREAK)
    ? combinedCode.slice(0, -1)
    : combinedCode;
};

/**
 * @description Generates the .robot code for all RPA Tasks
 * @param {Array} elements All the elements from the SSoT
 * @param {Object} metaData MetaData of the robot
 * @returns {string} Generated .robot code for the tasks section
 */
const generateCodeForRpaTasks = async (elements, parameters, attributes) => {
  const startElement = elements.find(
    (element) => element.predecessorIds.length === 0
  );

  const groupedByTask = await mongoose
    .model('rpa-task')
    .aggregate([{ $group: { _id: '$task', count: { $sum: 1 } } }]);
  const listOfDuplicates = groupedByTask
    .filter((singleTask) => singleTask.count > 1)
    // eslint-disable-next-line no-underscore-dangle
    .map((singleDuplicateTask) => singleDuplicateTask._id);

  const codeForRpaTasks = writeCodeForElement(
    startElement.id,
    elements,
    parameters,
    attributes,
    '',
    listOfDuplicates
  );

  return codeForRpaTasks;
};

module.exports = {
  generateCodeForRpaTasks,
};
