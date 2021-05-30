/* eslint-disable no-shadow */
/* eslint-disable import/first */

jest.mock('../../../../../api/routes/robots/robots');
jest.mock('./downloadStringAsFile');
jest.mock('../../../../../utils/parser/bpmnToSsotParsing/bpmnToSsotParsing');
jest.mock('../../../../../utils/sessionStorage/localSsotController/ssot');

jest.mock('../../../../../api/routes/functionalities/functionalities');
jest.mock('../../../../../utils/sessionStorage/localSsotController/parameters');
jest.mock('../../../../../utils/sessionStorage/localSsotController/attributes');

import {
  nameChangedHandler,
  applicationChangedHandler,
  taskChangedHandler,
  inputParameterChangeHandler,
  outputValueNameChangeHandler,
  modelerSelectionChangeHandler,
  modelerElementChangeHandler,
  downloadRobotFile,
  onSaveToCloud,
} from './modelerSidebarFunctionality';
import {
  setRpaTask,
  setRpaApplication,
} from '../../../../../utils/sessionStorage/localSsotController/attributes';
import {
  setSingleParameter,
  setOutputValueName,
  getParameterObject,
} from '../../../../../utils/sessionStorage/localSsotController/parameters';
import constants from './modelerSidebarFunctionalityTestingUtils';
import { getParsedRobotFile } from '../../../../../api/routes/robots/robots';
import downloadString from './downloadStringAsFile';
import {
  getRobotName,
  upsert,
} from '../../../../../utils/sessionStorage/localSsotController/ssot';
import { parseBpmnToSsot } from '../../../../../utils/parser/bpmnToSsotParsing/bpmnToSsotParsing';
import { initSessionStorage } from '../../../../../utils/sessionStorage/sessionStorageUtils';

describe('Robot Metadata Utilities Tests', () => {
  it('downloads the robot file', async () => {
    initSessionStorage(
      'robotMetadata',
      JSON.stringify({ robotName: constants.MOCK_ROBOT_NAME })
    );

    getRobotName.mockImplementation(
      () => JSON.parse(sessionStorage.getItem('robotMetadata')).robotName
    );

    getParsedRobotFile.mockImplementation((robotId) => {
      expect(robotId).toEqual(constants.MOCK_ROBOT_ID);
      return {
        text: async () => constants.MOCK_ROBOT_CONTENT,
      };
    });

    downloadString.mockImplementation((robotCode, textSpecifyier, fileName) => {
      expect(robotCode).toEqual(constants.MOCK_ROBOT_CONTENT);
      expect(textSpecifyier).toEqual('text/robot');
      expect(fileName).toEqual(`${constants.MOCK_ROBOT_NAME}.robot`);
    });

    await downloadRobotFile(constants.MOCK_ROBOT_ID);
  });

  it('saves to cloud', async () => {
    upsert.mockImplementation(() => {
      expect(sessionStorage.getItem('ssotLocal')).toEqual(
        JSON.stringify(constants.MOCK_PARSER_RESULT)
      );
    });

    parseBpmnToSsot.mockImplementation(async (xml) => {
      expect(xml).toEqual(constants.MOCK_XML);
      return constants.MOCK_PARSER_RESULT;
    });

    await onSaveToCloud(constants.MOCK_MODELER, constants.MOCK_ROBOT_ID);
  });
});

describe('Sidebar Functionality: Small Utilities', () => {
  it('handles modeler element changed with no new selection', async () => {
    let setElementStateCallCounter = 0;
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
        setElementStateCallCounter += 1;
      },
    };

    modelerElementChangeHandler(constants.MOCK_EVENT, {}, MOCK_SETTER_OBJECT);
    expect(setElementStateCallCounter).toEqual(0);
  });

  it('handles modeler element changed with new selection', async () => {
    let setElementStateCallCounter = 0;
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
        setElementStateCallCounter += 1;
      },
    };

    modelerElementChangeHandler(
      constants.MOCK_EVENT,
      constants.MOCK_ELEMENT_STATE,
      MOCK_SETTER_OBJECT
    );
    expect(setElementStateCallCounter).toEqual(1);
  });

  it('handle output value name change', async () => {
    setOutputValueName.mockImplementation((activityId, newValue) => {
      expect(activityId).toEqual(constants.MOCK_ACTIVITY_ID);
      expect(newValue).toEqual(constants.MOCK_NEW_VALUE);
    });

    outputValueNameChangeHandler(
      constants.MOCK_ACTIVITY_ID,
      constants.MOCK_NEW_VALUE
    );
  });

  it('handles input parameter change', async () => {
    setSingleParameter.mockImplementation((activityId, value) => {
      expect(activityId).toEqual(constants.MOCK_ACTIVITY_ID);
      expect(value).toEqual(constants.MOCK_VALUE);
    });

    inputParameterChangeHandler(
      constants.MOCK_ACTIVITY_ID,
      constants.MOCK_VALUE
    );
  });

  it('handles modeler name change', async () => {
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
      },
    };

    nameChangedHandler(
      constants.MOCK_EVENT,
      constants.MOCK_MODELER,
      constants.MOCK_ELEMENT_STATE,
      MOCK_SETTER_OBJECT
    );
  });
});

