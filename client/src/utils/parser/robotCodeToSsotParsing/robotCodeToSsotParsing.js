/**
 * @category Client
 * @module
 */

const { default: customNotification } = require('../../notificationUtils');

const FOURSPACE = '    ';

/**
 * @returns "uniqueId" which is just an increment from the counter in the local storage 
 */
const getUniqueId = () => {
    const newId = JSON.parse(sessionStorage.getItem('idCounter')) + 1;
    sessionStorage.setItem('idCounter', newId);
    return newId;
}

/**
 * @returns unique Id; wrapped with the activity nomenclature
 */
const getActivityId = () => `Activity_0ay${getUniqueId()}`

/**
 * @returns unique Id; wrapped with the event nomenclature
 */
const getEventId = () => `Event_0ay${getUniqueId()}`

/**
 * @description Splits the robot code into an array and deletes all empty lines 
 * @param {String} robotCode Code from the code editor
 * @returns Robot code without empty lines as an array
 */
const getRobotCodeAsArray = (robotCode) => {
    const robotCodeAsArray = robotCode.split('\n');
    for (let i = 0; i < robotCodeAsArray.length; i += 1) {
        if (robotCodeAsArray[i] === '') {
            robotCodeAsArray.splice(i, 1);
            i -= 1;
        }
    }
    return robotCodeAsArray;
}

/**
 * @description checks all lines of the settings section for the right syntax and returns all declared applications as an array
 * @param {Array} robotCodeSettingsSection all lines from the settings section as an array-entry (typeof string)
 * @returns Array of all declared applications or undefined if an error occures
 */
const getApplicationArray = (robotCodeSettingsSection) => {
    if (typeof robotCodeSettingsSection === 'undefined') return undefined;
    const robotCode = robotCodeSettingsSection.slice(1)
    const availableApplications = JSON.parse(sessionStorage.getItem('availableApplications'))
    let errorWasThrown;

    robotCode.forEach((line) => {
        const regexForRpaAlias = (/Library +RPA[.][a-zA-Z]+/)

        const elementStartsWithLibrary = line.startsWith('Library ');
        const rpaAliasIsCorrect = regexForRpaAlias.test(line);
        const applicationIsAvailable = availableApplications.includes(line.split('RPA.')[1])

        if (!elementStartsWithLibrary) {
            customNotification('Error', `Every line of the "*** Settings ***" Section has to start with "Library"! \nError location: "${line}"`)
            errorWasThrown = true;
            return;
        }
        if (!rpaAliasIsCorrect) {
            customNotification('Error', `Application has to start with "RPA." \nError location: "${line}"`)
            errorWasThrown = true;
            return;
        }
        if (!applicationIsAvailable) {
            customNotification('Error', `The Application "${String(line.split('RPA.')[1])}" is currently not supported. `)
            errorWasThrown = true;
        }
    })

    const declaredApplications = (errorWasThrown ? undefined : robotCode.map((line) => line.split('RPA.')[1]))

    return declaredApplications;
}

/**
 * @description retrieves the outputVariable name from the current code line
 * @param {String} currentLine current line of RPAf code
 * @returns outputVariable as string
 */
const getOutputName = (currentLine) => {
    const indexOfEqualsSign = currentLine.indexOf('=');
    return currentLine.slice(0, indexOfEqualsSign).replace('${', '').replace('}', '').trim();
}

/**
 * @description retrieves the rpa task from the current code line
 * @param {String} currentLine current line of RPAf code
 * @param {String} splitPlaceholder placeholder to split the string
 * @returns rpaTask as string
 */
const getRpaTask = (currentLine, splitPlaceholder) => {
    const indexOfFirstSplitPlaceholder = currentLine.indexOf(splitPlaceholder);
    return currentLine.slice(0, indexOfFirstSplitPlaceholder);
}

/**
 * @description retrieves the rpa parameters from the current code line
 * @param {String} currentLine current line of RPAf code
 * @param {String} splitPlaceholder placeholder to split the string
 * @param {String} instructionBlocks current intruction block to get the rpaTask
 * @returns rpaParameters as array
 */
