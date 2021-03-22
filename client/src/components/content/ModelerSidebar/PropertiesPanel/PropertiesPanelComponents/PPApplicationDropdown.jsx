/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import styles from '../../ModelerSidebar.module.css';

const { Option } = Select;

/**
 * @description Renders the application-dropdown based on passed list of applications.
 * @category Client
 * @component
 */
const PPApplicationDropdown = ({
  onApplicationSelection,
  currentSelection,
  applications,
}) => {
  const [applications2, setApplications] = useState([""]);

  useEffect(() => {
    applications().then(response => {
      setApplications(response)
    })

  }, [])

  return (
    <>
      <Select
        className={styles['properties-panel-dropdown']}
        showSearch
        placeholder='Please select application'
        onChange={onApplicationSelection}
        defaultValue={currentSelection}
      >
        {applications2.map((applicaton) => (
          <Option key={applicaton} value={applicaton}>
            {applicaton}
          </Option>
        ))}
      </Select>
    </>
  )
};

export default PPApplicationDropdown;
