import React, { Component } from 'react';
import DevPluginPython from './DevPlugin.py';
import ReactComponentPythonCompanion from "../ReactComponentPythonCompanion";

class DevView extends Component {
    constructor(props) {
        super(props);
        this.state = {namespace: 'unknown'};        
        this.pythonCompanion = new ReactComponentPythonCompanion(this, DevPluginPython, ['object'], ['namespace']);
    }
    componentDidMount() {
        this.pythonCompanion.start();
    }
    componentWillUnmount() {
        this.pythonCompanion.stop();
    }
    componentDidUpdate() {
        this.pythonCompanion.update();
    }
    render() { 
        return (
            <div>Dev view. State: <pre>{JSON.stringify(this.state)}</pre></div>
        );
    }
}

export default class DevPlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        if (obj.bon03) {
            return [{
                component: <DevView object={obj} />,
                size: 'large'
            }];
        }
        else {
            return [];
        }
    }
};