const getRpaParameters = (currentLine, splitPlaceholder, instructionBlocks) => {
    const parametersWithoutRpaTask = currentLine.replace(instructionBlocks[instructionBlocks.length - 1].rpaTask + splitPlaceholder, '')
    return parametersWithoutRpaTask.split([splitPlaceholder]);
}

/**
 * @description deletes everything before the first occurence of '=' and then trims all emptyspace until the rpa task name to get the expected format
 * @param {String} currentLine current line of RPAf code
 * @param {String} splitPlaceholder placeholder to split the string
 * @returns the current line without the outputVariableName prefix as string
 */
const currentLineWithoutOutputVariableName = (completeLine, splitPlaceholder) => {
    const indexOfEqualsSign = completeLine.indexOf('=');
    let currentLine = completeLine.slice(indexOfEqualsSign + 1);
    if (currentLine.startsWith(splitPlaceholder)) {
        currentLine = currentLine.replace(splitPlaceholder, '').trim();
    } else {
        currentLine = currentLine.trim();
    }
    return currentLine;
}

/**
 * @description "preprocesses" the code in a usable data format
 * @param {Array} robotCodeTaskSection robot code w/o empty lines as an array of Strings
 * @param {Array} declaredApplications all declared Aplications from ***settings*** section as Strings 
 * @returns Array of Objects with the following schema:
 *      instructionBlocks = [rpaApplication:String, rpaTask:String, name:String, paramArray:Array]
 */
