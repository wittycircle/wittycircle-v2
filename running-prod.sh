#!/bin/bash

# Use this to run the scrip for forever.js

echo Running the script for landing the forever script...
echo Shutting down the previous instance of server.js production
# :TODO this is not good, i kill all process waiting to find a way to kill a process if he exist
forever stop production
echo Starting the server.js with forever and gloabl parameters at production.json...
forever start production.json
echo Everything is fine
exit 0
