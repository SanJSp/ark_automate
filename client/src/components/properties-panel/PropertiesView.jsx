import { is } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component } from 'react';

import './PropertiesView.css';

var applicationsOptions, taskOptions;

function applicationSelected(event) {
  console.log(event.target.value);
  (async () => {
    let myFetch = await /*this.*/fetchTasksForApplication(event.target.value);
    console.log(myFetch);
    taskOptions = myFetch.map((task) => (
      <option value={task}>{task}</option>
    ));
  })()

  async function fetchTasksForApplication(value) {
    return await fetch('get-available-tasks-for-application?application=' + value.replace(' ', '+'))
      .then((response) => response.json())
      .then(data => {
        return data;
      })
  };
}

export default class PropertiesView extends Component {
  constructor(props) {
    super(props);
    this.applicationDropdownRef = React.createRef();
    this.state = {
      selectedElements: [],
      element: null,
    };
  }

  /* getApplication() {
    let dropdown = this.applicationDropdownRef.current;
    console.log(dropdown);
    let app = dropdown.options[dropdown.selectedIndex].value;
    console.log(app);
    return app;
  } */

  componentDidMount() {
    async function fetchApplicationsFromDatabase() {
      return await fetch('/get-available-applications')
        .then((response) => response.json())
        .then(data => {
          return data;
        })
    };

    (async () => {
      let myFetch = await fetchApplicationsFromDatabase();
      applicationsOptions = myFetch.map((app) => (
        <option value={app}>{app}</option>
      ));
    })()

    const { modeler } = this.props;

    modeler.on('selection.changed', (e) => {
      const { element } = this.state;

      this.setState({
        selectedElements: e.newSelection,
        element: e.newSelection[0],
      });
    });

    modeler.on('element.changed', (e) => {
      const { element } = e;

      const { element: currentElement } = this.state;

      if (!currentElement) {
        return;
      }

      // update panel, if currently selected element changed
      if (element.id === currentElement.id) {
        this.setState({
          element,
        });
      }
    });
  }

  render() {
    const { modeler, application } = this.props;

    const { selectedElements, element } = this.state;

    return (
      <div>
        {selectedElements.length === 1 && (
          <PropertyPanelBuilder modeler={modeler} element={element} />
        )}

        {selectedElements.length === 0 && (
          <span>Please select an element.</span>
        )}

        {selectedElements.length > 1 && (
          <span>Please select a single element.</span>
        )}
      </div>
    );
  }
}

function PropertyPanelBuilder(props) {
  let { element, modeler } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  function updateName(name) {
    const modeling = modeler.get('modeling');

    modeling.updateLabel(element, name);
  }

  function updateTopic(topic) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:topic': topic,
    });
  }

  /*   function makeMessageEvent() {
      const bpmnReplace = modeler.get('bpmnReplace');
  
      bpmnReplace.replaceElement(element, {
        type: element.businessObject.$type,
        eventDefinitionType: 'bpmn:TimerEventDefinition',
      });
    } */


  function makeServiceTask(name) {
    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask',
    });
  }

  function attachTimeout() {
    const modeling = modeler.get('modeling');
    const autoPlace = modeler.get('autoPlace');
    const selection = modeler.get('selection');

    const attrs = {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
    };

    const position = {
      x: element.x + element.width,
      y: element.y + element.height,
    };

    const boundaryEvent = modeling.createShape(attrs, position, element, {
      attach: true,
    });

    const taskShape = append(boundaryEvent, {
      type: 'bpmn:Task',
    });

    selection.select(taskShape);
  }

  function isTimeoutConfigured(element) {
    const attachers = element.attachers || [];

    return attachers.some((e) => hasDefinition(e, 'bpmn:TimerEventDefinition'));
  }

  function append(element, attrs) {
    const autoPlace = modeler.get('autoPlace');
    const elementFactory = modeler.get('elementFactory');

    var shape = elementFactory.createShape(attrs);

    return autoPlace.append(element, shape);
  }

  //maybe interesting Stuff for JSON-Testing
  /* const applicationsJSON = {
    applications: [
      { appID: 'word', appLabel: 'Microsoft Word' },
      { appID: 'excel', appLabel: 'Microsoft EXCEL' },
    ],
  }; */

  return (
    <div className='element-properties' key={element.id}>
      <fieldset>
        <label>id</label>
        <span>{element.id}</span>
      </fieldset>

      <fieldset>
        <label>name</label>
        <input
          value={element.businessObject.name || ''}
          onChange={(event) => {
            updateName(event.target.value);
          }}
        />
      </fieldset>

      {is(element, 'custom:TopicHolder') && (
        <fieldset>
          <label>topic (custom)</label>
          <input
            value={element.businessObject.get('custom:topic')}
            onChange={(event) => {
              updateTopic(event.target.value);
            }}
          />
        </fieldset>
      )}

      <fieldset>
        <label>actions</label>

        {is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask')}

        {
          is(element, 'bpmn:Task') && (
            <>
              <button onClick={makeServiceTask}>Make RPA Task</button>
              <select onChange={applicationSelected /*this.applicationSelected.bind(this)*/} id="applicationSelector">
                <option value='' disabled selected>
                  Please Select
                </option>
                {applicationsOptions}
              </select>

              <select>
                <option value='' disabled selected>
                  Please Select
                </option>
                {taskOptions}
              </select>
            </>
          )
        }

        {/* is(element, 'bpmn:Task') && !isTimeoutConfigured(element) &&
                    <button onClick={ attachTimeout }>Attach Timeout</button> */}
      </fieldset>
    </div >
  );
}

// helpers ///////////////////

function hasDefinition(event, definitionType) {
  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some((d) => is(d, definitionType));
}
