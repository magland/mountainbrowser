import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import val2elmt from "./val2elmt";


class AttrView extends Component {
    state = {}
    render() {
        const { attrs, name } = this.props;
        let keys = Object.keys(attrs);
        return (
            <div>
                <h4>Attributes: {name}</h4>
                <Table>
                    <TableBody>
                        {
                            keys.map((key) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>{val2elmt(attrs[key])}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>

                </Table>
            </div>
        );
    }
}

export default class AttrViewPlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        let attrs = null;
        if ((name === '_attrs') || (name === '_attr')) {
            attrs = obj;
        }
        else if ('_attr' in obj) {
            attrs = obj['_attr'];
        }
        else if ('_attrs' in obj) {
            attrs = obj['_attrs'];
        }
        if (attrs) {
            return [{
                component: <AttrView attrs={attrs} name={name} />,
                size: 'small'
            }];
        }
        else {
            return [];
        }
    }
};