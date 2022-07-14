#!/bin/sh

#
# This shell script print tizen device serial name on each line.
#

sdb devices | grep -v devices | grep device | awk '{print $1}'
