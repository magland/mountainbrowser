import { hot } from 'react-hot-loader/root';
import React, { Component } from "react";
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import Tree from "./Tree"
import FileView from "./FileView"
import PropTypes from "prop-types";
import InfoBar from "./InfoBar";
import Toolbar from '@material-ui/core/Toolbar';
import styled from 'styled-components'

import * as viewPlugins from "../../viewplugins";

const queryString = require('query-string');

const MountainClient = require('@mountainclient-js').MountainClient;

const ButtonIcon = styled.div`
  padding-top: 6px;
  padding-left: 12px;
  padding-right: 12px;

  &.enabled {
    cursor: pointer;
    :hover {
        background: #E5E5E5;
    }
  }

  &.disabled {
    cursor: arrow;
    color: lightgray;
  }
`;

const HistoryLine = styled.div`
  height:8px;
  width: 100%;
  background: #E2E2E2;
  cursor: arrow;
  margin-top: 6px;

  :hover {
    background: gray;
  }
`;

class MTBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'Loading',
            rootNode: null,
            selectedNode: null,
            inputPath: props.path,
            path: props.path,
            pathHistory: []
        };
        this.viewPluginsList = Object.values(viewPlugins);
    }

    async componentDidMount() {
        // this.setState({
        //     inputPath: path,
        //     path: path
        // });
        await this.updateContent();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.path !== prevState.path) {
            await this.updateContent()
        }
    }

    async updateContent() {
        const { path } = this.state;
        this.setState({ status: `Loading: ${path}` });
        let rootNode = null;
        if (path.endsWith('.json')) {
            let mt = new MountainClient();
            mt.configDownloadFrom(['spikeforest.public']);
            let A = await mt.loadObject(path, {});
            if (!A) {
                this.setState({
                    status: `Unable to load file: ${path}`
                });
                return;
            }
            rootNode = this.createObjectNode(A, '');
        }
        else {
            let X = await loadDirectory(path, {});
            if (!X) {
                this.setState({
                    status: `Unable to load: ${path}`
                });
                return;
            }
            rootNode = this.createDirNode(X, '', path);
        }
        this.setState({
            status: `loaded`,
            rootNode: rootNode,
            selectedNode: rootNode
        });
    }

    onSelect = (node) => {
        this.setState({
            selectedNode: node
        });
    }

    createObjectNode(obj, name, basepath, part_of_list) {
        const max_array_children = 20;
        let childNodes = [];
        let path0 = this.joinPaths(basepath, name, '.', part_of_list);
        let type0 = 'object';
        if (Array.isArray(obj)) {
            childNodes = this.createArrayHierarchyChildNodes(obj, max_array_children, 0, obj.length, path0);
        }
        else {
            for (let key in obj) {
                let val = obj[key];
                if (typeof (val) == 'object') {
                    childNodes.push(this.createObjectNode(val, key, path0));
                }
                else {
                    childNodes.push(this.createValueNode(val, key, path0));
                }
            }
        }
        return {
            type: type0,
            name: name,
            childNodes: childNodes,
            path: path0
        }
    }

    createArrayHierarchyChildNodes(X, max_array_children, i1, i2, path0) {
        let childNodes = [];
        if (i2 - i1 <= max_array_children) {
            for (let ii = i1; ii < i2; ii++) {
                let val = X[ii];
                if (typeof (val) == 'object') {
                    childNodes.push(this.createObjectNode(val, '' + ii, path0, true));
                }
                else {
                    childNodes.push(this.createValueNode(val, '' + ii, path0, true));
                }
            }
        }
        else {
            let stride = 1;
            while ((i2 - i1) / stride > max_array_children / 2) {
                stride = stride * 10;
            }
            for (let jj = i1; jj < i2; jj += stride) {
                let jj2 = jj + stride;
                if (jj2 >= i2) jj2 = i2;
                childNodes.push({
                    type: 'array-parent',
                    name: `${jj} - ${jj2 - 1}`,
                    childNodes: this.createArrayHierarchyChildNodes(X, max_array_children, jj, jj2, path0),
                    path: path0 + `[${jj}-${jj2 - 1}]`
                });
            }
        }
        return childNodes;

    }

    createValueNode(val, name, basepath) {
        let path0 = this.joinPaths(basepath, name, '.');
        return {
            type: 'value',
            name: name,
            value: val,
            path: path0
        };
    }

    createDirNode(X, name, basepath) {
        let childNodes = [];
        let path0 = this.joinPaths(basepath, name, '/');
        for (let dname in X.dirs) {
            childNodes.push(this.createDirNode(X.dirs[dname], dname, path0));
        }
        for (let fname in X.files) {
            childNodes.push(this.createFileNode(X.files[fname], fname, path0));
        }
        return {
            type: 'dir',
            path: path0,
            name: name,
            dir: X,
            childNodes: childNodes
        };
    }

    createFileNode(X, name, basepath) {
        let path0 = this.joinPaths(basepath, name, '/');
        return {
            type: 'file',
            path: path0,
            name: name,
            file: X
        };
    }

    joinPaths(path1, path2, sep, part_of_list) {
        if (!path2) return path1;
        if (!path1) return path2;
        if (part_of_list) {
            return `${path1}[${path2}]`;
        }
        else {
            return `${path1}${sep}${path2}`;
        }
    }

    handlePathInputChanged = (evt) => {
        this.setState({
            inputPath: evt.target.value
        });
    }

    handlePathInputKeyDown = (evt) => {
        if (evt.keyCode === 13) {
            this.handleUpdate();
        }
    }

    setNewPath = (path) => {
        if (path === this.state.path) {
            return;
        }
        this.setState({
            path: path,

            inputPath: path,
            pathHistory: [...this.state.pathHistory, this.state.path]
        });

        var q = queryString.parse(location.search);
        q.path = path;
        console.log('-----', queryString.stringify(q));
        //location.search = queryString.stringify(q);
    }

    handleUpdate = () => {
        this.setNewPath(this.state.inputPath);
    }

    handleOpenPath = (path) => {
        this.setNewPath(path);
    }

    handleBackButton = () => {
        if (this.state.pathHistory.length === 0) return;
        let path0 = this.state.pathHistory.pop();
        this.setState({
            path: path0,
            inputPath: path0
        });
    }

    handleHistoryLine = (ind) => {
        let path0 = this.state.pathHistory[ind];
        this.setState({
            path: path0,
            inputPath: path0,
            pathHistory: this.state.pathHistory.slice(0, ind)
        });
    }

    render() {
        const { rootNode, selectedNode, status } = this.state;
        let inputLength = Math.ceil(Math.max(50, this.state.inputPath.length) / 10) * 10;
        let topControls =
            <div className="input-group">
                <ButtonIcon onClick={this.handleBackButton}
                    className={(this.state.pathHistory.length === 0) ? 'disabled' : 'enabled'}
                >
                    <FaArrowLeft />
                </ButtonIcon>
                <input
                    type="text"
                    className="form-control"
                    placeholder="sha1dir:// or sha1:// path"
                    onChange={this.handlePathInputChanged}
                    onKeyDown={this.handlePathInputKeyDown}
                    style={{ maxWidth: `${inputLength}ch` }}
                    value={this.state.inputPath}
                />
                <Button
                    onClick={this.handleUpdate}
                    disabled={this.state.path === this.state.inputPath}
                >
                    Update
                </Button>
            </div>

        let treeContent, viewContent;
        if (this.state.status === 'loaded') {
            treeContent = <Tree
                rootNode={rootNode}
                selectedNode={selectedNode}
                onSelect={(node) => { this.onSelect(node); }}
            />
            viewContent = <FileView
                node={selectedNode ? selectedNode : null}
                viewPlugins={this.viewPluginsList}
                onOpenPath={this.handleOpenPath}
            >
            </FileView>
        }
        else if (status === 'loading') {
            treeContent = <div>Loading ...</div>
            viewContent = <div></div>
        }
        else {
            treeContent = <div>{status}</div>
            viewContent = <div></div>
        }

        let mainContent = <Row noGutters={true}>
            <Col md={6} lg={5}>
                {this.state.pathHistory.map((p, ind) => <HistoryLine key={p} title={p} onClick={() => { this.handleHistoryLine(ind) }} />)}
                {treeContent}
            </Col>
            <Col md={6} lg={7}>
                {viewContent}
            </Col>
        </Row>

        const kacheryConnections = [
            { name: 'test0', status: '' },
            { name: 'test1', status: 'disconnected' },
            { name: 'test2', status: 'connected' }
        ];

        return <React.Fragment>
            <div>
                <InfoBar kacheryConnections={kacheryConnections} />
            </div>
            {/* Important to put in this toolbar in order to shift down the stuff below */}
            <Toolbar variant="dense" />
            {/* Some space */}
            <div style={{height:'10px'}} />
            <div>
                {topControls}
            </div>
            <div style={{height:'10px'}} />
            <div>
                {mainContent}
            </div>
        </React.Fragment>;
    }
}

