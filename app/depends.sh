#!/bin/bash
#
# Should setup bower dependencies
#

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

npm install
bower install
