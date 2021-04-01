import React from 'react';
import { Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import corporateDesign from '../../../../layout/corporateDesign';

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
}) => (
  <>
    <Input
      placeholder={variableName}
      defaultValue={value}
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

RobotInteractionInputParameter.propTypes = {
  variableName: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  dataType: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default RobotInteractionInputParameter;
