import React, { Component } from 'react';
import { Button, Table, TableBody, TableRow, TableCell, Grid } from '@material-ui/core';
import ComputeAutocorrelogramsJob from "./python/ComputeAutocorrelograms.json";
import Plot from 'react-plotly.js';

const STATUS_WAITING = 'waiting';
const STATUS_RUNNING = 'running';
const STATUS_ERROR = 'error';
const STATUS_FINISHED = 'finished';

async function computeAutoCorrelograms(kacheryManager, firingsPath, samplerate) {
    let result = await window.executeJob(
        ComputeAutocorrelogramsJob,
        { samplerate: samplerate, firings_path: firingsPath },
        { download_from: 'spikeforest.public' }
    )
    if (!result) {
        return {
            success: false,
            error: 'Error executing job.'
        };
    }
    let txt = await kacheryManager.loadText(result.console_out);
    console.log(txt);
    if (result.retcode !== 0) {
        return {
            success: false,
            error: `Error running ComputeAutocorrelograms`
        }
    }
    let output = await kacheryManager.loadObject(result.outputs.json_out)
    return {
        success: true,
        output: output
    };
}

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
    state = {
        status: STATUS_WAITING,
        error: null,
        output: null
    }
    componentDidMount() {
        this.setState({
            status: STATUS_WAITING
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                status: STATUS_WAITING
            });
        }
    }
    startCompute = async () => {
        this.setState({
            status: STATUS_RUNNING
        });
        let x = await computeAutoCorrelograms(this.props.kacheryManager, this.props.firingsPath, this.props.samplerate);
        if (x.success) {
            this.setState({
                status: STATUS_FINISHED,
                output: x.output
            });
        }
        else {
            this.setState({
                status: STATUS_ERROR,
                error: x.error
            });
        }
    }
    render() {
        const { status, output } = this.state;
        if (status === STATUS_WAITING) {
            return (
                <div>
                    <Button onClick={this.startCompute}>Compute autocorrelograms...</Button>
                </div>
            )
        }
        else if (status === STATUS_RUNNING) {
            return (
                <div>
                    Computing autocorrelograms...
                </div>
            )
        }
        else if (status === STATUS_ERROR) {
            return (
                <div>
                    Error computing autocorrelograms: {this.state.error}
                </div>
            )
        }
        else {
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
    }
}

export default AutocorrelogramsView;