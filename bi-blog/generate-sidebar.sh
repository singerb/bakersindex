#!/bin/sh

POSTS=`find src/ -maxdepth 1 -type f | grep -E '\.md$' | sort -r`

echo "### Articles"

for POST in $POSTS; do
	TITLE=`cat $POST | rg -o '<!-- title: (.+) -->' -r '\$1'`
	BASE=`basename $POST`
	echo "- [$TITLE](${BASE%.*}.html)"
done
