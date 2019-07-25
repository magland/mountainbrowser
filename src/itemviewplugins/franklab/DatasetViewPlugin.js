import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell, TableHead, Link } from '@material-ui/core';
import val2elmt from "./val2elmt";

function Link2(props) {
    return (
        <Link
            component="button" variant="body2"
            onClick={props.onClick}
        >
            {props.children}
        </Link>
    )
}

class DatasetView extends Component {
    state = {}
    render() {
        const { shape, data, name } = this.props;
        return (
            <div>
                <h4>Dataset: {name}</h4>
                <Table>
                    <TableBody>
                        <TableRow key="shape">
                            <TableCell>Shape</TableCell>
                            <TableCell>{(shape || []).join(' x ')}</TableCell>
                        </TableRow>
                        <TableRow key="data">
                            <TableCell>Data</TableCell>
                            <TableCell>{val2elmt(data)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}

class DatasetListView extends Component {
    state = {}
    render() {
        const { object } = this.props;
        const keys = Object.keys(object);
        console.log('----', keys, object);
        return (
            <div>
                <h4>Datasets</h4>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Shape</TableCell>
                            <TableCell>Dtype</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            keys.map((key) => (
                                <TableRow key={key}>
                                    <TableCell><Link2 onClick={() => {this.props.onOpenDataset(key)}}>{key}</Link2></TableCell>
                                    <TableCell>{(object[key]._shape || []).join(' x ')}</TableCell>
                                    <TableCell>{object[key]._dtype}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

export default class DatasetViewPlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        if (name === '_datasets') {
            return [{
                component: <DatasetListView object={obj} onOpenDataset={(name) => {opts.onSelectItem(`${path}.${name}`)}} />,
                size: 'small'
            }];
        }
        else if (('_shape' in obj) && ('_data' in obj)) {
            return [{
                component: <DatasetView shape={obj._shape} data={obj._data} name={name} />,
                size: 'small'
            }];
        }
        else {
            return [];
        }
    }
};