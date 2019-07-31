#!/usr/bin/env python

from mountaintools import ReactComponentPythonCompanion
import time

class DevPlugin(ReactComponentPythonCompanion):
    def __init__(self):
        super().__init__(iterate_timeout=1)
        self.num = 10

    def updateComponent(self, prevProps, prevState):
        if not prevProps.get('object', None):
            obj = self.getProp('object')
            if obj:
                val = obj['bon03']['_attrs']['namespace']
                self.setState(dict(namespace=val))
    def iterate(self):
        self.setState(dict(namespace='test {}'.format(self.num)))
        self.num = self.num + 1

if __name__ == "__main__":
    A = DevPlugin()
    A.run()