const userId = '604a3ba6561e2d1fad4eda60';
const user2Id = '604a3ba6561e2d1fad4eda00';

const ssotId = '606199015d691786a44a608f';

const testSsot = {
  id: ssotId,
  _id: ssotId, // needed because we sometimes access the id with _id, sometimes with id
  starterId: 'Event_1wm4a0f',
  robotName: 'Sandros Testbot',
  elements: [
    {
      predecessorIds: [],
      successorIds: ['Activity_1elomab'],
      _id: '6062f0ad92ffd3044c6ee382',
      type: 'MARKER',
      name: 'Start Event',
      id: 'Event_1wm4a0f',
    },
    {
      predecessorIds: ['Event_1wm4a0f'],
      successorIds: ['Activity_175v5b5'],
      _id: '6062f0ad92ffd3044c6ee383',
      type: 'INSTRUCTION',
      name: 'FirstActivity',
      id: 'Activity_1elomab',
    },
    {
      predecessorIds: ['Activity_1elomab'],
      successorIds: ['Activity_1x8wlwh'],
      _id: '6062f0ad92ffd3044c6ee384',
      type: 'INSTRUCTION',
      name: 'SecondActivity',
      id: 'Activity_175v5b5',
    },
    {
      predecessorIds: ['Activity_175v5b5'],
      successorIds: ['Event_1cuknwt'],
      _id: '6062f0ad92ffd3044c6ee385',
      type: 'INSTRUCTION',
      name: 'ThirdActivity',
      id: 'Activity_1x8wlwh',
    },
    {
      predecessorIds: ['Activity_1x8wlwh'],
      successorIds: [],
      _id: '6062f0ad92ffd3044c6ee386',
      type: 'MARKER',
      name: 'finished',
      id: 'Event_1cuknwt',
    },
  ],
};

const testUserAccessObject = {
  AccessLevel: '0',
  robotId: ssotId,
  userId,
};

const testUserAccessObject2 = {
  AccessLevel: '0',
  robotId: '604a3ba6561e2d1fad4eda11',
  userId: user2Id,
};

const testRpaTask1 = {
  Application: 'Browser',
  Task: 'Click Button',
  Code: 'Click Button',
  outputValue: false,
  inputVars: [
    {
      name: 'path',
      type: 'String',
      isRequired: true,
      infoText: 'Path to button',
      index: 0,
    },
  ],
};

const testRpaTask2 = {
  Application: 'Excel',
  Task: 'Input Text',
  Code: 'Input Text',
  outputValue: false,
  inputVars: [
    {
      name: 'coloumn',
      type: 'Integer',
      isRequired: true,
      infoText: 'Target Coloumn',
      index: 0,
    },
    {
      name: 'row',
      type: 'Integer',
      isRequired: true,
      infoText: 'Target row',
      index: 1,
    },
  ],
};

const testRpaTask3 = {
  Application: 'Browser',
  Task: 'Input Password',
  Code: 'Input Password',
  outputValue: false,
  inputVars: [
    {
      name: 'password',
      type: 'String',
      isRequired: true,
      infoText: 'password',
      index: 0,
    },
  ],
};

const testJob = {
  _id: '605c68a86d596e0d6bed0077',
  __v: 0,
  user_id: userId,
  robot_id: ssotId,
  status: 'waiting',
  parameters: [],
};

const testAttributes1 = {
  _id: '6062f0ad1abb38158c2dfa41',
  activityId: 'Activity_1elomab',
  ssotId: ssotId,
  rpaApplication: 'Excel.Application',
  rpaTask: 'Open Workbook',
  __v: 0,
};

const testAttributes2 = {
  _id: '6062f0ad1abb38158c2dfa42',
  activityId: 'Activity_175v5b5',
  ssotId: ssotId,
  rpaApplication: 'Excel.Application',
  rpaTask: 'Find Empty Row',
  __v: 0,
};

const testAttributes3 = {
  _id: '6062f0ad1abb38158c2dfa43',
  activityId: 'Activity_1x8wlwh',
  ssotId: ssotId,
  rpaApplication: 'Browser',
  rpaTask: 'Open Browser',
  __v: 0,
};

const testParameter1 = {
  _id: '6062f0ad1abb38158c2dfa69',
  __v: 0,
  activityId: 'Activity_1elomab',
  ssotId: '606199015d691786a44a608f',
  rpaParameters: [
    {
      _id: '6062f0ad92ffd3044c6ee389',
      name: 'filename',
      type: 'String',
      isRequired: true,
      infoText: 'Path to filename',
      index: 0,
      value: 'C://Users/Filepath',
    },
  ],
};

const testParameter2 = {
  _id: '6062f0ad1abb38158c2dfa68',
  __v: 0,
  activityId: 'Activity_175v5b5',
  ssotId: '606199015d691786a44a608f',
  rpaParameters: [
    {
      _id: '6062f0ad92ffd3044c6ee388',
      name: 'filename',
      type: 'String',
      isRequired: true,
      infoText: 'Find Empty Row',
      index: 0,
      value: 'StonksOnlyGoUp.xls',
    },
  ],
};

const testParameter3 = {
  _id: '6062f0ad1abb38158c2dfa67',
  __v: 0,
  activityId: 'Activity_1x8wlwh',
  ssotId: '606199015d691786a44a608f',
  rpaParameters: [
    {
      _id: '6062f0ad92ffd3044c6ee387',
      name: 'save_changes',
      type: 'Boolean',
      isRequired: true,
      infoText: 'Open Browser',
      index: 0,
      value: 'http://localhost:3000',
    },
  ],
};

module.exports = {
  testSsot,
  testUserAccessObject,
  testUserAccessObject2,
  userId,
  user2Id,
  ssotId,
  testRpaTask1,
  testRpaTask2,
  testRpaTask3,
  testJob,
  testAttributes1,
  testAttributes2,
  testAttributes3,
  testParameter1,
  testParameter2,
  testParameter3,
};
