

var bannerChangeTimer = null;


window.onload = function() {
    videoList();
};

window.onscroll = async () => {
    const videoPlayer = selector('.video_player');
    const videoContainer = selector('.video_container');
    if(videoPlayer && videoContainer) {
        const rect = videoContainer.getBoundingClientRect();
        if(Math.floor(rect.top) < 0) {
            videoPlayer.classList.add("fixed");
        }
        else {
            videoPlayer.classList.remove("fixed");
        }
    }
}

function videoList(path) {
    transitionInit();
    var query = '/videolist'
    if(path) {
        query += '?path=' + path;
    }
    fetchJSON(query, {method: 'GET'}, 
        json => {
            hideLoadscreen();
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
                    
                    makeBanner(json.categoryList.concat(json.videoList));

                    setTimeout(() => {
                        if(path) { //display when not from onload
                            displayBackBtn(); //call not from onload
                        }
                        div.classList.remove("hiddenRight");
                        if(div.previousElementSibling) {
                            div.previousElementSibling.classList.add("hiddenLeft");
                            setTimeout(() => div.previousElementSibling.classList.add("gone"), 600);
                        }
                    }, 50);
                }
                else {
                    displayEmpty();
                }
            }
            scrollToTop();
        });
}

function loadVideo(path, file) {
    transitionInit();
    var query = '/video?'
    if(file) query += 'file=' + file;
    if(path) query += '&path=' + path;
    fetchJSON(query, {method: "GET"},
        json => {
            hideLoadscreen();
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

                makeBanner(json.videoList);

                setTimeout(() => {
                    div.classList.remove("hiddenRight");
                    if(menuWrapper.lastElementChild) {
                        menuWrapper.lastElementChild.classList.add("hiddenLeft");
                        setTimeout(() => menuWrapper.lastElementChild.classList.add("gone"), 600);
                    }
                    if(div.previousElementSibling) {
                        div.previousElementSibling.remove();
                    }
                    displayBackBtn();
                }, 50);
                scrollToTop();
            }
            window.scroll({top: 0});
        });
}

function makeCategoryList(list) {
    const div = createElement('div');
    var html = '';
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

function makeVideoList(list, selectedVid) {
    const div = createElement('div');
    var html = '';
    if(!isEmpty(list)){
        html = '<h3>Video List</h3>';
        var num = 1;
        for(var item of list) {
            if(item.name === selectedVid) {
                html += `<div class="vid_item selected">`;
            }
            else {
                html += `<div class="vid_item" onclick="loadVideo('${item.base}', '${item.name}')">`;
            }
            
            html += `   <div class="vid_info">${num}</div>
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
    var html = `
        <div id="video_holder">
            <h3>${removeExtension(video.name)}</h3>
            <div class="video_container">
                <video poster="${video.thumbnail}" controls playsinline
                    class="video_player"
                    ontouchstart="vidTouchStart(this)"
                    ontouchend="vidTouchEnd(this)"
                    ontouchmove="vidTouchMove(this)">
                    <source src="${video.base}/${video.name}" type="video/mp4">
                </video>
            </div>
        </div>`;

    div.innerHTML = html;

    div.appendChild(makeVideoList(videoList, video.name));

    return div;
}

function makeBanner(list) {
    if(list) {
        list = list.filter(item => item.thumbnail && !item.thumbnail.includes('default'))
            .map(item => item.thumbnail);
    
        clearTimeout(bannerChangeTimer);
        scrollBanner(list, 0);
    }
}

function scrollBanner(list, index) {
    const bannerHolder = selector('#banner_images');
    
    if(index >= list.length) {
        index = 0;
    }

    const img = createElement('img');
    img.src = list[index];

    bannerHolder.appendChild(img);

    if(bannerHolder.childElementCount > 1) {
        if(bannerHolder.firstElementChild.style.marginLeft === "-100%") {
            bannerHolder.firstElementChild.remove();
        }

        bannerHolder.firstElementChild.style.marginLeft = "-100%";
    }

    if(list.length > 1) {
        bannerChangeTimer = setTimeout(() => scrollBanner(list, index + 1), 2000);
    }
}

function back() {
    hideEmpty();
    hideError();
    window.scroll({top: 0});
    const videoWrapper = selector('#video_wrapper');
    const menuWrapper = selector('#menu_wrapper');
    var lastElem = null;
    if(videoWrapper.childElementCount > 0) {
        console.log("Video back");
        lastElem = videoWrapper.lastElementChild;
        lastElem.classList.add('hiddenRight');
        if(lastElem.previousElementSibling) {
            lastElem.previousElementSibling.classList.remove('gone');
            lastElem.previousElementSibling.classList.remove('hiddenLeft');
        }
        else if(menuWrapper.lastElementChild) {
            menuWrapper.lastElementChild.classList.remove('gone');
            menuWrapper.lastElementChild.classList.remove('hiddenLeft');
        }
    }
    else if(menuWrapper.childElementCount > 1){
        console.log("Menu back");
        lastElem = menuWrapper.lastElementChild;
        lastElem.classList.add('hiddenRight');
        lastElem.previousElementSibling.classList.remove('gone');
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
        }, 700);
    }
}

function fetchJSON(path, options, callback) {
    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        displayError();
        hideLoadscreen();
        return;
    }
    
    return window.fetch(path, options)
        .then(response => response.json())
        .then(callback)
        .catch(e => {
            console.log(e);
            displayError();
            hideLoadscreen();
        });
}

function transitionInit() {
    displayLoadscreen();
    hideEmpty();
    hideError();
}

function scrollToTop() {
    window.scroll({top: 0});
}

function vidTouchStart(elem) {
    elem.isVidTouched = true;
}

function vidTouchEnd(elem) {
    if(elem.isVidTouched) {
        playVideo(elem);
    }
}

function vidTouchMove(elem) {
    elem.isVidTouched = false;
}

function playVideo(elem) {
    if(elem && elem.play && elem.pause) {
        if(elem.paused) elem.play();
        else elem.pause();
    }
}

function displayError() {
    selector('#error_message').remove('gone');
}

function displayEmpty() {
    selector('#empty_message').remove('gone');
}

function hideError() {
    selector('#error_message').classList.add('gone');
}

function hideEmpty() {
    selector('#empty_message').classList.add('gone');
}

function displayLoadscreen() {
    selector('#load_screen').classList.remove('gone');
}

function hideLoadscreen() {
    selector('#load_screen').classList.add('gone');
}

function displayBackBtn() {
    selector('#back_button_wrapper').classList.remove('gone');
}

function hideBackBtn() {
    selector('#back_button_wrapper').classList.add('gone');
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