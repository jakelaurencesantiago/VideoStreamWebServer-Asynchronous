# VideoStreamWebServer-Asynchronous
A simple web server built on Node.js (express, ejs) to view videos.
All requests are done asynchronously using fetch API.

The purpose of this project is for me to view my video files with any device; especially Anime.

An improved version of /jakelaurencesantiago/VideoStreamWebServer

# How to setup
1. Install Node.js (requires at least v10.10)
2. Place the files in a directory of your choice
3. Open a terminal, navigate to the project directory
4. Install required npm packages:
 > npm install express ejs body-parser
5. Start the web server to test
 > node main.js
6. Open a browser then go to http://localhost:7000


# TODO
1. Banner
2. Video reposition when out of view
3. Error paths
4. Increase category margin
5. Force scroll to top on selection
6. Update font sizes
7. put 'r' flag for openSync (required for linux)
8. character limit for category name
9. larger font size for video name
10. do something about hidden elements
11. category width height constant
12. video onclick/ontouch play
