const fs = require('fs');
const {exec} = require('child_process');

const videoDir = __dirname.replace(/\\/g, "/") + "/videos/";

function generateThumbnail(path) {
    const files = getAllFiles(path);
    const directories = [];
    files.forEach(file => {
        const name = file.name;
        if(file.isDirectory()) {
            directories.push(name);
        }
        else if(name.endsWith('mp4')) {
            exec(`ffmpeg -i "${path}/${name}" -r 1 -ss 5 -vframes 1 -y "${path}/${name}.png"`);
        }
    });
    directories.forEach(dir => generateThumbnail(`${path}/${dir}/`));
}

function getAllFiles(path) {
    try {
        return fs.readdirSync(path, {withFileTypes: true});
    }
    catch(e) {
        console.log(e);
    }
    return [];
}

generateThumbnail(videoDir);