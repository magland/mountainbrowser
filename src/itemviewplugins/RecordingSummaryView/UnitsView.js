import React, { Component } from 'react';
import UnitsViewPython from './UnitsView.py';
import UnitsTable from './UnitsTable';
import ReactComponentPythonCompanion from '../ReactComponentPythonCompanion';

class UnitsView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.pythonCompanion = new ReactComponentPythonCompanion(this, UnitsViewPython);
        this.pythonCompanion.syncPythonStateToState(['status', 'error', 'unitsInfo']);
    }

    componentDidMount() {
        this.setState({status: 'running'});
        this.pythonCompanion.setJavaScriptState({
            downloadFrom: this.props.kacheryManager.enabledKacheryNames(),
            recordingPath: this.props.recordingPath,
            firingsPath: this.props.firingsPath,
            samplerate: this.props.samplerate
        })
        this.pythonCompanion.start();
    }
    componentWillUnmount() {
        this.pythonCompanion.stop();
    }
    componentDidUpdate(prevProps) {
    }
    _handleUnitSelected = (unitInfo) => {
        this.props.onUnitSelected && this.props.onUnitSelected(unitInfo);
    }
    render() {
        const { status, error, unitsInfo } = this.state;
        if (status === 'running') {
            return (
                <div>
                    Computing units info...
                </div>
            )
        }
        else if (status === 'error') {
            return (
                <div>
                    Error computing units info: {this.state.error}
                </div>
            )
        }
        else if (status === 'finished') {
            return (
                <UnitsTable
                    unitsInfo={unitsInfo}
                    onUnitSelected={this._handleUnitSelected}
                />
            )
        }
        else {
            return <div>Unexpected status: {status}</div>
        }
    }
}

export default UnitsView;