describe('Sidebar Functionality: Modeler Selection Change', () => {
  it('handles modeler selection change; element is not a task', async () => {
    const MOCK_CURRENT_ELEMENT = {
      id: constants.MOCK_CURRENT_ELEMENT_ID,
      businessObject: { name: 'oldTestName' },
      type: 'bpmn:StartEvent',
    };
    const MOCK_SELECTED_ELEMENTS = [MOCK_CURRENT_ELEMENT];
    const MOCK_ELEMENT_STATE = {
      selectedElements: MOCK_SELECTED_ELEMENTS,
      currentElement: MOCK_CURRENT_ELEMENT,
    };
    const MOCK_EVENT = {
      target: { value: 'newTestName' },
      newSelection: MOCK_SELECTED_ELEMENTS,
    };
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: MOCK_SELECTED_ELEMENTS,
          currentElement: MOCK_CURRENT_ELEMENT,
        });
      },
      setOutputValueName: (newName) => {
        expect(newName).toBeUndefined();
      },
      setParameterList: (newParameterList) => {
        expect(newParameterList).toEqual([]);
      },
    };

    modelerSelectionChangeHandler(
      MOCK_EVENT,
      MOCK_ELEMENT_STATE,
      constants.MOCK_ROBOT_ID,
      MOCK_SETTER_OBJECT
    );
  });

  it('handles modeler selection change; element is a task and no matching attributes found; no attribute obj match found', async () => {
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
      },
      setOutputValueName: (newName) => {
        expect(newName).toBeUndefined();
      },
      setParameterList: (newParameterList) => {
        expect(newParameterList).toEqual([]);
      },
      setDisableTaskSelection: (disabled) => {
        expect(disabled).toBeTruthy();
      },
    };

    const MOCK_TASK_TO_APPLICATION = [
      {
        activityId: 'nonMatchingId1234',
        robotId: constants.MOCK_ROBOT_ID,
        rpaApplication: constants.MOCK_APPLICATION,
        rpaTask: 'Open Application',
      },
    ];
    sessionStorage.setItem(
      'attributeLocalStorage',
      JSON.stringify(MOCK_TASK_TO_APPLICATION)
    );

    modelerSelectionChangeHandler(
      constants.MOCK_EVENT,
      constants.MOCK_ELEMENT_STATE,
      constants.MOCK_ROBOT_ID,
      MOCK_SETTER_OBJECT
    );
  });

  it('handles modeler selection change; element is a task and no matching attributes found; with attribute obj match found', async () => {
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
      },
      setSelectedApplication: (value) => {
        expect(value).toEqual(constants.MOCK_APPLICATION);
      },
      setOutputValueName: (newName) => {
        expect(newName).toBeUndefined();
      },
      setParameterList: (newParameterList) => {
        expect(newParameterList).toEqual([]);
      },
      setTasksForSelectedApplication: (availableTasks) => {
        expect(availableTasks).toEqual(['TestTask']);
      },
      setDisableTaskSelection: (disabled) => {
        expect(disabled).toBeFalsy();
      },
    };

    const MOCK_TASK_TO_APPLICATION = [
      {
        activityId: constants.MOCK_CURRENT_ELEMENT_ID,
        robotId: constants.MOCK_ROBOT_ID,
        rpaApplication: constants.MOCK_APPLICATION,
        rpaTask: 'Open Application',
      },
    ];

    sessionStorage.setItem(
      'attributeLocalStorage',
      JSON.stringify(MOCK_TASK_TO_APPLICATION)
    );

    const taskApplicationCombinations = [
      { application: 'cookbookApplication', task: 'TestTask' },
    ];
    sessionStorage.setItem(
      'taskApplicationCombinations',
      JSON.stringify(taskApplicationCombinations)
    );

    modelerSelectionChangeHandler(
      constants.MOCK_EVENT,
      constants.MOCK_ELEMENT_STATE,
      constants.MOCK_ROBOT_ID,
      MOCK_SETTER_OBJECT
    );
  });
});

