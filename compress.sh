#!/bin/bash

rm -f jsEntry.zip
tar -zcvf jsEntry.zip dist/
echo ""
echo ""
ls -lh ./jsEntry.zip |  awk '{ print $9, $5 }'
