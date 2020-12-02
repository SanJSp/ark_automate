import React, { Component } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-font/dist/css/bpmn-embedded.css';
import { emptyBpmn } from '../assets/empty.bpmn';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
var convert = require('xml-js');

class BpmnModelerComponent extends Component {
  modeler = null;
  componentDidMount = () => {
    this.modeler = new BpmnModeler({
      container: '#bpmnview',
      keyboard: {
        bindTo: window,
      },
      propertiesPanel: {
        parent: '#propview',
      },
      additionalModules: [propertiesPanelModule, propertiesProviderModule],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });

    this.newBpmnDiagram();
  };

  newBpmnDiagram = () => {
    this.openBpmnDiagram(emptyBpmn);
  };

  openBpmnDiagram = (xml) => {
    this.modeler.importXML(xml, (error) => {
      if (error) {
        return console.log('fail import xml');
      }

      var canvas = this.modeler.get('canvas');

      canvas.zoom('fit-viewport');
    });
  };

  getBpmnDiagramXML = () => {
    this.modeler.saveXML().then((json) => {
      console.log(json.xml);
      var xml = json.xml;
      this.xmlToJson(xml);
    });
  };
  xmlToJson = (xml) => {
    var body = convert.xml2json(xml, { compact: true, spaces: 4 });
    console.log(body);
    fetch('/parse-xml', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  render = () => {
    return (
      <div id='bpmncontainer'>
        <div
          id='propview'
          style={{
            width: '25%',
            height: '98vh',
            float: 'right',
            maxHeight: '98vh',
            overflowX: 'auto',
          }}
        ></div>
        <div
          id='bpmnview'
          style={{ width: '75%', height: '98vh', float: 'left' }}
        >
          <button onClick={this.getBpmnDiagramXML}>XMLButton</button>
        </div>
      </div>
    );
  };
}

export default BpmnModelerComponent;
