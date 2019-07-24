import React, { Component } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Link } from '@material-ui/core';
import { ElectrodeGeometryView } from "../ElectrodeGeometryView/ElectrodeGeometryViewPlugin";
import ReactMarkdown from 'react-markdown';

class StudySetInfoView extends Component {
    state = {}
    val2str(val) {
        if (typeof (val) === 'string') {
            return val;
        }
        else if ((typeof (val) === 'object') && (Array.isArray(val))) {
            return val.map(v => (this.val2str(v))).join(', ');
        }
        else {
            return JSON.stringify(val);
        }
    }
    render() {
        const { info } = this.props;
        let keys = Object.keys(info);
        return (
            <Table>
                <TableHead></TableHead>
                <TableBody>
                    {
                        keys.map(key => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell>{this.val2str(info[key])}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        );
    }
}

class MarkdownView extends Component {
    state = {}
    render() {
        const { markdown } = this.props;
        return (
            <ReactMarkdown source={markdown} />
        );
    }
}

class RecordingView extends Component {
    state = {}
    render() {
        const { object } = this.props;
        const rows = [
            {name: 'name', label: 'Recording'},
            {name: 'studyName', label: 'Study', onClick: this.props.onOpenStudy},
            {name: 'studySetName', label: 'Study set', onClick: this.props.onOpenStudySet},
            {name: 'sampleRateHz', label: 'Sample rate (Hz)'},
            {name: "numChannels", label: 'Num. channels'},
            {name: "durationSec", label: 'Duration (sec)'},
            {name: "numTrueUnits", label: 'Num. true units'}
        ];
        return (
            <div>
                <Table>
                    <TableHead></TableHead>
                    <TableBody>
                        {
                            rows.map((rr) => {
                                let elmt = <span>{object[rr.name]}</span>;
                                if (rr.onClick)
                                    elmt = <Link component="button" variant="body2" onClick={rr.onClick}>{elmt}</Link>;
                                return (
                                    <TableRow key={rr.name}>
                                        <TableCell>{rr.label}</TableCell>
                                        <TableCell>{elmt}</TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
                <ElectrodeGeometryView
                    kacheryManager={this.props.kacheryManager}
                    path={`${object.directory}/geom.csv`}
                />
            </div>
        );
    }
}

class StudiesTable extends Component {
    state = {}
    render() {
        const { studies } = this.props;
        return (
            <div style={{ overflow: 'auto', maxHeight: 600 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Study</TableCell>
                            <TableCell>Num. recordings</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            studies.map((study, ind) => (
                                <TableRow key={study.name}>
                                    <TableCell><Link component="button" variant="body2" onClick={() => {this.props.onOpenStudy(ind)}}>{study.name}</Link></TableCell>
                                    <TableCell>{(study.recordings || []).length}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

class StudySetView extends Component {
    state = {}
    render() {
        const { object } = this.props;
        return (
            <div>
                <h3>Study set: {object.name}</h3>
                <StudySetInfoView info={object.info || {}} />
                <StudiesTable studies={object.studies || []} onOpenStudy={this.props.onOpenStudy} />
                <hr />
                <MarkdownView markdown={object.description || ''} />
            </div>
        );
    }
}

class RecordingsTable extends Component {
    state = {}
    render() {
        const columns = [
            {name: 'name', label: 'Recording', link: true},
            {name: 'sampleRateHz', label: 'Sample rate (Hz)'},
            {name: "numChannels", label: 'Num. channels'},
            {name: "durationSec", label: 'Duration (sec)'},
            {name: "numTrueUnits", label: 'Num. true units'}
        ];
        const { recordings } = this.props;
        return (
            <div style={{ overflow: 'auto', maxHeight: 600 }}>
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
                            recordings.map((recording, ind) => (
                                <TableRow key={recording.name}>
                                    {
                                        columns.map((cc) => {
                                            let elmt = <span>{recording[cc.name]}</span>;
                                            if (cc.link) {
                                                elmt = <Link component="button" variant="body2" onClick={() => {this.props.onOpenRecording(ind)}}>{elmt}</Link>;
                                            }
                                            return <TableCell key={cc.name}>{elmt}</TableCell>;
                                        })
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        );
    }
}

class StudyView extends Component {
    state = {}
    render() {
        const { object } = this.props;
        return (
            <div>
                <Table>
                    <TableHead></TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Study</TableCell>
                            <TableCell>{object.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Study set</TableCell>
                            <TableCell><Link component="button" variant="body2" onClick={this.props.onOpenStudySet}>{object.studySetName}</Link></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Num. recordings</TableCell>
                            <TableCell>{object.recordings.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <RecordingsTable recordings={object.recordings || []} onOpenRecording={this.props.onOpenRecording} />
            </div>
        );
    }
}

class StudySetListView extends Component {
    state = {}
    handleStudySetClicked = (ind) => {
        this.props.onOpenStudySet(ind);
    }
    render() {
        const { list } = this.props;
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Study set</TableCell>
                        <TableCell>Num. studies</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        list.map((studySet, ind) => (
                            <TableRow key={ind}>
                                <TableCell><Link component="button" variant="body2" onClick={() => this.handleStudySetClicked(ind)}>{studySet.name}</Link></TableCell>
                                <TableCell>{(studySet.studies || []).length}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        );
    }
}

function isRecordingObject(obj) {
    if (('name' in obj) && ('studyName' in obj) && ('directory' in obj)) {
        return true;
    }
    return false;
}

function isStudyObject(obj) {
    if (('name' in obj) && ('recordings' in obj)) {
        if (Array.isArray(obj.recordings)) {
            for (let rec of obj.recordings) {
                if (!isRecordingObject(rec))
                    return false;
            }
            return true;
        }
    }
    return false;
}

function isStudySetObject(obj) {
    if (('name' in obj) && ('studies' in obj)) {
        if (Array.isArray(obj.studies)) {
            for (let study of obj.studies) {
                if (!isStudyObject(study)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

function isStudySetListObject(obj) {
    if ((Array.isArray(obj)) && (obj.length > 0)) {
        for (let x of obj) {
            if (!isStudySetObject(x))
                return false;
        }
        return true;
    }
    return false;
}

function getParentPath(path, num) {
    if (!num) num = 1;
    if (num > 1) {
        return getParentPath(getParentPath(path, num-1), 1);
    }
    else {
        let a = path.split('.');
        return a.slice(0, a.length - 1).join('.');
    }
}

export default class StudySetPlugin {
    static getViewComponentsForObject(name, path, obj, opts) {
        if (isStudySetListObject(obj)) {
            return [{
                component: <StudySetListView list={obj} onOpenStudySet={(ind) => {opts.onSelectItem(`${path}.${ind}`)}} />,
                size: 'large'
            }];
        }
        else if (isStudySetObject(obj)) {
            return [{
                component: <StudySetView object={obj} onOpenStudy={studyIndex => {opts.onSelectItem(`${path}.studies.${studyIndex}`)}} />,
                size: 'large'
            }];
        }
        else if (isStudyObject(obj)) {
            return [{
                component: (
                    <StudyView
                        object={obj}
                        onOpenRecording={recordingIndex => {opts.onSelectItem(`${path}.recordings.${recordingIndex}`)}}
                        onOpenStudySet={() => {opts.onSelectItem(`${getParentPath(path, 2)}`)}}
                    />
                ),
                size: 'large'
            }];
        }
        else if (isRecordingObject(obj)) {
            return [{
                component: (
                    <RecordingView
                        kacheryManager={opts.kacheryManager}
                        object={obj}
                        onOpenStudy={() => {opts.onSelectItem(`${getParentPath(path, 2)}`)}}
                        onOpenStudySet={() => {opts.onSelectItem(`${getParentPath(path, 4)}`)}}
                    />
                ),
                size: 'large'
            }];
        }
        else {
            return [];
        }
    }
};