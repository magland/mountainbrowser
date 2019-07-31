import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import Plot from 'react-plotly.js';
import AutocorrelogramsViewPython from './AutocorrelogramsView.py';
import ReactComponentPythonCompanion from '../ReactComponentPythonCompanion';

class CorrelogramPlot extends Component {
    state = {}
    render() {
        const { bin_edges, bin_counts, title, width, height } = this.props;
        return (
            <Plot
                data={[{
                    x: bin_edges.slice(0, bin_edges.length-1),
                    y: bin_counts,
                    type:'bar'
                }]}
                layout={{
                    width: width,
                    height: height,
                    title: title,
                    showlegend: false,
                    bargap: 0,
                    xaxis: {
                        autorange: false,
                        range: [bin_edges[0], bin_edges[bin_edges.length-1]],
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        ticks: '',
                        showticklabels: false
                    },
                    yaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        ticks: '',
                        showticklabels: false
                    },
                    margin: {
                        l: 20, r: 20, b: 0, t: 0
                    }
                }}
                config={(
                    {
                        displayModeBar: false,
                        responsive: false
                    }
                )}
            />
        );
    }
}

class AutocorrelogramsView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: '', // from python
            error: null, // from python
            output: null, // from python
            download_from: props.kacheryManager.enabledKacheryNames()
        }
        this.pythonCompanion = new ReactComponentPythonCompanion(this, AutocorrelogramsViewPython);
        this.pythonCompanion.syncPythonStateToState(['status', 'output', 'error'])
    }

    componentDidMount() {
        this._updateJavaScriptState();
        this.pythonCompanion.start();
    }
    componentWillUnmount() {
        this.pythonCompanion.stop();
    }
    componentDidUpdate(prevProps) {
        this._updateJavaScriptState();
    }
    _updateJavaScriptState() {
        this.pythonCompanion.setJavaScriptState({
            downloadFrom: this.props.kacheryManager.enabledKacheryNames(),
            firingsPath: this.props.firingsPath,
            samplerate: this.props.samplerate
        })
    }
    render() {
        const { status, output } = this.state;
        if (status === 'running') {
            return (
                <div>
                    Computing autocorrelograms...
                </div>
            )
        }
        else if (status === 'error') {
            return (
                <div>
                    Error computing autocorrelograms: {this.state.error}
                </div>
            )
        }
        else if (status === 'finished') {
            return (
                <Grid container>
                    {
                        output.autocorrelograms.map((ac) => (
                            <Grid item key={ac.unit_id}>
                                <CorrelogramPlot
                                    key={ac.unit_id}
                                    bin_counts={ac.bin_counts}
                                    bin_edges={ac.bin_edges}
                                    title={`Unit ${ac.unit_id}`}
                                    width={250}
                                    height={250}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            )
        }
        else {
            return <div>Unexpected status: {status}</div>
        }
    }
}

export default AutocorrelogramsView;