#!/bin/sh

#
# This shell script prints tizen device serial name on each line.
#
# On `sdb devices`, it will show result below.
#
# List of devices attached 
# 192.168.223.1:26101 	device    	0
# emulator-1            emulator    0
# 192.168.224.1:26101 	device    	0
#
# First colmn is serialNumber which is unique key for device.
# Second colmn is state.
# Third colmn is targetName.
# (Reference: https://docs.tizen.org/application/tizen-studio/common-tools/smart-development-bridge/#managing-targets)
#
# `sdb devices` will not give data that exactly we want, So we need to modify result.
# We only need serialNumber, So use `awk` to pick serialNumber information.
#

sdb devices | awk 'NR > 1 {if ($2 == "device") print $1}'
