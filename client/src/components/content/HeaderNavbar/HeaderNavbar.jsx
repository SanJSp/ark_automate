/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import logoCTA from '../../../resources/assets/images/logo_cta.png';

const { Header } = Layout;

/**
 * @component
 * @description Renders the header navbar for all pages and initially selects the passed key-element.
 * @example return <HeaderNavbar selectedKey={2} />
 */
const HeaderNavbar = (props) => (
  <Header>
    <Menu
      theme='dark'
      mode='horizontal'
      // eslint-disable-next-line react/prop-types
      defaultSelectedKeys={[props.selectedKey.toString()]}
    >
      <Link to='/'>
        <img style={{ margin: '0 1rem 0 -1rem', height: '3rem' }} src={logoCTA} alt='ark_automate Icon' />
      </Link>
      <Menu.Item key='1'>
        Overview
        <Link to='/robot_overview' />
      </Menu.Item>
      <Menu.Item key='2'>
        Modeler
        <Link to='/modeler' />
      </Menu.Item>
      <Menu.Item key='3'>
        Robot File
        <Link to='/robotfile' />
      </Menu.Item>
    </Menu>
  </Header>
);
export default HeaderNavbar;