describe('Sidebar Functionality: Task Change', () => {
  it('handles task change WITH parameter update', async () => {
    let setOutputValueNameCallCounter = 0;
    let setParameterListCallCounter = 0;
    const MOCK_SETTER_OBJECT = {
      setOutputValueName: (newName) => {
        expect(newName === undefined || newName === 'OutputValueName').toBe(
          true
        );
        setOutputValueNameCallCounter += 1;
      },
      setParameterList: (parametersInOrder) => {
        expect(parametersInOrder).toEqual(constants.MOCK_INPUTS_RIGHT_ORDER);
        setParameterListCallCounter += 1;
      },
    };

    setRpaTask.mockImplementation(
      (robotId, activityId, selectedApplication, value) => {
        expect(value).toEqual(constants.MOCK_VALUE);
        expect(robotId).toEqual(constants.MOCK_ROBOT_ID);
        expect(activityId).toEqual(constants.MOCK_ACTIVITY_ID);
        expect(selectedApplication).toEqual(
          constants.MOCK_SELECTED_APPLICATION
        );
      }
    );

    getParameterObject.mockImplementation((robotId, activityId) => {
      expect(robotId).toEqual(constants.MOCK_ROBOT_ID);
      expect(activityId).toEqual(constants.MOCK_ACTIVITY_ID);
      return constants.MOCK_PARAMETER_OBJECT;
    });

    taskChangedHandler(
      constants.MOCK_VALUE,
      constants.MOCK_ACTIVITY_ID,
      constants.MOCK_ROBOT_ID,
      constants.MOCK_SELECTED_APPLICATION,
      MOCK_SETTER_OBJECT
    );

    expect(setRpaTask).toHaveBeenCalledTimes(1);
    expect(getParameterObject).toHaveBeenCalledTimes(1);
    expect(setOutputValueNameCallCounter).toEqual(2);
    expect(setParameterListCallCounter).toEqual(1);
  });

  it('handles task change WITHOUT parameter update', async () => {
    setRpaTask.mockImplementation(
      (robotId, activityId, selectedApplication, value) => {
        expect(value).toBeUndefined();
        expect(robotId).toEqual(constants.MOCK_ROBOT_ID);
        expect(activityId).toEqual(constants.MOCK_ACTIVITY_ID);
        expect(selectedApplication).toEqual(
          constants.MOCK_SELECTED_APPLICATION
        );
      }
    );

    taskChangedHandler(
      undefined,
      constants.MOCK_ACTIVITY_ID,
      constants.MOCK_ROBOT_ID,
      constants.MOCK_SELECTED_APPLICATION,
      {}
    );
    expect(setRpaTask).toHaveBeenCalledTimes(1);
  });
});

describe('Sidebar Functionality: Application Change', () => {
  it('handles application change', async () => {
    const MOCK_SETTER_OBJECT = {
      setElementState: (stateObject) => {
        expect(stateObject).toEqual({
          selectedElements: constants.MOCK_SELECTED_ELEMENTS,
          currentElement: constants.MOCK_CURRENT_ELEMENT,
        });
      },
      setSelectedApplication: (value) => {
        expect(value).toEqual(constants.MOCK_VALUE);
      },
      setOutputValueName: (newName) => {
        expect(newName).toBeUndefined();
      },
      setParameterList: (newParameterList) => {
        expect(newParameterList).toEqual([]);
      },
      setTasksForSelectedApplication: (availableTasks) => {
        expect(availableTasks).toEqual(['TestTask']);
      },
      setDisableTaskSelection: (disabled) => {
        expect(disabled).toBeFalsy();
      },
    };

    const taskApplicationCombinations = [
      { application: 'cookbookApplication', task: 'TestTask' },
    ];
    sessionStorage.setItem(
      'taskApplicationCombinations',
      JSON.stringify(taskApplicationCombinations)
    );

    setRpaApplication.mockImplementation(
      (robotId, selectedElementId, value) => {
        expect(value).toEqual(constants.MOCK_VALUE);
        expect(robotId).toEqual(constants.MOCK_ROBOT_ID);
        expect(selectedElementId).toEqual(constants.MOCK_CURRENT_ELEMENT_ID);
      }
    );

    applicationChangedHandler(
      constants.MOCK_VALUE,
      constants.MOCK_ROBOT_ID,
      constants.MOCK_ELEMENT_STATE,
      MOCK_SETTER_OBJECT
    );
    expect(setRpaApplication).toHaveBeenCalledTimes(1);
  });
});
