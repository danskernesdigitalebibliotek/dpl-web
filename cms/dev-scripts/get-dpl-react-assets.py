#!/usr/bin/env python3
from argparse import ArgumentParser
from urllib.parse import quote as url_encode
from inspect import getmembers
import sys

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument('branch', type=str)
    parser.add_argument("--release-prefix", nargs="?", default="release-")
    parser.add_argument("--github-url", nargs="?", default="https://github.com/danskernesdigitalebibliotek/dpl-react/releases/download")
    parser.add_argument("--assets", nargs="?", default="dist.zip")

    args = parser.parse_args()

    url = [
      args.github_url,
      args.release_prefix + url_encode(args.branch, safe=''),
      args.assets
    ]
    print("/".join(url))
