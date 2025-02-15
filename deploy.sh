#!/bin/bash

set -x

# Checkout main branch and sanity check
git checkout main
[[ -z $(git status -s) ]] || echo "WARNING: local changes found!"

# Ensure remote main branch didn't drift
git pull
git push -u origin main

# Update prod to tip of main
git fetch origin prod:prod
git branch -f prod

# Update remote prod branch
git push -u origin prod
