#!/bin/bash

rm -f jsEntry.zip
zip jsEntry.zip dist/
echo ""
echo ""
ls -lh ./jsEntry.zip |  awk '{ print $9, $5 }'
