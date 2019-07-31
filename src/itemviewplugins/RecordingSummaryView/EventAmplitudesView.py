#!/usr/bin/env python

import mlprocessors as mlpr
from mountaintools import client as mt
import numpy as np
from mountaintools import ReactComponentPythonCompanion
from spikeforest import SFMdaRecordingExtractor, SFMdaSortingExtractor, mdaio
from spikeforest_analysis import bandpass_filter
import spiketoolkit as st

class FilterTimeseries(mlpr.Processor):
    NAME = 'FilterTimeseries'
    VERSION = '0.1.0'
    CONTAINER = None

    recording_directory = mlpr.Input(description='Recording directory', optional=False, directory=True)
    timeseries_out = mlpr.Output(description='Filtered timeseries file (.mda)')

    def run(self):
        rx = SFMdaRecordingExtractor(dataset_directory=self.recording_directory, download=True)
        rx2 = bandpass_filter(recording=rx, freq_min=300, freq_max=6000, freq_wid=1000)
        if not mdaio.writemda32(rx2.get_traces(), self.timeseries_out):
            raise Exception('Unable to write output file.')

class Component(ReactComponentPythonCompanion):
    def __init__(self):
        super().__init__(iterate_timeout=1)

    def updateComponent(self, prevJavaScriptState):
        if not self.getJavaScriptState('firingsPath'):
            return

        self.setPythonState(dict(status='running'))

        recordingPath = self.getJavaScriptState('recordingPath')
        firingsPath = self.getJavaScriptState('firingsPath')
        unitIds = self.getJavaScriptState('unitIds')

        if len(unitIds) == 0:
            self.setPythonState(dict(
                status='error',
                error='No units selected.'
            ))
            return

        X = FilterTimeseries.execute(
            recording_directory=recordingPath,
            timeseries_out=dict(ext='.mda')
        )

        if X.retcode != 0:
            self.setPythonState(dict(
                status='error',
                error='non-zero return code for bandpass filter'
            ))
            return

        filtered = X.outputs['timeseries_out']

        recording = SFMdaRecordingExtractor(dataset_directory=recordingPath, raw_fname=filtered)
        sorting = SFMdaSortingExtractor(firings_file=firingsPath)

        print('Extracting event waveforms')
        a: np.ndarray = st.postprocessing.get_unit_waveforms(recording=recording, sorting=sorting, unit_ids=unitIds, ms_before=1, ms_after=1)
        print(a.shape)

        self.setPythonState(dict(
            status='finished',
            test='test'
        ))
        
    def iterate(self):
        pass

if __name__ == "__main__":
    A = Component()
    A.run()