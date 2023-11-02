#!/bin/bash

# This shell script add PPA to get edgetpu-compiler package for EdgeTPUToolchain.

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | tee /etc/apt/sources.list.d/coral-edgetpu.list

sudo apt-get update -yqq
