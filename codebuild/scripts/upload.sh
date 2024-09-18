#!/bin/bash
#Zachary Job

echo "AWS_PROFILE: $AWS_PROFILE"
aws ecr get-login-password --region $2 | docker login --username AWS --password-stdin $1.dkr.ecr.$2.amazonaws.com

registry="$1.dkr.ecr.$2.amazonaws.com"
platform="${platform:-linux/amd64}"

image_name="${3}"
echo Labelling, tagging and pushing image ${image_name}...
push_new_version ${registry} ${image_name}

function tag_and_push_latest() {
    registry=$1
    image_name=$2
    image_tag=${3:-latest}

    local_image="${image_name}:${image_tag}"
    remote_image="${registry}/${image_name}:${image_tag}"

    echo Tagging image ${image_name}... 
    docker tag ${local_image} ${remote_image}
    echo Pushing image ${image_name}... 
    docker push ${remote_image}
}

tag_and_push_latest ${registry} $5
