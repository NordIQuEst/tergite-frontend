#!/bin/sh

# This code is part of Tergite
#
# (C) Copyright Chalmers Next Labs 2024
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.

# This runs nginx after a few setups

var_or_default(){
    if [ -z "$1" ]; then 
        echo "$2";
    else 
        echo "$1";
    fi
}

env_file="/etc/nginx/.env.local";
assets_folder="/usr/share/nginx/html/assets";

# load the environment file if it exists
if [ -f "$env_file" ]; then
    . "$env_file";
fi

# the cookie names as obtained from the environment
cookie_domain=$(var_or_default "$COOKIE_DOMAIN" "$VITE_COOKIE_DOMAIN")
cookie_name=$(var_or_default "$COOKIE_NAME" "$VITE_COOKIE_NAME")
api_base_url=$(var_or_default "$API_BASE_URL" "$VITE_API_BASE_URL")

# replace all instances of $VITE_COOKIE_DOMAIN, VITE_COOKIE_NAME, VITE_API_BASE_URL
# in the prebuilt JS with those from the environment. Also update the env file so that
# next runs have access to current variables as the previous/default variables
if [ "$api_base_url" != "$VITE_API_BASE_URL" ]; then
    sed -i "s|$VITE_API_BASE_URL|$api_base_url|" "$assets_folder/index-*.js";
    if [ -f "$env_file" ]; then
        sed -i "s|VITE_API_BASE_URL=$VITE_API_BASE_URL|VITE_API_BASE_URL=$api_base_url|" "$env_file";
    fi
fi
if [ "$cookie_name" != "$VITE_COOKIE_NAME" ]; then
    sed -i "s|$VITE_COOKIE_NAME|$cookie_name|" "$assets_folder/index-*.js";
    if [ -f "$env_file" ]; then
        sed -i "s|VITE_COOKIE_NAME=$VITE_COOKIE_NAME|VITE_COOKIE_NAME=$cookie_name|" "$env_file";
    fi
fi
if [ "$cookie_domain" != "$VITE_COOKIE_DOMAIN" ]; then
    sed -i "s|$VITE_COOKIE_DOMAIN|$cookie_domain|" "$assets_folder/index-*.js";
    if [ -f "$env_file" ]; then
        sed -i "s|VITE_COOKIE_DOMAIN=$VITE_COOKIE_DOMAIN|VITE_COOKIE_DOMAIN=$cookie_domain|" "$env_file";
    fi
fi

/usr/sbin/nginx "$@"