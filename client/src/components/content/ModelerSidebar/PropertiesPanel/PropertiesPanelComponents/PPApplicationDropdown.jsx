import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types'
import styles from '../../ModelerSidebar.module.css';

const { Option } = Select;

/**
 * @description Renders the application-dropdown based on passed list of applications.
 * @category Client
 * @component
 */
const PPApplicationDropdown = ({
  selectedActivity,
  onApplicationSelection,
  applications,
}) => {
  const localStorage = JSON.parse(sessionStorage.getItem('appTaskLocalStorage'));
  const matchingEntry = localStorage.find((element) => (element.activityId === selectedActivity));

  let defaultValue;
  if (matchingEntry) {
    defaultValue = matchingEntry.rpaApplication;
  }

  return (
    <>
      <Select
        className={styles['properties-panel-dropdown']}
        showSearch
        placeholder='Please select application'
        onChange={onApplicationSelection}
        defaultValue={defaultValue}
      >
        {applications.map((applicaton) => (
          <Option key={applicaton} value={applicaton}>
            {applicaton}
          </Option>
        ))}
      </Select>
    </>
  )
};

PPApplicationDropdown.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.shape).isRequired,
  onApplicationSelection: PropTypes.func.isRequired,
  selectedActivity: PropTypes.string.isRequired,
};

export default PPApplicationDropdown;
