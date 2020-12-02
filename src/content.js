// Global schedule
var schedule = [];

chrome.storage.local.get(['launchZoom', 'closeZoomWindow'], (obj) => {
    const veracrossHost = "portals.veracross.com";
    if (obj.launchZoom){
        if (window.location.host == veracrossHost) {
            setTimeout(onPageLoadActions, 1000)
        }
    }

    const zoomHost = "seattlecountryday.zoom.us";
    if (obj.closeZoomWindow) {
        if (window.location.host == zoomHost) {
            setTimeout(closeZoomWindow, 5000)
        }
    }
});

function closeZoomWindow() {
    console.log("closeZoomTab: " + Date.now());
    window.close();
}

function onPageLoadActions() {
    let day = ""
    try {
        day = document.getElementsByClassName('date-header')[0].innerText;
    } catch {
        console.log("ERROR: Incorrect page.");
        return;
    }
    // day = "Sunday, Nov 8";

    if (day.includes('Nov') || day.includes('Dec')) {
        day += ' 2020';
    } else {
        day += ' 2021';
    }

    const scheduleItems = document.getElementsByClassName('vx-schedule-item');
    if (scheduleItems.length == 0) {
        console.log("ERROR: No schedule found.")
        return;
    }

    for (const item of scheduleItems){
        let time = item.getElementsByClassName('item-time')[0].innerText;
        time = time.replace('NOW', '').trim();
        let epoch_start = Date.parse(day + ' ' + time);
        const MAX_LESSON_LENGTH = 3600 * 1e3; // 1 h
        let epoch_end = epoch_start + MAX_LESSON_LENGTH;
        let title = item.getElementsByClassName('item-main-description')[0].innerText;
        let link = null; 
        try {
            link = item.getElementsByClassName('item-virtual-meeting')[0].getElementsByTagName('a')[0].href;
        } catch (err) {
            // console.log('INFO: Link not available');
        }
        if (schedule.length > 0) {
            schedule[schedule.length - 1]['end'] = epoch_start;
        }

        schedule.push({
            time: time,
            start: epoch_start,
            end: epoch_end,
            title: title,
            link: link,
            launched: 0
        });
    }

    console.log(day);
    console.log(schedule);
    const scheduleDiv = document.getElementsByClassName('schedule')[0];
    const msg = `<h3>Veracross Zoom Auto: Schedule found with ${schedule.length} classes...</h3>`;
    scheduleDiv.innerHTML = `<div id="schedule-bar" class="ae-grid vx-schedule-item">${msg}</div>` + scheduleDiv.innerHTML;
    if (schedule.length > 0) {
        setTimeout(scheduleRefresh, 5000)
    }
}

function scheduleRefresh() {
    if (schedule.length == 0) return;

    console.log(Date.now())
    let scheduleBar = document.getElementById('schedule-bar');
    let currentItem = null;
    let nextItem = null;
    now = Date.now(); // - 11*3600*1000; // - 28*60*1000;
    for(let i = 0; i<schedule.length; i++) {
        let item = schedule[i];
        if (now > item['start'] && now < item['end']) {
            currentItem = item;
        }

        if (now < item['start'] && (now + 2*3600*1e3) > item['start'] && nextItem==null) {
            nextItem = item;
        }

        if (currentItem!=null && (now - currentItem['start']) < 5*1e3 && currentItem['link']!=null && currentItem['launched'] == 0) {
            schedule[i]['launched'] = 1;
            window.open(currentItem['link'], '_blank')
            console.log("Launch: " + currentItem['link']);
        }
    }

    let html = '';
    if (currentItem != null) {
        if ((now - currentItem['start']) < 5*1e3 && currentItem['link']!=null && currentItem['launched'] == 1) {
            msg = "Launching:";
        } else {
            msg = "Now:";
        }

        if (currentItem['link'] == null) {
            title = currentItem['title'];
        } else {
            title = `<a target="_blank" href="${currentItem['link']}">${currentItem['title']}</a>`;
        }

        html += `<div class="ae-grid__item item-sm-2"><h3>${msg}</h3></div><div class="ae-grid__item item-sm-10"><h3>${title}</h3></div><br>`;
    }

    if (nextItem != null) {
        let timeDiff = nextItem['start'] - now;
        let msg = "Next:";

        if (timeDiff < 60*1e3) {
            let sec = Math.floor(timeDiff/1000)%60;
            msg = `In ${sec} sec:`;
        } else if (timeDiff < 60*60*1e3) {
            let min = Math.floor(timeDiff/(60*1000))%60;
            msg =`In ${min} min:`;
        }

        if (nextItem['link'] == null) {
            title = nextItem['title'];
        } else {
            title = `<a target="_blank" href="${nextItem['link']}">${nextItem['title']}</a>`;
        }

        html += `<div class="ae-grid__item item-sm-2"><h3>${msg}</h3></div><div class="ae-grid__item item-sm-10"><h3>${title}</h3></div><br>`;
    }
    
    if (currentItem == null && nextItem == null) {
        html += '<h3>Veracross Zoom Auto: No classes found within the next few hours</h3>';
    }

    scheduleBar.innerHTML = html;

    setTimeout(scheduleRefresh, 1000)
}

