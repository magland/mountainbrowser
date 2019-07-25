import Sha1PathLink from '../spikeforestanalysis/Sha1PathLink';
import React from 'react';

function intersperse(arr, sep) {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce(function(xs, x, i) {
        return xs.concat([sep, x]);
    }, [arr[0]]);
}

function val2elmt(val) {
    if (typeof (val) === 'string') {
        if (val.startsWith('sha1://') || (val.startsWith('sha1dir://'))) {
            return <Sha1PathLink path={val} canCopy={true} />
        }
        return <span>{val}</span>;
    }
    else if ((typeof (val) === 'object') && (Array.isArray(val))) {
        return <span>[{intersperse(val.map(v => (val2elmt(v))), ', ')}]</span>;
    }
    else {
        return <pre>{JSON.stringify(val)}</pre>;
    }
}

export default val2elmt;