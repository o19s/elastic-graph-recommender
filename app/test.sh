#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
node_modules/karma/bin/karma start --log-level debug --single-run
