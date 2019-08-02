'use strict';

window.onload = () => {
    videoList();
};

window.onscroll = () => {
    //TODO
    //check for video tag
    //if video tag's offsetX < -???
    //change tags holder to fixed at bottom right
}

function videoList(path) {
    let query = '/videolist'
    if(path) {
        query += '?path=' + path;
        displayBackBtn(); //call not from onload
    }
    fetchJSON(query, {method: 'GET'}, 
        json => {
            if(json.error) {
                console.log("videoList " + json.error);
                displayError();
            }
            else {
                console.log(JSON.stringify(json));
                if(!(isEmpty(json.categoryList) && isEmpty(json.videoList))) {
                    const menuWrapper = selector('#menu_wrapper');
                    const div = createElement('div');
                    const fragment = createFragment();

                    fragment.appendChild(makeCategoryList(json.categoryList));
                    fragment.appendChild(makeVideoList(json.videoList));
                    
                    div.classList = 'wrapper hiddenRight';
                    div.appendChild(fragment);

                    menuWrapper.appendChild(div);
                    
                    setTimeout(() => {
                        div.classList.remove("hiddenRight");
                        if(div.previousElementSibling) 
                            div.previousElementSibling.classList.add("hiddenLeft");
                    }, 100);
                }
                else {
                    displayEmpty();
                }
            }
        });
}

function loadVideo(path, file) {
    displayBackBtn();
    let query = '/video?'
    if(file) query += 'file=' + file;
    if(path) query += '&path=' + path;
    fetchJSON(query, {method: "GET"},
        json => {
            if(json.error) {
                console.log("loadVideo " + json.error);
                displayError();
            }
            else {
                console.log(JSON.stringify(json));
                const menuWrapper = selector('#menu_wrapper');
                const videoWrapper = selector('#video_wrapper');
                const div = createElement('div');

                div.classList = "wrapper hiddenRight";
                div.appendChild(makeVideo(json));

                videoWrapper.appendChild(div);
                setTimeout(() => {
                    div.classList.remove("hiddenRight");
                    if(menuWrapper.lastElementChild) {
                        menuWrapper.lastElementChild.classList.add("hiddenLeft");
                    }
                    if(div.previousElementSibling) {
                        div.previousElementSibling.remove();
                    }
                }, 100);
            }
        });
}

function makeCategoryList(list) {
    const div = createElement('div');
    let html = '';
    if(!isEmpty(list)) {
        html = '<h3>Categrory List</h3>';
        for(var item of list) {
            html += `<div class="category" onclick="videoList('${item.base}/${item.name}')">
                        <img src="${item.thumbnail}">
                        <div class="category_name">${item.name}</div>
                    </div>`
        }
    }
    div.innerHTML = html;
    return div;
}

function makeVideoList(list) {
    const div = createElement('div');
    let html = '';
    if(!isEmpty(list)){
        html = '<h3>Video List</h3>';
        let num = 1;
        for(var item of list) {
            html += `<div class="vid_item" onclick="loadVideo('${item.base}', '${item.name}')">
                        <div class="vid_info">${num}</div>
                        <img src="${item.thumbnail}">
                        <div class="vid_info">
                            <div class="vid_title">${removeExtension(item.name)}</div>
                            <div class="vid_time">
                                ${item.time.hh}:${item.time.mm}:${item.time.ss}
                            </div>
                        </div>
                    </div>`
            num++;
        }
    }
    div.innerHTML = html;
    return div;
}

function makeVideo(data) {
    const div = createElement('div');
    const videoList = data.videoList;
    const video = videoList[data.videoInx];
    let html = `
        <div id="video_holder">
            <h3>${removeExtension(video.name)}</h3>
            <video poster="${video.thumbnail}" controls playsinline>
                <source src="${video.path}" type="video/mp4">
            </video>
        </div>`;

        html += `<div class="video_list_holder">
                    <h3>Playlist</h3>`;
        let num = 1;
        for(var item of videoList) {
            if(item === video) {
                html += `<div class="vid_item selected">`;
            }
            else {
                html += `<div class="vid_item" onclick="loadVideo('${data.base}', '${item.name}')">`;
            }
            
            html += `<div class="vid_info">${num}</div>
                        <img src="${item.thumbnail}">
                        <div class="vid_info">
                            <div class="vid_title">${removeExtension(item.name)}</div>
                            <div class="vid_time">
                                ${item.time.hh}:${item.time.mm}:${item.time.ss}
                            </div>
                        </div>
                    </div>`
            num++;
        }

        html += '</div>';

    div.innerHTML = html;
    return div;
}

function back() {
    const videoWrapper = selector('#video_wrapper');
    const menuWrapper = selector('#menu_wrapper');
    let lastElem = null;
    if(videoWrapper.childElementCount > 0) {
        console.log("Video back");
        lastElem = videoWrapper.lastElementChild;
        lastElem.classList.add('hiddenRight');
        if(lastElem.previousElementSibling) {
            lastElem.previousElementSibling.classList.remove('hiddenLeft');
        }
        else if(menuWrapper.lastElementChild) {
            menuWrapper.lastElementChild.classList.remove('hiddenLeft');
        }
    }
    else if(menuWrapper.childElementCount > 1){
        console.log("Menu back");
        lastElem = menuWrapper.lastElementChild;
        lastElem.classList.add('hiddenRight');
        lastElem.previousElementSibling.classList.remove('hiddenLeft');
    }
    else {
        console.log("Empty back");
    }

    if(lastElem) {
        setTimeout(() => {
            if(lastElem) //check if existing
                lastElem.remove();
            if(menuWrapper.childElementCount <= 1) {
                hideBackBtn();
            }
        }, 1000);
    }
}

function fetchJSON(path, options, callback) {
    return fetch(path, options)
        .then(response => response.json())
        .then(callback)
        .catch(console.log);
}


function displayError() {
    selector('#error_message').classList.remove('hidden');
}

function displayEmpty() {
    selector('#empty_message').classList.remove('hidden');
}

function displayBackBtn() {
    selector('#back_button_wrapper').classList.remove('hidden');
}

function hideBackBtn() {
    selector('#back_button_wrapper').classList.add('hidden');
}

function removeExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

function isEmpty(x) {
    if(x) {
        if(typeof x === 'string' || Array.isArray(x)) return x.length === 0;
        else false;
    }
    return true;
}

function selector(query) {
    return document.querySelector(query);
}

function selectorAll(query) {
    return document.querySelectorAll(query);
}

function createElement(element) {
    return document.createElement(element);
}

function createText(text) {
    return document.createTextNode(text);
}

function createFragment() {
    return document.createDocumentFragment();
}