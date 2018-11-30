import React, { PureComponent } from 'react';
import { Link,routerRedux } from 'dva/router';
import Search from '../Search';
import TcpDrawerForm from '../TcpDrawerForm';
import InfoConnectModal from '../InfoConnectModal';
import { connect } from 'dva';
import {
    Row,
    Col,
    Card,
    Table,
    Button,
    notification,
    Modal
} from 'antd';
import globalUtil from '../../utils/global';

@connect(
    ({ user, global }) => ({
        currUser: user.currentUser,
        groups: global.groups,
    }),
)
export default class TcpTable extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            TcpDrawerVisible: false,
            page_num: 1,
            page_size: 5,
            total: '',
            tcp_search: '',
            dataList: [],
            innerEnvs: [],
            information_connect_visible: false,
            editInfo: '',
            values: '',
            whether_open_form: false,
            tcpLoading: true
        }
    }
    componentWillMount() {
        this.load()
    }
    load = () => {
        const { dispatch } = this.props;
        const { page_num, page_size } = this.state;
        dispatch({
            type: "gateWay/queryTcpData",
            payload: {
                team_name: globalUtil.getCurrTeamName(),
                page_num,
                page_size
            },
            callback: (data) => {
                this.setState({
                    dataList: data.list,
                    loading: false,
                    total: data.bean.total,
                    tcpLoading: false
                })
            }
        })
    }
    handleClick = () => {
        this.setState({ TcpDrawerVisible: true })
    }
    handleClose = () => {
        this.setState({ TcpDrawerVisible: false, editInfo: '' })
    }
    rowKey = (record, index) => index

    onPageChange = (page_num) => {
        const { tcp_search } = this.state;
        // this.setState({ tcpLoading: true })
        if (tcp_search) {
            this.setState({ page_num }, () => {
                this.handleSearch(tcp_search, page_num);
            })
        } else {
            this.setState({ page_num,tcpLoading:true }, () => {
                this.load();
            })
        }
    }
    handleSearch = (search_conditions, page_num) => {
        this.setState({ tcpLoading: true })
        const { dispatch } = this.props;
        dispatch({
            type: "gateWay/searchTcp",
            payload: {
                search_conditions,
                team_name: globalUtil.getCurrTeamName(),
                page_num,
                page_size: this.state.page_size
            },
            callback: (data) => {
                this.setState({
                    total: data.bean.total,
                    dataList: data.list,
                    page_num: 1,
                    tcp_search: search_conditions,
                    tcpLoading: false,
                })
            }
        })
    }
    /**获取连接信息 */
    handleConectInfo = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: "gateWay/fetchEnvs",
            payload: {
                team_name: globalUtil.getCurrTeamName(),
                app_alias: record.service_alias,
            },
            callback: (data) => {
                this.setState({
                    innerEnvs: data.list || [],
                    information_connect_visible: true
                })
            }
        })
        this.setState({ InfoConnectModal: true })
    }
    handleCancel = () => {
        this.setState({ information_connect_visible: false })
    }
    handleDelete = (values) => {
        const { dispatch } = this.props;
        dispatch({
            type: "gateWay/deleteTcp",
            payload: {
                service_id: values.service_id,
                tcp_rule_id: values.tcp_rule_id,
                team_name: globalUtil.getCurrTeamName(),
            },
            callback: (data) => {
                data ? notification.success({ message: '删除成功' }) : notification.error({ message: '删除失败' })
                this.reload()
            }
        })
    }
    reload() {
        this.setState({
            page_num: 1,
        }, () => {
            this.load();
        })
    }

    handleOk = (values, obj) => {
        const { dispatch } = this.props;
        const { editInfo } = this.state;
        if (obj && obj.whether_open) {
            values.whether_open = true;
        }
        if (!editInfo) {
            dispatch({
                type: "gateWay/addTcp",
                payload: {
                    values,
                    team_name: globalUtil.getCurrTeamName()
                },
                callback: (data) => {
                    if (data && data.bean.is_outer_service == false) {
                        this.setState({
                            values
                        })
                        this.whether_open(values);
                        return;
                    }
                    data ? notification.success({ message: data.msg_show || '添加成功' }) : notification.error({ message: '添加失败' })
                    this.setState({
                        TcpDrawerVisible: false
                    })
                    this.reload()
                }
            })
        } else {
            dispatch({
                type: "gateWay/editTcp",
                payload: {
                    values,
                    team_name: globalUtil.getCurrTeamName(),
                    tcp_rule_id: editInfo.tcp_rule_id
                },
                callback: (data) => {
                    data ? notification.success({ message: data.msg_show || '编辑成功' }) : notification.error({ message: '编辑失败' })
                    this.setState({
                        TcpDrawerVisible: false
                    })
                    this.load()
                }
            })
        }
    }
    whether_open = () => {
        this.setState({
            whether_open_form: true
        })
        const { values } = this.state
        // this.handleOk(values, { whether_open: true })
    }
    handleEdit = (values) => {
        const { dispatch } = this.props;
        dispatch({
            type: "gateWay/queryDetail_tcp",
            payload: {
                tcp_rule_id: values.tcp_rule_id,
                team_name: globalUtil.getCurrTeamName(),
            },
            callback: (data) => {
                this.setState({
                    editInfo: data.bean,
                    TcpDrawerVisible: true
                })
            }
        })
    }
    resolveOk = () => {
        this.setState({
            whether_open_form: false
        }, () => {
            const { values } = this.state
            this.handleOk(values, { whether_open: true })
        })
    }
    saveForm = (form) => {
        this.form = form;
        const { editInfo } = this.state;
    }
    openService=(record)=>{
        this.props.dispatch(routerRedux.replace(`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/app/${record.service_alias}/port`))
    }
    render() {
        const columns = [{
            title: 'Endpoint',
            dataIndex: 'end_point',
            key: 'end_point',
            align: "left",
            // width: "25%",
        }, {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            align: "center",
            // width: "10%",
            render: (text, record, index) => {
                return (text == "0" ? (<span>默认</span>) : (<span>自定义</span>))
            }
        }, {
            title: '协议',
            dataIndex: 'protocol',
            key: 'protocol',
            align: "center",
            // width: "10%",
        }, {
            title: '应用',
            dataIndex: 'group_name',
            key: 'group_name',
            align: "center",
            render: (text, record) => {
                return (
                    record.is_outer_service == 0 ? <a href="" disabled>{text}</a> : <Link to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/groups/${record.group_id}/`}>{text}</Link>
                )
            }
        }, {
            title: '服务组件(端口)',
            dataIndex: 'container_port',
            key: 'container_port',
            align: "center",
            // width: "10%",
            render: (text, record) => {
                return (record.is_outer_service == 0 ? <a href="" disabled>{text}</a> : <Link to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/app/${record.service_alias}/`}>{record.service_cname}({text})</Link>)
            }
        }, {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            align: "center",
            // width: "20%",
            render: (data, record, index) => {
                return (
                    record.is_outer_service == 1 ? <div>
                        <a style={{ marginRight: "10px" }} onClick={this.handleConectInfo.bind(this, record)}>连接信息</a>
                        <a style={{ marginRight: "10px" }} onClick={this.handleEdit.bind(this, record)}>编辑</a>
                        <a onClick={this.handleDelete.bind(this, record)}>删除</a>
                    </div> :
                        <Tooltip placement="topLeft" title="请点击,开启对外访问地址方可操作" arrowPointAtCenter>
                            <div>
                                <a style={{ marginRight: "10px" }} disabled>连接信息</a>
                                <a style={{ marginRight: "10px" }} disabled>编辑</a>
                                <a style={{ marginRight: "10px" }} disabled>删除</a>
                            </div>
                        </Tooltip>
                    // <div>
                    //     {record.is_outer_service == 1? <a style={{ marginRight: "10px" }} onClick={this.handleConectInfo.bind(this, record)}>连接信息</a>:<a style={{ marginRight: "10px" }} disabled>连接信息</a>}
                    //     {record.is_outer_service == 1?<a style={{ marginRight: "10px" }} onClick={this.handleEdit.bind(this, record)}>编辑</a>:<a style={{ marginRight: "10px" }} disabled>编辑</a>}
                    //     {record.is_outer_service == 1?<a onClick={this.handleDelete.bind(this, record)}>删除</a>:<a style={{ marginRight: "10px" }} disabled>删除</a>}
                    // </div>
                )
            }
        }];
        const { total,
            page_num,
            page_size,
            dataList,
            innerEnvs,
            information_connect_visible,
            TcpDrawerVisible,
            whether_open_form
        } = this.state;
        return (
            <div>
                <Row style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "20px" }}>
                    <Search onSearch={this.handleSearch} />
                    <Button type="primary" icon="plus" style={{ position: "absolute", right: "0" }} onClick={this.handleClick}>
                        添加策略
                    </Button>
                </Row>
                <Card
                    bodyStyle={{ padding: "0" }}
                >
                    <Table
                        onRow={(record) => {
                            return {
                                onClick: () => {
                                    if (record.is_outer_service == 0) {
                                        this.openService(record);
                                    }
                                },

                            };
                        }}
                        rowKey={this.rowKey}
                        pagination={{ total: total, page_num: page_num, pageSize: page_size, onChange: this.onPageChange, current: page_num, }}
                        dataSource={dataList}
                        columns={columns}
                        loading={this.state.tcpLoading}
                    />
                </Card>
                {TcpDrawerVisible && <TcpDrawerForm visible={TcpDrawerVisible} onClose={this.handleClose} editInfo={this.state.editInfo} onOk={this.handleOk} ref={this.saveForm} />}
                {information_connect_visible && <InfoConnectModal visible={information_connect_visible} dataSource={innerEnvs} onCancel={this.handleCancel} />}
                {whether_open_form && <Modal
                    title="确认要添加吗？"
                    visible={this.state.whether_open_form}
                    onOk={this.resolveOk}
                    footer={[<Button type="primary" size="small" onClick={this.resolveOk}>确定</Button>]}
                >
                    <p>您选择的应用未开启外部访问，是否自动打开并添加此访问策略？</p>
                </Modal>}
            </div>
        )
    }
}