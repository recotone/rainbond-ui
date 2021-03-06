import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import {
  Table,
  Card,
  Row,
  Col,
  Radio,
  Input,
  Button,
  Icon,
  DatePicker,
  Tooltip,
  Menu,
  Dropdown,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from '../List/BasicList.less';
import globalUtil from '../../utils/global';
import InvoiceTab from '../../components/InvoiceTab';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

@connect(({ user, list, loading }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
}))
export default class BasicList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      showInfo: false,
    };
  }
  componentDidMount() {}
  showInfo = () => {
    this.setState({ showInfo: true });
  };
  InfoContent = () => {
    this.setState({ showInfo: false });
  };
  getInviceInfo = () => {
    this.setState({ list: [] });
  };
  render() {
    const { loading } = this.props;
    const columns = [
      {
        title: '申请时间',
        dataIndex: 'time',
      },
      {
        title: '发票类型',
        dataIndex: 'type',
      },
      {
        title: '抬头',
        dataIndex: 'company',
      },
      {
        title: '发票金额',
        dataIndex: 'money',
      },
      {
        title: '发票内容',
        dataIndex: 'content',
      },
      {
        title: '状态',
        dataIndex: 'zt',
      },
      {
        title: '快递编号',
        dataIndex: 'bh',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (val, data) => (
          <a href="javascript:;" onClick={this.showInfo.bind(this, val, data)}>
              查看
          </a>
        ),
      },
    ];
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        key: i,
        time: `${i}`,
        type: '10000',
        company: 'alipay',
        money: i,
        content: `${i}`,
        money: '10000',
        zt: 'alipay',
        bh: i,
        cz: i,
      });
    }
    const pageHeaderContent = (
      <Button style={{ float: 'right' }}>
        <a target="_blank" href="https://www.goodrain.com/spa/#/personalCenter/my/recharge">
          发票申请
        </a>
      </Button>
    );
    const rowSelection = {
      onChange: this.onSelectChange,
    };

    return (
      <PageHeaderLayout
        breadcrumbList={[
          {
            title: '首页',
            href: '/',
          },
          {
            title: '企业中心',
            href: `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/finance`,
          },
          {
            title: '发票查询',
            href: '',
          },
        ]}
        title="发票查询"
        content={pageHeaderContent}
      >
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="发票查询"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <Table dataSource={data} columns={columns} />
          </Card>
          {this.state.showInfo && (
            <InvoiceTab onOk={this.InfoContent} title="发票订单详情" onCancel={this.InfoContent} />
          )}
        </div>
      </PageHeaderLayout>
    );
  }
}
