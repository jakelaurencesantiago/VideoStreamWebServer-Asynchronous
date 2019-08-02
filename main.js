const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

const dir = __dirname.replace(/\\/g, "/");
const videoDir = dir + "/videos/";

const DEFAULT_THUMBNAIL = 'img/default.png';

app.use(bodyParser.json());

app.use(express.static('videos'));
app.set('view engine', 'ejs');
app.use('/script', express.static('script'));
app.use('/style', express.static('style'));
app.use('/img', express.static('img'));

app.get('/', (req, res) => {
    console.log('Connection from ' + req.ip);
    res.render('index');
});

app.get('/videolist', (req, res) => {
    let base = '';
    if(req.query.path) base = req.query.path;
    const path = videoDir + base + '/';

    fs.readdir(path, {withFileTypes: true},(err, files) => {
        if(err) {
            console.log(err);
            return res.status(400).send({error: err.message});
        }

        const ret = {categoryList: [], videoList: []};
        files.forEach(file => {
            const name = file.name;
            if(file.name.endsWith('png')) return; //ignore png files
            if(file.isDirectory()) {
                const dirFiles = fs.readdirSync(path + name);
                let thumbnail = dirFiles.find(f => f.endsWith('png')); //find available thumbnail

                thumbnail = thumbnail ? `${base}/${name}/${thumbnail}` : DEFAULT_THUMBNAIL;
                ret.categoryList.push({name: name, thumbnail: thumbnail, base: base});
            }
            else {
                let thumbnail = files.find(f => f.name === name + ".png"); //find thumbnail
                
                thumbnail = thumbnail ? `${base}/${thumbnail.name}` : DEFAULT_THUMBNAIL;
                ret.videoList.push({name: name, thumbnail: thumbnail,
                    time: getVideoDuration(path + name), base: base});
            }
        });
        res.status(200).send(ret);
    });
});

app.get('/video', (req, res) => {
    const path = req.query.path ? req.query.path : '';
    const videoFile = req.query.file;
    const videoIndex = req.query.index;
    console.log('video ' + path + " " + videoFile + " " + videoIndex);
    fs.readdir(videoDir + path,(err, files) => {
        const findFile = file => files.find(f => f === file);
        if(err) {
            console.log(err);
            return res.status(400).send({error: err.message});
        }

        const videoList = files.filter(f => f.endsWith('mp4')); //get all mp4
        let vid = null;

        if(videoFile !== null && videoFile !== undefined) {
            vid = findFile(videoFile);
        }
        else if(videoIndex !== null && videoIndex !== undefined) {
            vid = videoList[videoIndex];
        }
        
        if(!vid) {
            return res.status(404).send({error: "File not found."});
        }

        const playerVideo = videoList.indexOf(vid);

        const playerList = videoList.map(name => {
            let thumbnail = findFile(name + '.png');
            thumbnail = thumbnail ? `${path}/${thumbnail}` : DEFAULT_THUMBNAIL;
            const p = `${path}/${name}`;
            return {name: name, thumbnail: thumbnail, path: p, time: getVideoDuration(videoDir + p)};
        });

        const ret = {base: path, videoInx: playerVideo, videoList: playerList};
        
        res.status(200).send(ret);
    });
});

const server = app.listen(7000, () => {
        const port = server.address().port;
        console.log(`Listening @ ${port}`);
    });

function getVideoDuration(path) {
    let ss = 0;
    let mm = 0;
    let hh = 0;
    try {
        const fd = fs.openSync(path);
        const buffSize = 128;
        const buffer = Buffer.alloc(buffSize);
        const bytesRead = fs.readSync(fd, buffer, 0, buffSize, 0);
        if(bytesRead > 0) {
            const start = buffer.indexOf(Buffer.from('mvhd')) + 17;
            const timeScale = buffer.readUInt32BE(start, 4);
            const duration = buffer.readUInt32BE(start + 4, 4);
            const vidseconds = Math.floor(duration/timeScale);
            ss = vidseconds % 60;
            mm = Math.floor(vidseconds / 60) % 60;
            hh = Math.floor(vidseconds / 3600);
        }
        fs.close(fd, () => {});
    }
    catch(e) {
        console.log(e);
    }
    
    return {ss: ss, mm: mm, hh: hh};
    
    /*
    if(movieLength === 0) {
        buffer = fs.readFileSync(path);
        start = buffer.indexOf(Buffer.from('mvhd')) + 17;
        console.log('start ' + start);
            timeScale = buffer.readUInt32BE(start, 4);
            duration = buffer.readUInt32BE(start + 4, 4);
            movieLength = Math.floor(duration/timeScale);
            
            console.log('time scale: ' + timeScale);
            console.log('duration: ' + duration);
            console.log('movie length: ' + movieLength + ' seconds');
    }
    */
}