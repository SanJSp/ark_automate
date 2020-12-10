import React from 'react';
import BtnGotoHome from '../components/BtnGotoHome.jsx';
import BtnGotoModeler from '../components/BtnGotoModeler.jsx';
import HeaderNavbar from '../components/headerNavbar/HeaderNavbar';
import { Layout, Typography } from 'antd';

const { Title } = Typography;

const Error = () => {
    return (
        <div>
            <Layout>
                <HeaderNavbar selectedKey={3} />
                <br />
                <Title style={{ paddingLeft: '30px' }}>Error: Page does not exist!</Title>
                <div className='rowC'>
                    <BtnGotoHome />
                    <BtnGotoModeler />
                </div>
            </Layout>
        </div>
    );
}

export default Error;
