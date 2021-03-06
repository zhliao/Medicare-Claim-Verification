import React, { Component } from "react";
import { Button, CardHeader, Card, Input, CardTitle, CardText, CardGroup, CardBody, CardSubtitle, Col, Row } from 'reactstrap';
import "./PatientCell.css"
import "./ToggleSwitch.css"
// import { arrayify } from "ethers/utils";

class ServiceCell extends Component {
    constructor(props) {
        super(props);
        this.checked = false;
        this.updateChecked = this.updateChecked.bind(this)
        this.verifyClaim = this.verifyClaim.bind(this)
        this.copyID = this.copyID.bind(this);
        this.id = 'togBtn' + this.props.i;
        this.timeFiled = new Date(parseInt(this.props.timeFiled, 10)).toString().split('-')[0]
        this.timeProvided = new Date(parseInt(this.props.timeProvided, 10)).toString().split('-')[0]
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

    updateChecked() {
        this.checked = document.getElementById("togBtn" + this.props.i).checked;
    }

    verifyClaim() {
        console.log('on verifyClaim, this.checked is', this.checked)
        this.props.verifyClaim(this.props.serviceAddr, this.checked)
        this.checked = false;
        document.getElementById(this.id).checked = false;
        for(let index = this.props.i; index < this.props.arrLength - 1; index++){
            document.getElementById('togBtn'+index).checked = document.getElementById("togBtn"+(index+1)).checked;
            this.checked = document.getElementById("togBtn"+index).checked
            console.log(index, this.checked)
        }
        this.props.deleteClaimFromList(this.props.i)
    }

    render() {
        console.log('switch status', this.checked)
        return (
            <CardGroup style={{ padding: '50px' }}>
                <Card body outline color="primary">
                    <CardHeader>{this.props.serviceName}</CardHeader>
                    <CardBody>
                        <Row>
                            <Col md={8} style={{ maxWidth: '50%' }}>
                                <CardTitle>Service Provided Date: {this.timeProvided}</CardTitle>
                                <CardTitle>Service Filing Date: {this.timeFiled}</CardTitle>
                                <CardTitle>Service Claim ID: <button id='link' className='link' title='Copy ID' onClick={() => this.copyID(this.props.serviceAddr)}>
                                                        {this.props.serviceAddr.substring(0, 8)}...
                                                    </button></CardTitle>                            
                            </Col>
                            <Col md={8} style={{ textAlign: 'right', maxWidth: '50%' }}>
                                <CardText>Confirm claim</CardText>
                                <div style={{ display: "inline-flex" }}>
                                    <label className="switch"><input type="checkbox" id={this.id} onClick={this.updateChecked} /><div className="slider round"><span className="on">Yes</span><span className="off">No</span></div></label>
                                </div>

                            </Col>
                        </Row>
                        <br></br>
                        <Input type="textarea" placeholder="(Optional) Please give us feedback, concerns, or just anything you wish to say..." />
                        <br></br>
                        <Button style={{ float: 'right' }} color="success" onClick={this.verifyClaim}>Verify</Button>
                    </CardBody>
                </Card>
            </CardGroup>
        );
    }
}

export default ServiceCell;