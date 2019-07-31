import React, { Component } from 'react';
import EventAmplitudesViewPython from './EventAmplitudesView.py';
import UnitsTable from './UnitsTable';
import ReactComponentPythonCompanion from '../ReactComponentPythonCompanion';

class EventAmplitudesView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.pythonCompanion = new ReactComponentPythonCompanion(this, EventAmplitudesViewPython);
        this.pythonCompanion.syncPythonStateToState(['status', 'error', 'test']);
    }

    componentDidMount() {
        this.setState({status: 'running'});
        this.pythonCompanion.setJavaScriptState({
            downloadFrom: this.props.kacheryManager.enabledKacheryNames(),
            recordingPath: this.props.recordingPath,
            firingsPath: this.props.firingsPath
        })
        this.pythonCompanion.start();
    }
    componentWillUnmount() {
        this.pythonCompanion.stop();
    }
    componentDidUpdate(prevProps) {
    }
    render() {
        const { status, error, unitsInfo } = this.state;
        if (status === 'running') {
            return (
                <div>
                    Computing event amplitudes...
                </div>
            )
        }
        else if (status === 'error') {
            return (
                <div>
                    Error computing event amplitudes: {this.state.error}
                </div>
            )
        }
        else if (status === 'finished') {
            return (
                <div>Finished.</div>
            )
        }
        else {
            return <div>Unexpected status: {status}</div>
        }
    }
}

export default EventAmplitudesView;