const getInstructionBlocksFromTaskSection = (robotCodeTaskSection, declaredApplications) => {
    let currentApplication;
    let errorWasThrown;
    const instructionBlocks = [];
    const regexForElementNameLine = (/#/)
    const regexForOutputVariable = (/\${(.)+} =/)
    const splitPlaceholder = '§&§';

    robotCodeTaskSection.slice(1).forEach((line) => {
        if (errorWasThrown) return;
        let currentLine = line.trim();
        const currentLineDefinesNewApplication = declaredApplications.includes(currentLine);
        const currentLineContainsElementName = regexForElementNameLine.test(currentLine);
        const currentLineIncludesSplitPlaceholder = currentLine.includes(splitPlaceholder);
        const currentLineHasNoSpecifiedApplication = typeof currentApplication === 'undefined';
        const currentLineDefinesOutputValue = regexForOutputVariable.test(currentLine);

        if (currentLineDefinesNewApplication) {
            currentApplication = currentLine;
            return;

        } if (currentLineHasNoSpecifiedApplication) {
            customNotification('Error', `There is no RPA-Application specified for line "${currentLine}"`)
            errorWasThrown = true;
            return;
        }

        if (currentLineIncludesSplitPlaceholder) {
            customNotification('Error', `It is not allowed to use & or § as param values \nError location: "${line}"`)
            errorWasThrown = true;
            return;
        }

        if (currentLineContainsElementName) {
            instructionBlocks.push({ rpaApplication: currentApplication, name: currentLine.substring(1).trim() })
            return;
        }

        currentLine = currentLine.replaceAll(FOURSPACE, splitPlaceholder);

        if (currentLineDefinesOutputValue) {
            const outputValueName = getOutputName(currentLine);
            instructionBlocks[instructionBlocks.length - 1].outputName = outputValueName;

            currentLine = currentLineWithoutOutputVariableName(currentLine, splitPlaceholder);
        }

        if (!errorWasThrown) {
            instructionBlocks[instructionBlocks.length - 1].rpaTask =
                getRpaTask(currentLine, splitPlaceholder);
            instructionBlocks[instructionBlocks.length - 1].paramArray =
                getRpaParameters(currentLine, splitPlaceholder, instructionBlocks);
        }
    })
    return (errorWasThrown ? undefined : instructionBlocks);
}

/**
 * @description Builds a dummy startMarker element and returns them
 * @returns dummy startMarker as JSON => currently MARKERS aren't defined
 * in our RPAf-Syntax and therefore there aren't implemented
 */
const buildStartMarker = () => ({
    "successorIds": [],
    "id": getEventId(),
    "type": "MARKER",
    "name": "START",
    "predecessorIds": []
})

/**
 * @description Builds a dummy endMarker element and returns them
 * @param {Object} predecessor as an Object to get the predecessorId
 * @returns dummy endMarker as JSON => currently MARKERS aren't defined
 * in our RPAf-Syntax and therefore there aren't implemented
 */
const buildEndMarker = (predecessor) => ({
    "successorIds": [],
    "id": getEventId(),
    "type": "MARKER",
    "name": "END",
    "predecessorIds": [predecessor ? predecessor.id : "MarkerElement"]
})

/**
 * @description builds the attributeObject for a single element
 * @param {Object} currentElement current instruction element
 * @param {Object} singleElementFromTasksSection the parsed Object from the RPAf Code  
 * @param {String} robotId the id of the current robot / ssot 
 * @returns attributeObject for a single attribute
 */
const buildSingleAttributeObject = (currentElement, singleElementFromTasksSection, robotId) => {
    let { rpaTask } = singleElementFromTasksSection;
    if (!rpaTask) rpaTask = 'no Task defined'

    return {
        activityId: currentElement.id,
        rpaApplication: singleElementFromTasksSection.rpaApplication,
        rpaTask,
        robotId
    }
}

/**
 * @description builds the parameterObject for a single element
 * @param {Object} singleAtrributeObject the attribute Object of the current activity
 * @param {Object} singleElementFromTasksSection the parsed Object from the RPAf Code   
 * @param {Array} taskAndApplicationCombinations all combinations of applications and tasks
 * @returns parameterObject for a single attribute
 */
const buildSingleParameterObject = (singleAtrributeObject, singleElementFromTasksSection, taskAndApplicationCombinations) => {
    const { rpaApplication, activityId, rpaTask, robotId } = singleAtrributeObject;
    const singleParamArray = singleElementFromTasksSection.paramArray;

    const combinationObject = taskAndApplicationCombinations.filter((singleCombinationObject) =>
        (singleCombinationObject.Application === rpaApplication && singleCombinationObject.Task === rpaTask)
    )[0];


    const parameterArray = combinationObject.inputVars.map((singleInputVariable, index) => {
        const currentParameterRequiresUserInput = (singleParamArray[index].startsWith('%%') && singleParamArray[index].endsWith('%%'));
        const currentParameterTakesOutputValue = (singleParamArray[index].startsWith('${') && singleParamArray[index].endsWith('}'));
        const singleParameterObject = { ...singleInputVariable };

        singleParameterObject.requireUserInput = (currentParameterRequiresUserInput)
        if (singleParameterObject.requireUserInput) {
            singleParameterObject.value = '';
        } else if (currentParameterTakesOutputValue) {
            const outputValueName = singleParamArray[index].slice(2).slice(0, singleParamArray[index].length - 3).trim()
            singleParameterObject.value = `$$${outputValueName}$$`;
        } else {
            singleParameterObject.value = singleParamArray[index];
        }

        return singleParameterObject;
    })

    return {
        activityId,
        rpaParameters: parameterArray,
        robotId,
        outputVariable: singleElementFromTasksSection.outputName
    };
}

/**
 * @description build the elementsArray of the ssot
 * @param {Array} robotCodeTaskSection robot code w/o empty lines as an array of Strings
 * @param {Array} declaredApplications all declared Aplications from ***settings*** section as Strings 
 * @param {String} robotId the id of the current robot / ssot 
 * @returns elementsArray with all needed properties
 */
const getElementsArray = (robotCodeTaskSection, declaredApplications, robotId) => {
    const elementsArray = [];
    const attributeArray = [];
    const parameterArray = [];

    if (typeof robotCodeTaskSection === 'undefined' || typeof declaredApplications === 'undefined') return undefined;

    const taskAndApplicationCombinations = JSON.parse(sessionStorage.getItem('TaskApplicationCombinations'));
    const instructionArray = getInstructionBlocksFromTaskSection(robotCodeTaskSection, declaredApplications);
    if (typeof instructionArray === 'undefined') return undefined;

    elementsArray.push(buildStartMarker())

    instructionArray.forEach((singleElement) => {
        const currentElement = {}

        currentElement.successorIds = []
        currentElement.id = getActivityId();
        currentElement.type = 'INSTRUCTION';
        currentElement.name = singleElement.name;

        const predecessor = elementsArray[elementsArray.length - 1];
        currentElement.predecessorIds = predecessor && [predecessor.id];
        if (predecessor) predecessor.successorIds = [currentElement.id];

        elementsArray.push(currentElement);

        const singleAtrributeObject = buildSingleAttributeObject(currentElement, singleElement, robotId);
        attributeArray.push(singleAtrributeObject);

        const singleParameterObject = buildSingleParameterObject(singleAtrributeObject, singleElement, taskAndApplicationCombinations);
        parameterArray.push(singleParameterObject);
    })
    elementsArray.push(buildEndMarker(elementsArray[elementsArray.length - 1]))
    const lastElement = elementsArray[elementsArray.length - 1]
    const secontlLastElement = elementsArray[elementsArray.length - 2]
    secontlLastElement.successorIds = [lastElement.id]

    sessionStorage.removeItem('attributeLocalStorage')
    sessionStorage.setItem('attributeLocalStorage', JSON.stringify(attributeArray));
    sessionStorage.setItem('parameterLocalStorage', JSON.stringify(parameterArray));

    return elementsArray;
}

/**
 * @description retrieves the starterId of the robot from the elements array
 * @param {Array} elementsArray Array of all elements of the robot
 * @returns starterId as string
 */
const getStarterId = (elementsArray) => {
    const starterElements = elementsArray.filter((singleElement) =>
        singleElement.type === 'MARKER' && singleElement.predecessorIds.length === 0
    )
    if (starterElements.length === 1) {
        return starterElements[0].id
    } return 'no starter id found';
}
/**
 * @description
 * @param {Array} robotCodeAsArray the complete robotCode w/o new lines as array
 * @param {String} selector the selector to get the line number for
 * @returns line number where the selector occurs
 */
const getLineNumberForSelector = (robotCodeAsArray, selector) => {
    let lineNumber;
    robotCodeAsArray.forEach((codeLine, index) => {
        if (codeLine.trim().includes(selector)) lineNumber = index;
    });
    if (typeof lineNumber === 'undefined') {
        customNotification('Error', `The required selector "${selector}" was not found`)
    }
    return lineNumber;
}

/**
 * @description Parses the RPA-Framework code from the code editor to the single source of truth
 * @param {String} robotCode from the code-editor
 * @returns Single source of truth as a JavaSctipt-object or undefined if an error occures
 */
const parseRobotCodeToSsot = (robotCode) => {

    const robotId = JSON.parse(sessionStorage.getItem('robotId'));
    const robotName = sessionStorage.getItem('robotName');
    const robotCodeAsArray = getRobotCodeAsArray(robotCode);

    const lineNumberSettingsSelector = getLineNumberForSelector(robotCodeAsArray, '*** Settings ***');
    const lineNumberTasksSelector = getLineNumberForSelector(robotCodeAsArray, '*** Tasks ***');

    let robotCodeSettingsSection; let robotCodeTaskSection;
    if (typeof lineNumberSettingsSelector !== 'undefined' && typeof lineNumberTasksSelector !== 'undefined') {
        robotCodeSettingsSection = robotCodeAsArray.slice(lineNumberSettingsSelector, lineNumberTasksSelector);
        robotCodeTaskSection = robotCodeAsArray.slice(lineNumberTasksSelector);
    }

    const declaredApplications = getApplicationArray(robotCodeSettingsSection);
    const elementsArray = getElementsArray(robotCodeTaskSection, declaredApplications, robotId);

    if (typeof elementsArray !== 'undefined') {
        const ssot = {
            _id: robotId,
            starterId: getStarterId(elementsArray),
            robotName,
            elements: elementsArray
        };
        return ssot;
    }
    return undefined;
}

module.exports = {
    parseRobotCodeToSsot,
    getLineNumberForSelector,
    getRobotCodeAsArray,
    getApplicationArray,
    getElementsArray,
    getInstructionBlocksFromTaskSection
};
