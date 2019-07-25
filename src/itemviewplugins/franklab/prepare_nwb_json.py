#!/usr/bin/env python

import h5py
import numpy as np
from mountaintools import client as mt
from spikeforest import mdaio
import tempfile
import shutil
import copy


def main():
    mt.configDownloadFrom('spikeforest.public')

    path = 'sha1://a713cb31d505749f7a15c3ede21a5244a3f5a4d9/bon03.nwb'
    A = mt.realizeFile(path)
    if not A:
        print('Unable to realize file: {}'.format(path))
    B = h5_to_dict(A, opts=dict(upload_to='spikeforest.public'), name=None)
    C = mt.saveObject(object=B, upload_to='spikeforest.public',
                      basename='bon03.nwb.json')
    mt.createSnapshot(
        path=C, dest_path='key://pairio/spikeforest/test_franklab.json')
    print('--------------------------------------------------------------------------')
    print(C)


class TemporaryDirectory():
    def __init__(self):
        pass

    def __enter__(self):
        self._path = tempfile.mkdtemp()
        return self._path

    def __exit__(self, exc_type, exc_val, exc_tb):
        shutil.rmtree(self._path)

    def path(self):
        return self._path


def npy_dtype_to_string(dt):
    str = dt.str[1:]
    map = {
        "f2": 'float16',
        "f4": 'float32',
        "f8": 'float64',
        "u1": 'uint8',
        "i1": 'uint8',
        "i2": 'int16',
        "i4": 'int32',
        "i8": 'int32',  # note that mda does not support int64 (I believe)
        "u2": 'uint16',
        "u4": 'uint32'
    }
    return map[str]


def _handle_val(val, *, opts, name):
    if name.startswith('colnames'):
        print('----------------------- {}'.format(name), val, type(val))
    if type(val) == str:
        return val
    elif type(val) == int:
        return val
    elif type(val) == float:
        return val
    elif isinstance(val, np.floating):
        return float(val)
    elif isinstance(val, np.integer):
        return int(val)
    elif type(val) == bytes:
        print('type is bytes', val, val.decode('utf-8'))
        return val.decode('utf-8')
    elif type(val) == np.ndarray:
        return _handle_ndarray(val, opts=opts, name=name)
    elif type(val) == h5py.Reference:
        print('Unable to handle reference type')
        return 'unhandled_ref'
    else:
        print('WARNING: Unhandled type: {}'.format(type(val)))
        return 'unhandled_val'


def _handle_list_or_val(val, *, opts, name):
    if type(val) == list:
        return [_handle_list_or_val(x, opts=opts, name='{}.{}'.format(name, ind)) for ind, x in enumerate(val)]
    else:
        return _handle_val(val, opts=opts, name=name)


def _handle_ndarray(x, *, opts, name):
    if np.issubdtype(x.dtype, np.number):
        if (x.size <= 20):
            list0 = [_handle_list_or_val(val, opts=opts, name=name)
                     for val in x.tolist()]
            return list0
        else:
            with TemporaryDirectory() as f:
                fname = f + '/{}.mda'.format(name)
                mdaio.writemda(x, fname, dtype=npy_dtype_to_string(x.dtype))
                return mt.createSnapshot(fname, upload_to=opts.get('upload_to', None))
    else:
        list0 = [_handle_list_or_val(val, opts=opts, name='{}.{}'.format(name, ind))
                 for ind, val in enumerate(x.tolist())]
        return list0
    return 'unhandled_ndarray'


def _handle_dataset(ds: h5py.Dataset, *, opts, name):
    _attrs = _get_attrs(ds, opts=opts, name=name)
    value = _handle_val(ds.value, opts=opts, name=name)
    ret = dict(
        _data=value,
        _shape=list(ds.shape),
        _dtype=ds.dtype.name
    )
    if len(_attrs.keys()) > 0:
        ret['_attrs'] = _attrs
    return ret


def _get_attrs(f, *, opts, name):
    attrs = dict()
    for key, val in dict(f.attrs).items():
        attrs[key] = _handle_val(val, opts=opts, name=key)
    return attrs


def _h5_to_dict(f, *, opts, name):
    _attrs = _get_attrs(f, opts=opts, name=name)
    _datasets = {}
    ret = {}
    for name0, item in f.items():
        if isinstance(item, h5py.Group):
            ret[name0] = _h5_to_dict(item, opts=opts, name=name0)
        elif isinstance(item, h5py.Dataset):
            _datasets[name0] = _handle_dataset(item, opts=opts, name=name0)
        else:
            print('Unhandled item', type(item))
    if len(_attrs.keys()) > 0:
        ret['_attrs'] = _attrs
    if len(_datasets.keys()) > 0:
        ret['_datasets'] = _datasets
    return ret


def h5_to_dict(fname, *, opts, name):
    with h5py.File(fname, 'r') as f:
        return _h5_to_dict(f, opts=opts, name=None)


if __name__ == '__main__':
    main()
