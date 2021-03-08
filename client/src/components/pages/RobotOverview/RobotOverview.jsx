import React, { useState } from 'react';
import { Layout, Input, Space, Row } from 'antd';
import HeaderNavbar from '../../content/HeaderNavbar/HeaderNavbar';
import RobotContainer from '../../content/RobotContainer/RobotContainer'
import CreateRobotContainer from '../../content/RobotContainer/CreateRobotContainer'

const { Search } = Input;

/**
 * @description Overview page, where all robots are displayed and can be opened.
 * @category Client
 * @component
 */
const RobotOverview = () => {
  const [searchValue, setSearchValue] = useState('');

  /**
   * @description Handles the update when a new searchValue was entered
   */
  const updateSearchValue = (val) => {
    setSearchValue(val);
  };

  /**
   * @description Creates all boxes for the robots from the database
   * @returns All Boxes that match the current searchValue as React component
   */
  const createRobotBoxes = (searchValue2) => {
    // mock object (JSON of example-robots)
    const robotList = [{
      "robotMetadata": { "robotId": "#1234", "robotName": "EXCEL Workflow" }
    },
    {
      "robotMetadata": { "robotId": "#1234", "robotName": "alle E-Mails löschen" }
    },
    {
      "robotMetadata": { "robotId": "#1234", "robotName": "Daily CheckIn" }
    },
    {
      "robotMetadata": { "robotId": "#1234", "robotName": "Daily Checkout" }
    },
    {
      "robotMetadata": { "robotId": "#1234", "robotName": "Twitter checken" }
    },
    {
      "robotMetadata": { "robotId": "#1234", "robotName": "Login to PayPal" }
    },
    ];

    const filteredBotList = Object.values(robotList).filter((val) =>
      val.robotMetadata.robotName.toUpperCase().includes(searchValue2.toUpperCase()));

    return <>
      {filteredBotList.map((val) => (
        <RobotContainer robotName={val.robotMetadata.robotName} />
      ))}
    </>
  };

  return (
    <Layout>
      <HeaderNavbar selectedKey={1} />

      <Space style={{ padding: "1rem" }} direction='vertical' size='middle' >
        <Search placeholder='Search your Robot!' onSearch={updateSearchValue} enterButton />

        <Row gutter={[16, 16]} >
          <CreateRobotContainer />
          {createRobotBoxes(searchValue)}
        </Row>
      </Space>
    </Layout>
  )
};
export default RobotOverview;
