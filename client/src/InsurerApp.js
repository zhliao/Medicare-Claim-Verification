import React, { Component } from "react";
import $ from 'jquery'
import getWeb3 from "./utils/getWeb3";
import { Table, TabContent, TabPane, Nav, NavItem, NavLink, Card, CardBody, CardGroup, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import "./App.css";
import Provider from "./contracts/Provider.json";
import Banner from './components/Banner'
import Header from './components/Header'

export class InsurerApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: this.props.web3,
            accounts: this.props.accounts,
            insContract: this.props.insContract,
            activeTab: '1',
            tokens: 0
        };
        this.unv = []
        this.ver = []
        this.insurername = this.props.username;
        this.toggle = this.toggle.bind(this);
        this.getAllServices = this.getAllServices.bind(this)
        this.updateTokens = this.updateTokens.bind(this)
        this.copyID = this.copyID.bind(this);
    }

    copyID(val) {
        var copyhelper = document.createElement("input");
        copyhelper.className = 'copyhelper'
        document.body.appendChild(copyhelper);
        copyhelper.value = val;
        copyhelper.select();
        document.execCommand("copy");
        document.body.removeChild(copyhelper);
    }

    componentDidMount = async () => {
        var _ = this;
        const { accounts, insContract } = _.state;
        try {
            var providerAddrs = await insContract.methods.getProviders().call();
            if(providerAddrs.length === 0){
                console.log('adding initial provider')
                const addedProvider = await insContract.methods.addProvider('UCSD Medical').send({ from: accounts[0]});
                const newProviderAddress = await insContract.methods.getNewProvider('UCSD Medical').call();
                console.log('New Provider Contract Address added', newProviderAddress)
                // Send "UCSD Medical and newAddress back to App.js"
                _.props.addProContractAddress(newProviderAddress)
            }
            else {
                providerAddrs = await insContract.methods.getProviders().call();
                _.props.addProContractAddress(providerAddrs[0]);
            }

            console.log("Providers: ", providerAddrs);
        }
        catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }

        _.getInsurerInfo();
        _.updateTokens();
        _.getAllServices();
        setInterval(function () {
            console.log('getting info')
            _.getAllServices();
            _.updateTokens();
        }, 5000);
    }

    updateTokens = async () => {
        const { accounts, insContract } = this.state;
        const balance = await insContract.methods.getBalance().call();
        this.setState({tokens: balance})
    }

    getInsurerInfo = async () => {
        const { accounts, insContract } = this.state;
        const info = await insContract.methods.getInfo().send({ from: accounts[0] });
        console.log('calling getInsurerInfo ', info.events.InsurerInfo.returnValues);
        // info.events.InsurerInfo.returnValues
    }

    getAllServices = async () => {
        //const accounts = await web3.eth.getAccounts();
        const { accounts, insContract } = this.state;
        const ver = await insContract.methods.getAllVerifiedClaims().call();
        const unv = await insContract.methods.getAllUnverifiedClaims().call();
        let verlist = []
        let unvlist = []
        for(let i = 0; i < ver.length; i++){
            let addr = ver[i]
            const amount = await insContract.methods.getServiceClaimAmount(addr).call();
            const id = await insContract.methods.getServiceClaimId(addr).call();
            const info = await insContract.methods.getServiceClaimInfo(addr).call();
            console.log('what is this ver info,', info)
            const claimname = info.name;
            const patientname = info.patName;
            const providername = await insContract.methods.getProvider(info.provAddr).call();
            const timeP = await insContract.methods.getServiceClaimTimeProvided(addr).call();
            const timeF = await insContract.methods.getServiceClaimTimeFiled(addr).call();
            const timeV = await insContract.methods.getServiceClaimTimeVerified(addr).call();
            const confirmed = await insContract.methods.getServiceClaimConfirmed(addr).call();
            verlist.push({claimname, patientname, providername, amount, id, timeP, timeF, timeV, confirmed})
        }
        for(let i = 0; i < unv.length; i++){
            let addr = unv[i]
            const amount = await insContract.methods.getServiceClaimAmount(addr).call();
            const id = await insContract.methods.getServiceClaimId(addr).call();
            const info = await insContract.methods.getServiceClaimInfo(addr).call();
            console.log('what is this unv info,', info)
            const claimname = info.name;
            const patientname = info.patName;
            const providername = await insContract.methods.getProvider(info.provAddr).call();
            const timeP = await insContract.methods.getServiceClaimTimeProvided(addr).call();
            const timeF = await insContract.methods.getServiceClaimTimeFiled(addr).call();
            unvlist.push({claimname, patientname, providername, amount, id, timeP, timeF})
        }
        this.ver = verlist
        this.unv = unvlist;
        console.log('what is ver ', this.ver)
        console.log('what is unv ', this.unv)
        this.setState({ state: this.state });
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <div>
                <Header />
                <div style={{ width: '80%', margin: 'auto' }}>
                <Banner tokens={this.state.tokens} name={this.insurername} dashboard={'Insurer'} />
                <Nav tabs style={{ justifyContent: 'center', backgroundColor: '#dee2e6' }}>
                    <NavItem id='navItem'>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '1' })}
                            onClick={() => { this.toggle('1'); }}>
                            Verified Claims
            </NavLink>
                    </NavItem>
                    <NavItem id='navItem'>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '2' })}
                            onClick={() => { this.toggle('2'); }}>
                            Unverified Claims
            </NavLink>
                    </NavItem>
                </Nav>
                <TabContent style={{ textAlign: 'center', padding: '50px', borderLeft: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6' }} activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Table responsive bordered style={this.props.style}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Service</th>
                                    <th>Provider</th>
                                    <th>Amount</th>
                                    <th>Time of Provision</th>
                                    <th>Time of Filing</th>
                                    <th>Time of Confirmation</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.ver.length > 0 ?
                                        this.ver.map((output, i) => {
                                            return <tr key={i}>
                                                <td><button className='link' title='Copy ID' onClick={() => this.copyID(output.id)}>
                                                    {output.id.substring(0, 8)}...
                                                    </button></td>
                                                <td>{output.patientname}</td>
                                                <td>{output.claimname}</td>
                                                <td>{output.providername}</td>
                                                <td>{output.amount}</td>
                                                <td>{new Date(parseInt(output.timeP, 10)).toString().split('-')[0]}</td>
                                                <td>{new Date(parseInt(output.timeF, 10)).toString().split('-')[0]}</td>
                                                <td>{new Date(parseInt(output.timeV, 10)).toString().split('-')[0]}</td>
                                                <td>{output.confirmed ? <span style={{ color: 'green' }}>Confirmed</span> :
                                                    <span style={{ color: 'red' }}>Disputed</span>}</td>
                                            </tr>
                                        }) : null
                                }
                            </tbody>
                        </Table>
                    </TabPane>
                    <TabPane tabId="2">
                        <Table responsive bordered style={this.props.style}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Service</th>
                                    <th>Provider</th>
                                    <th>Amount</th>
                                    <th>Time of Provision</th>
                                    <th>Time of Filing</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.unv.length > 0 ?
                                        this.unv.map((output, i) => {
                                            return <tr key={i}>
                                                <td><button id='link' className='link' title='Copy ID' onClick={() => this.copyID(output.id)}>
                                                    {output.id.substring(0, 8)}...
                                                    </button></td>
                                                <td>{output.patientname}</td>
                                                <td>{output.claimname}</td>
                                                <td>{output.providername}</td>
                                                <td>{output.amount}</td>
                                                <td>{new Date(parseInt(output.timeP, 10)).toString().split('-')[0]}</td>
                                                <td>{new Date(parseInt(output.timeF, 10)).toString().split('-')[0]}</td>
                                            </tr>
                                        }) : null
                                }
                            </tbody>
                        </Table>
                    </TabPane>
                </TabContent>
            </div>
            </div>
        );
    }
}

export default InsurerApp;
