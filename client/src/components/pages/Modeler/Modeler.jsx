import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import BpmnModeler from '../../content/BpmnModeler/BpmnModeler';
import HeaderNavbar from '../../content/HeaderNavbar/HeaderNavbar';
import ModelerSidebar from '../../content/ModelerSidebar/ModelerSidebar';
import { getSsotFromDB } from '../../../api/ssotRetrieval';
import { getAvailableApplications } from '../../../api/applicationAndTaskSelection';
import { setRobotId, getAttributesFromDB, getParameterFromDB, getParameterForRobotFromDB } from '../../../utils/attributeAndParamUtils';
import initSessionStorage from '../../../utils/sessionStorage';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-font/dist/css/bpmn-embedded.css';

/**
 * @description Modeler page that enables the user to build a robot
 * @category Client
 * @component
 */
const Modeler = (match) => {
  const { robotId } = match.match.params;
  const [modeler, setModeler] = useState(null);
  const [robotName, setRobotName] = useState();

  const updateModeler = (updatedModeler) => {
    setModeler(updatedModeler);
  }

  /**
   * @description Equivalent to ComponentDidMount in class based components
   */
  useEffect(() => {
    getSsotFromDB(robotId)
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('ssotLocal', JSON.stringify(data));
        sessionStorage.setItem('robotName', data.robotName);
        setRobotName(data.robotName)
      })
      .catch((error) => {
        console.error(error);
      });
    getAttributesFromDB(robotId)
      .then((response) => response.json())
      .then((data) => {
        initSessionStorage('attributeLocalStorage', JSON.stringify([]));
        sessionStorage.setItem('attributeLocalStorage', JSON.stringify(data));
      })
    getParameterFromDB(robotId)
      .then((response) => response.json())
      .then((data) => {
        initSessionStorage('TaskApplicationCombinations', JSON.stringify([]));
        sessionStorage.setItem('TaskApplicationCombinations', JSON.stringify(data));
      })
    getParameterForRobotFromDB(robotId)
      .then((response) => response.json())
      .then((data) => {
        initSessionStorage('parameterLocalStorage', JSON.stringify([]));
        sessionStorage.setItem('parameterLocalStorage', JSON.stringify(data));
      })

    setRobotId(robotId);
    initSessionStorage('taskToApplicationCache', JSON.stringify({}));
    initSessionStorage('availableApplications', JSON.stringify([]));
    let applicationList = sessionStorage.getItem('availableApplications');
    applicationList = JSON.parse(applicationList)
    if (applicationList && applicationList.length < 1)
      getAvailableApplications()
        .then((response) => response.json())
        .then((data) => {
          sessionStorage.setItem('AvailableApplications', JSON.stringify(data));
        })
        .catch((error) => {
          console.error(error);
        });
  }, []);

  return (
    <>
      <HeaderNavbar selectedKey={2} />
      <Layout>
        <BpmnModeler robotId={robotId} robotName={robotName} onModelerUpdate={updateModeler} />
        {(modeler && robotName) && <ModelerSidebar modeler={modeler} robotId={robotId} robotName={robotName} />}
      </Layout>
    </>
  )
}

export default Modeler;
