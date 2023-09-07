#!/bin/bash

# This shell script add PPA to get onecc-docker package for ONEToolchain.

PPA_NAME="ppa:one-compiler/onecc-docker"
add-apt-repository -y ${PPA_NAME}

apt-get update -yqq
