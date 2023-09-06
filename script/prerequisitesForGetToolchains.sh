#!/bin/bash

# This shell script add PPA to get onecc-docker package for ONEToolchain.

PPA_NAME="ppa:one-compiler/onecc-docker"
add-apt-repository -y ${PPA_NAME}

# This shell script add PPA to get edgetpu-compiler package for EdgeTPUToolchain.

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | sudo tee /etc/apt/sources.list.d/coral-edgetpu.list

apt-get update -yqq
