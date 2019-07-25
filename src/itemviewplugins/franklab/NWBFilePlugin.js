import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell, TableHead, Paper, IconButton } from '@material-ui/core';
import val2elmt from "./val2elmt";
import { id } from 'postcss-selector-parser';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

function laststr(x) {
    let y = x.split('/');
    return y[y.length - 1];
}

class NDTableView extends Component {
    state = {
    }
    render() {
        const { object, columns } = this.props;

        let inds = [];
        for (let i = 0; i < object._datasets[columns[0].name]._data.length; i++) {
            inds.push(i);
        }
        return (
            <ScrollArea maxHeight={this.props.maxHeight || 20000}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {
                                columns.map((cc) => (
                                    <TableCell key={cc.name}>{cc.label}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            inds.map((ind) => (
                                <TableRow key={ind}>
                                    {
                                        columns.map((cc) => {
                                            let val = object._datasets[cc.name]._data[ind];
                                            if (cc.format)
                                                val = cc.format(val);
                                            return <TableCell key={cc.name}>{val}</TableCell>;
                                        })
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </ScrollArea>
        );
    }
}

class Collapsible extends Component {
    state = {
        expanded: true
    }
    toggle = () => {
        this.setState({
            expanded: !this.state.expanded
        })
    }
    render() {
        if (!this.props.collapsible) {
            return (
                <span>
                    <h4>{this.props.title}</h4>
                    {this.props.children}
                </span>
            );
        }
        else if (this.state.expanded) {
            return (
                <span>
                    <h4><IconButton onClick={this.toggle}><FaChevronDown /></IconButton> {this.props.title}</h4>
                    {this.props.children}
                </span>
            );
        }
        else {
            return (
                <span>
                    <h4><IconButton onClick={this.toggle}><FaChevronRight /></IconButton> {this.props.title}</h4>
                </span>
            );
        }
    }
}


class EpochsView extends Component {
    state = {
    }
    render() {
        const { epochs } = this.props;
        const t0 = epochs._datasets.start_time._data[0];
        const columns = [
            { name: 'id', label: 'Epoch' },
            { name: 'start_time', label: 'Start (sec)', format: (x) => ((x - t0).toFixed(3)) },
            { name: 'stop_time', label: 'Stop (sec)', format: (x) => ((x - t0).toFixed(3)) },
            { name: 'apparatus', label: 'Apparatus' },
            { name: 'exposure', label: 'Exposure' },
            { name: 'task', label: 'Task' }
        ];
        return (
            <div>
                <Collapsible title='Epochs' collapsible={this.props.collapsible}>
                    <NDTableView object={epochs} columns={columns} maxHeight={this.props.maxHeight} />
                </Collapsible>
            </div>
        );
    }
}

class ElectrodesView extends Component {
    state = {
    }
    render() {
        const { electrodes } = this.props;
        const columns = [
            { name: 'id', label: 'Epoch' },
            { name: 'x', label: 'X' },
            { name: 'y', label: 'Y' },
            { name: 'z', label: 'Z' },
            { name: 'location', label: 'Location' },
            { name: 'filtering', label: 'Filtering' },
            { name: 'group', label: 'Group' }
        ];
        return (
            <div>
                <Collapsible title='Electrodes' collapsible={this.props.collapsible}>
                    <NDTableView object={electrodes} columns={columns} maxHeight={this.props.maxHeight} />
                </Collapsible>
            </div>
        );
    }
}

class UnitsView extends Component {
    state = {
    }
    render() {
        const { units } = this.props;
        const columns = [
            { name: 'id', label: 'Epoch' },
            { name: 'cluster_name', label: 'Cluster name' },
            { name: 'sorting_metric', label: 'Sorting metric' },
            { name: 'electrodes', label: 'Electrodes' },
            { name: 'electrode_group', label: 'Electrode group' }
        ];
        return (
            <div>
                <Collapsible title='Units' collapsible={this.props.collapsible}>
                    <NDTableView object={units} columns={columns} maxHeight={this.props.maxHeight} />
                </Collapsible>
            </div>
        );
    }
}

class ScrollArea extends Component {
    state = {}
    render() {
        return (
            <div style={{ maxHeight: this.props.maxHeight, overflow: 'auto' }}>
                {this.props.children}
            </div>
        );
    }
}


class NWBFileView extends Component {
    state = {}
    render() {
        const { object } = this.props;
        const epochs = (object.intervals || {}).epochs;
        const electrodes = ((object.general || {}).extracellular_ephys || {}).electrodes;
        const units = object.units;
        console.log(units);
        return (
            <div>
                {
                    epochs ? (
                        <Paper style={{marginTop:100}}>
                            <EpochsView epochs={epochs} collapsible={true} />
                        </Paper>
                    ) : (<span></span>)
                }
                {
                    electrodes ? (
                        <Paper style={{marginTop:100}}>
                            <ElectrodesView electrodes={electrodes} maxHeight={300} collapsible={true} />
                        </Paper>
                    ) : (<span></span>)
                }
                {
                    units ? (
                        <Paper style={{marginTop:100}}>
                            <UnitsView units={units} maxHeight={300} collapsible={true} />
                        </Paper>
                    ) : (<span></span>)
                }

            </div>
        );
    }
}

function getNeurodataType(obj) {
    if ('_attrs' in obj) {
        if ('neurodata_type' in obj._attrs) {
            return obj._attrs.neurodata_type + '';
        }
    }
    return null;
}

export default class NwbFilePlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        if (getNeurodataType(obj) === 'NWBFile') {
            return [{
                component: (
                    <NWBFileView
                        object={obj}
                    />
                ),
                size: 'large'
            }];
        }
        else if (getNeurodataType(obj) === 'Units') {
            return [{
                component: <UnitsView units={obj} />,
                size: 'large'
            }];
        }
        else if (getNeurodataType(obj) === 'TimeIntervals') {
            return [{
                component: <EpochsView epochs={obj} />,
                size: 'large'
            }];
        }
        else if ((name === 'intervals') && (obj.epochs)) {
            return [{
                component: <EpochsView epochs={obj.epochs} maxHeight={500} />,
                size: 'large'
            }];
        }
        else if ((name === 'general') && (obj.extracellular_ephys) && (obj.extracellular_ephys.electrodes)) {
            return [{
                component: <ElectrodesView electrodes={obj.extracellular_ephys.electrodes} maxHeight={500} />,
                size: 'large'
            }];
        }
        else if ((name == 'extracellular_ephys') && (obj.electrodes)) {
            return [{
                component: <ElectrodesView electrodes={obj.electrodes} maxHeight={500} />,
                size: 'large'
            }];
        }
        else {
            return [];
        }
    }
};