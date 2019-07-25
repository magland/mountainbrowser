#!/usr/bin/env python

import mlprocessors as mlpr
from spikeforest import SFMdaRecordingExtractor, SFMdaSortingExtractor, mdaio
from spiketoolkit.preprocessing import bandpass_filter
from spikeextractors import RecordingExtractor
from mountaintools import client as mt
import os

class ProcessSpikeForestRecording(mlpr.Processor):
    NAME = 'ProcessSpikeForestRecording'
    VERSION = '0.1.0'

    # Inputs
    recording_dir = mlpr.Input(directory=True)

    # Outputs
    filtered_timeseries = mlpr.Output()

    def run(self):
        X = SFMdaRecordingExtractor(dataset_directory=self.recording_dir)
        Y: RecordingExtractor = bandpass_filter(X, freq_min=300, freq_max=6000)
        mdaio.writemda32(Y.get_traces(), self.filtered_timeseries)

def genjob(processor: mlpr.Processor, **kwargs) -> None:
    job = processor.createJob(
        **kwargs
    )
    source_path = os.path.dirname(os.path.realpath(__file__))
    mt.saveObject(object=job.getObject(), dest_path='{}/{}.json'.format(source_path, processor.NAME), indent=4)

if __name__ == '__main__':
    genjob(
        ProcessSpikeForestRecording,
        recording_dir=mlpr.PLACEHOLDER,
        filtered_timeseries=dict(ext='.mda')
    )
