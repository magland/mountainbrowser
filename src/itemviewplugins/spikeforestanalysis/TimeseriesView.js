import React, { Component } from 'react';
import TimeseriesViewPython from "./TimeseriesView.py";
import ReactComponentPythonCompanion from '../ReactComponentPythonCompanion';
import { Button } from '@material-ui/core';
import Mda from './Mda';
import TimeseriesWidget from "./TimeseriesWidget";
import TimeseriesModel from "./TimeseriesModel";

class TimeseriesView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timeseriesModelSet: false,
            numChannels: null, // from python state
            numTimepoints: null, // from python state
            samplerate: null, // from python state
            segmentSize: 1000,
            statusMessage: '', // from python state
            download_from: props.kacheryManager.enabledKacheryNames()
        }
        this.pythonCompanion = new ReactComponentPythonCompanion(this, TimeseriesViewPython);
        this.pythonCompanion.setJavaScriptState({
            recordingPath: props.recordingPath,
            downloadFrom: props.kacheryManager.enabledKacheryNames(),
            segmentSize: this.state.segmentSize
        });
        this.pythonCompanion.syncPythonStateToState(['numChannels', 'numTimepoints', 'samplerate', 'statusMessage']);
        this.timeseriesModel = null;
    }

    componentDidMount() {
        this.pythonCompanion.start();
        this.updateData();
    }
    componentWillUnmount() {
        this.pythonCompanion.stop();
    }
    componentDidUpdate(prevProps) {
        this.updateData();
    }
    updateData() {
        if (!this.state.numChannels) return;
        if (!this.timeseriesModel) {
            const params = {
                samplerate: this.state.samplerate,
                num_channels: this.state.numChannels,
                num_timepoints: this.state.numTimepoints,
                segment_size: this.state.segmentSize
            };
            this.timeseriesModel = new TimeseriesModel(params);
            this.setState({
                timeseriesModelSet: true
            });
            this.timeseriesModel.onRequestDataSegment((ds_factor, segment_num) => {
                let sr = this.pythonCompanion.getJavaScriptState('segmentsRequested') || {};
                let code = `${ds_factor}-${segment_num}`;
                sr[code] = { ds: ds_factor, ss: segment_num };
                this.pythonCompanion.setJavaScriptState({
                    segmentsRequested: sr
                });
            });
        }
        let SR = this.pythonCompanion.getJavaScriptState('segmentsRequested') || {};
        let keys = Object.keys(SR);
        let something_changed = false;
        for (let key of keys) {
            let aa = this.pythonCompanion.getPythonState(key) || null;
            if ((aa) && (aa.data)) {
                let X = new Mda();
                X.setFromBase64(aa.data);
                this.timeseriesModel.setDataSegment(aa.ds, aa.ss, X);
                delete SR[key];
                // delete SF[key];
                something_changed = true;
            }
        }
        if (something_changed) {
            this.pythonCompanion.setJavaScriptState({
                segmentsRequested: SR
            });
        }
    }
    render() {        
        if (this.state.timeseriesModelSet) {
            return (
                <div>
                    <TimeseriesWidget timeseriesModel={this.timeseriesModel} />
                    <div>{this.state.statusMessage}</div>
                </div>
            )
        }
        else {
            return <div>Loading...</div>;
        }
    }
}

export default TimeseriesView;