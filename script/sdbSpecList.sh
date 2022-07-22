#!/bin/sh

#
# This shell script prints tizen device serial name on each line.
#
# on `sdb devices`, it will show result below.
#
# List of devices attached 
# 192.168.223.1:26101 	device    	0
# 192.168.224.1:26101 	device    	0
#
# so, only imformation we need is list of -s in first column from second row to end.
# just pass `sdb device` result except first line and grep only device and pring first column
# this will show result below
#
# 192.168.223.1:26101
# 192.168.224.1:26101
#

sdb devices | awk 'NR > 1 {print}' | grep device | awk '{print $1}'
