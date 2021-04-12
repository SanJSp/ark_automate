import React from 'react';
import { Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import corporateDesign from '../../../../layout/corporateDesign';
import { setSingleParameter } from '../../../../utils/attributeAndParamUtils';

/**
 * @description Renders a parameter input field for a given variable
 * @category Client
 * @component
 */
const RobotInteractionInputParameter = ({
  variableName,
  isRequired,
  // eslint-disable-next-line no-unused-vars
  dataType,
  value,
  activityId,
}) => {
  /**
   * @description Gets called when the value in a single input field for the parameters has been changed and updates
   * the values in the ssot
   * @param {Object} value new value of input field
   */
  const updateParameterValue = (event) => {
    console.log('activityId: ', event.target.value);
    setSingleParameter(activityId, event);
  };

  return (
    <>
      <Input
        placeholder={variableName}
        defaultValue={value}
        onChange={updateParameterValue}
        suffix={
          isRequired && (
            <Tooltip title='This field is required for the task to work'>
              <InfoCircleOutlined
                style={{ color: corporateDesign.colorBackgroundCta }}
              />
            </Tooltip>
          )
        }
      />
    </>
  );
};

RobotInteractionInputParameter.propTypes = {
  variableName: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  dataType: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  activityId: PropTypes.string.isRequired,
};

export default RobotInteractionInputParameter;
