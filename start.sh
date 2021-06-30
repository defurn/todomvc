#!/bin/bash

# -b to re-build container with deps
# -d to run nodemon in  shell for development
# TODO: - something to run for real... 

if [[ "$1" == "-b" ]]; then
  docker build --build-arg UID=$UID --build-arg GID=$(id -g $USER) -t node-dev .
elif [[ "$1" == "-d" ]]; then 
  docker run --rm -it -p 8080:8080 -v ${PWD}:/app --name=todo-mvc node-dev /bin/bash # nodemon server.js
fi