MTBrowser.propTypes = {
    path: PropTypes.string
}

async function loadDirectory(path) {
    let mt = new MountainClient();
    mt.configDownloadFrom(['spikeforest.public']);

    let X;
    if (path.startsWith('key://')) {
        path = await mt.resolveKeyPath(path);
        if (!path) return null;
    }
    if (path.startsWith('sha1dir://')) {
        let vals = path.split('/');
        vals[2] = vals[2].split('.')[0];
        X = await mt.loadObject(`sha1://${vals[2]}`);
        if (!X) return null;
        for (let i = 3; i < vals.length; i++) {
            if (vals[i]) {
                if ((X.dirs) && (vals[i] in X.dirs)) {
                    X = X.dirs[vals[i]];
                }
                else {
                    return null;
                }
            }
        }
    }
    else {
        return null;
    }

    return X;
}

// async function resolveKeyPath(path) {
//     let response;
//     try {
//         response = await axios.get(`/api/resolveKeyPath?path=${encodeURIComponent(path)}`);
//     }
//     catch (err) {
//         console.error(err);
//         console.error(`Problem resolving key path: ${path}`);
//         return null;
//     }
//     let rr = response.data;
//     if (rr.success) {
//         return rr.text;
//     }
//     else return null;
// }

// async function loadObject(path, opts) {
//     if (!path) {
//         if ((opts.key) && (opts.collection)) {
//             path = `key://pairio/${opts.collection}/~${hash_of_key(opts.key)}`;
//         }
//     }
//     let response;
//     try {
//         response = await axios.get(`/api/loadObject?path=${encodeURIComponent(path)}`);
//     }
//     catch (err) {
//         console.error(err);
//         console.error(`Problem loading object: ${path}`);
//         return null;
//     }
//     let rr = response.data;
//     if (rr.success) {
//         return rr.object;
//     }
//     else return null;
// }

// function example_data() {
//     return {
//         "files": {
//             "index.js": {
//                 "size": 310,
//                 "sha1": "2dd6248bcd0ba0c4fc59f58085abbd47e5d1f17e"
//             }
//         },
//         "dirs": {
//             "widgets": {
//                 "files": {
//                     "index.js": {
//                         "size": 50,
//                         "sha1": "82073d94fa7ff3ed7923287d36b9e4e0f6671bc0"
//                     }
//                 },
//                 "dirs": {
//                     "MTBrowser": {
//                         "files": {
//                             "Tree.js": {
//                                 "size": 2076,
//                                 "sha1": "f7c49b972b5bc3a1cc0cdf74fdbe14223438519f"
//                             },
//                             "TreeNode.js": {
//                                 "size": 2073,
//                                 "sha1": "ce3f22f3e105952ddb87bfd5daa0315d740ba19b"
//                             },
//                             "MTBrowser.js": {
//                                 "size": 488,
//                                 "sha1": "e98a6c46428346a94fecdba18c2f99c97870f03f"
//                             }
//                         },
//                         "dirs": {}
//                     }
//                 }
//             }
//         }
//     };
// }

export default hot(MTBrowser)