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

#Generate Video Thumbnail
1. Download ffmpeg from https://ffmpeg.zeranoe.com/builds/
2. Follow installation guide for Windows https://video.stackexchange.com/questions/20495/how-do-i-set-up-and-use-ffmpeg-in-windows
3. Install Node.js (if not yet installed)
4. Open a terminal, navigate to the project directory
5. Run thumbnail_generate.js
 > node thumbnail_generate.js
This will generate png files of your mp4 files in the videos folder.
Generated png files will be found in the same location as the video file.
