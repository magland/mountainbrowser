import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import Sha1PathLink from '../spikeforestanalysis/Sha1PathLink';
import val2elmt from "./val2elmt";


class ElectricalSeriesView extends Component {
    state = {}
    render() {
        const { attrs, datasets, name } = this.props;
        let content;
        if (!attrs) {
            content = <div>Missing attrs</div>;
        }
        else if (!datasets) {
            content = <div>Missing datasets.</div>;
        }
        else if (!datasets.data) {
            content = <div>Missing dataset: data.</div>;
        }
        else {
            content = (
                <Table>
                    <TableBody>
                        <TableRow key="dtype">
                            <TableCell>Data type</TableCell>
                            <TableCell>{datasets.data._dtype || 'unknown'}</TableCell>
                        </TableRow>
                        <TableRow key="shape">
                            <TableCell>Shape</TableCell>
                            <TableCell>{(datasets.data._shape || []).join(' x ')}</TableCell>
                        </TableRow>
                        <TableRow key="data">
                            <TableCell>Data</TableCell>
                            <TableCell>{val2elmt(datasets.data._data)}</TableCell>
                        </TableRow>
                        <TableRow key="timestamps">
                            <TableCell>Timestamps</TableCell>
                            <TableCell>{val2elmt(datasets.timestamps._data)}</TableCell>
                        </TableRow>
                        <TableRow key="electrodes">
                            <TableCell>Electrodes</TableCell>
                            <TableCell>{val2elmt(datasets.electrodes._data)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );
        }
        return (
            <div>
                <h4>ElectricalSeries: {name}</h4>
                {content}

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

export default class ElectricalSeriesPlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        if (getNeurodataType(obj) === 'ElectricalSeries') {
            return [{
                component: <ElectricalSeriesView name={name} attrs={obj._attrs} datasets={obj._datasets || null} />,
                size: 'large'
            }];
        }
        else {
            return [];
        }
    }
};