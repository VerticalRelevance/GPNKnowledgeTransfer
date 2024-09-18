#!/bin/bash
#Zachary Job

export BUILDKIT_PROGRESS=plain

platform="${platform:-linux/amd64}"

function build_and_test() {
    mkdir temp
    cp -r ../source/* ./temp/
    image_name=$(echo "${1}" | tr '[:upper:]' '[:lower:]')
    echo Building the test image ${image_name}...
    docker buildx build --platform ${platform} -t ${image_name}-test:latest . --target=test
    docker run --platform ${platform} --env-file ../source/.env --rm ${image_name}-test:latest
    echo building the final image ${image_name}...
    docker buildx build --platform ${platform} -t ${image_name}:latest .
}

cd ../../authorizers/container
build_and_test $1
#--no-cache
