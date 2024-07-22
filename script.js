// script.js


//获取页面元素
const progressBar = document.querySelector('.progress-bar');
const currentTimeMarker = document.querySelector('.current-time-marker');
const eventMarker = document.querySelector('.event-marker');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const eventsTitle = document.querySelector('.events-title');

//设置开始时间和结束时间
let startTime = new Date();
let endTime = new Date(startTime);

let duration = 0;

// 初始化进度条宽度
progressBar.style.width = '100%';

// 获取提示音
const notificationAudio = new Audio('notification.wav');
const infoAudio = new Audio('info.wav');
const infoAudio2 = new Audio('info2.wav');

//设置事件列表
let events = [
    {name: "事件1", startTime: startTime, endTime: endTime},
    // 添加更多事件...
];


//#region 事件相关函数
//保存事件列表
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

//加载事件列表
function loadEvents() {
    const storedEvents = JSON.parse(localStorage.getItem('events'));
    if (storedEvents) {
        events = storedEvents;

        // 事件被存储到本地存储中会被自动转换为字符串，所以我们需要将其转换为Date对象
        events.forEach(event => {
            event.startTime = new Date(event.startTime);
            event.endTime = new Date(event.endTime);
        });

        refreshEventTime();
        //debug
        console.log("loadEvents " + events.length);
    }
}

//删除事件
function deleteEvent(event) {
    const index = events.indexOf(event);
    if (index > -1) {
        events.splice(index, 1);
    }
    refreshEventTime();
    saveEvents();
}

//清空事件
function clearEvents() {
    events = [];
    refreshEventTime();
    saveEvents();
}

//监听 clearEvents 按钮，点击时调用 clearEvents 函数
document.getElementById('clearEvents').addEventListener('click', clearEvents);

//#endregion



//#region 开始/结束时间 相关函数
//加载本地的开始时间和结束时间
function loadTime() {
    const storedStartTime = localStorage.getItem('startTime');
    const storedEndTime = localStorage.getItem('endTime');
    if (storedStartTime && storedEndTime) {
        // 事件被存储到本地存储中会被自动转换为字符串，所以我们需要将其转换为Date对象
        startTime = new Date(storedStartTime);
        endTime = new Date(storedEndTime);
        // 同时，将这两者的日期设置为今天
        const today = new Date();
        startTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
        endTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    }

    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');

    startTimeInput.value = startTime.toLocaleTimeString();
    endTimeInput.value = endTime.toLocaleTimeString();
    //debug
    console.log("loadTime " + startTime.toLocaleTimeString() + " " + endTime.toLocaleTimeString());
}

//保存开始时间和结束时间
function saveTime() {
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('endTime', endTime);
    //debug
    console.log("saveTime " + startTime.toLocaleTimeString() + " " + endTime.toLocaleTimeString());
}

//监听 setTimerRange 按钮，点击时调用 setTimerRange 函数
document.getElementById('setTimerRange').addEventListener('click', setTimerRange);

function setTimerRange() {
    //debug
    
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    
    const startTimeStr = startTimeInput.value;
    const endTimeStr = endTimeInput.value;

    console.log("setTimerRange" + startTimeStr + " " + endTimeStr);
    // 将输入的时间字符串转换为Date对象

    startTime.setHours(...startTimeStr.split(':').map(Number), 0);
    endTime.setHours(...endTimeStr.split(':').map(Number), 0);

    if (endTime <= startTime) {
        alert("End time must be after start time.");
        return;
    }

    // 重置时间和进度条
    duration = endTime - startTime;
    progressBar.style.width = '100%';
    currentTimeMarker.style.width = '0%';
    eventMarker.style.width = '0%';
    eventMarker.style.left = '0%';

    // 保存开始时间和结束时间
    saveTime();
    refreshEventTime();
}


//#endregion

// 更新当前时间和事件标记
function updateTime() {
    const now = new Date();
    //log
    //console.log(now.toLocaleTimeString() + "and " + startTime.toLocaleTimeString() + "to " + endTime.toLocaleTimeString() + " " + duration);
    if (now >= startTime && now <= endTime) {
        const progress = 100 - (now - startTime) / (endTime - startTime) * 100;
        currentTimeMarker.style.width = `${progress}%`;
        currentTimeDisplay.textContent = now.toLocaleTimeString();

        // 更新事件标记
        updateEventTime();
    } else {
        currentTimeDisplay.textContent = "Time out of range.\n" ;
        //debug
        console.log(now.toLocaleTimeString() + "is not in " + startTime.toLocaleTimeString() + "to " + endTime.toLocaleTimeString() + " " + duration);
    }
}


// 更新事件标记
function updateEventTime() {
    const now = new Date();
    //debug
    //console.log("updateEventTime");

    //将所有的eventMarker遍历
    document.querySelectorAll('.event-marker').forEach(i => {
        // 如果本来就是超出范围的事件，则不需要更改颜色和状态
        if (i.classList.contains('out-of-range')) return;

        // 只在需要更改的时候更改颜色和状态

        // 如果事件的开始时间在当前时间范围内，则将其设置为活动事件，并将其颜色设置为绿色
        if (i.startTime <= now && i.endTime >= now && i.style.backgroundColor != 'green') {
            //如果此前没激活，则激活并显示提示：“事件 已开始”
            if (!i.classList.contains('active')) {
                //使用 notify API
                const NOTIFICATION_TITLE = '事件已开始'
                const NOTIFICATION_BODY = i.title
                const CLICK_MESSAGE = 'Notification clicked'
                new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
                    () => console.log(CLICK_MESSAGE);
                
                //播放提示音
                infoAudio.play();
            }
            i.classList.add('active');
            //设置为半透明的绿色
            i.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        }
        // 如果事件的结束时间早于当前时间，则将其设置为已结束事件，并将其颜色设置为灰色
        if (i.endTime < now && i.style.backgroundColor != '#dc6da3') {
            //如果此前没结束且为激活状态，则结束并显示提示：“事件 已结束”
            if (i.classList.contains('active') && !i.classList.contains('ended')) {
                //使用 notify API
                const NOTIFICATION_TITLE = '事件已结束'
                const NOTIFICATION_BODY = i.title
                const CLICK_MESSAGE = 'Notification clicked'
                new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
                    () => console.log(CLICK_MESSAGE);
                
                //播放提示音
                infoAudio2.play();
            }
            i.classList.add('ended');
            i.style.backgroundColor = '#dc6da3';    
        }
    });
}


// 刷新事件标记，删除所有事件标记并重新添加
function refreshEventTime() {
    // 清除所有的事件标记
    if (document.getElementsByClassName('event-marker') != null)
    {
        const eventMarkers = document.getElementsByClassName('event-marker');
        while (eventMarkers.length > 0) {
            eventMarkers[0].parentNode.removeChild(eventMarkers[0]);
        }
    }

    // 为每个事件添加一个事件标记,并设置它的位置
    events.forEach(i => {
        //debug
        console.log("🔵" + i.name + " " + i.startTime.toString() + " " + i.endTime.toString());

        const eventMarker = document.createElement('div');
        eventMarker.className = 'event-marker';

        //添加title属性，但是不显示
        eventMarker.title = i.name;
        //添加 startTime 和 endTime 属性，用于编辑事件
        eventMarker.startTime = i.startTime;
        eventMarker.endTime = i.endTime;

        //如果事件的开始事件超出了显示时间范围，则将其在进度条的外部显示
        //如果 事件的结束时间早于进度条显示的startTime，则将其在进度条的左侧外部显示
        if (i.endTime < startTime) {
            //debug
            console.log("🔴" + i.name + ".endTime < startTime  " + i.endTime + " " + startTime);
            eventMarker.style.left = '-10px';
            eventMarker.style.width = `15px`;

            //状态设置为 out of range
            eventMarker.classList.add('out-of-range');
        }
        //如果 事件的开始时间晚于进度条显示的endTime，则将其在进度条的右侧外部显示
        else if (i.startTime > endTime) {
            //debug
            console.log("🔴"+i.name + ".startTime > endTime  " + i.startTime + " " + endTime);
            eventMarker.style.right = '-10px';
            eventMarker.style.width = `15px`;
            eventMarker.classList.add('out-of-range');
        }
        else{
            //debug
            console.log("🟢"+i.name + ".startTime < endTime  " + i.startTime + " " + endTime);
            eventMarker.style.left = `${(i.startTime - startTime) / duration * 100}%`;
            eventMarker.style.width = `${(i.endTime - i.startTime) / duration * 100}%`;
        }


        //将事件标记添加到进度条中
        progressBar.appendChild(eventMarker);
        updateEventTime();
    });
    
    
    //清空eventsTitle的子对象
    eventsTitle.innerHTML = '';

    //为每个事件添加一个标题（实际上是按钮）
    document.querySelectorAll('.event-marker').forEach(i => {
        //在外部添加一个标题，和ecentmarker对齐
        const title = document.createElement('button');
        title.className = 'eventTitle';
        title.textContent = i.title;
        //i不为eventsTitle的子对象，但是与其对齐
        eventsTitle.appendChild(title);
        //将文字与eventmarker对齐
        title.style.left = `${i.getBoundingClientRect().left * 1}px`;
    });
}

//监听 eventsTitle 的点击事件
eventsTitle.addEventListener('click', function(event) {
    //debug
    console.log("eventsTitle click");
    //展示其信息并询问是否删除该事件
    //使用alart
    //如果点击了确定，就删除该事件

    //获取事件的名称
    const eventName = event.textContent;
    //获取事件的开始时间
    const eventStartTime = event.startTime;
    //获取事件的结束时间
    const eventEndTime = event.endTime;
    
    //使用 alart API
    const result = confirm(`是否删除事件 ${eventName} ?`);
    if (result) {
        //删除事件
        //deleteEvent({name: eventName, startTime: eventStartTime, endTime: eventEndTime});
    }
});


//监听 addEvent 按钮，点击时调用 addEvent 函数
document.getElementById('addEvent').addEventListener('click', addEvent);

function addEvent() {
    const eventNameInput = document.getElementById('eventNameInput');
    const eventStartTimeInput = document.getElementById('eventStartTimeInput');
    const eventEndTimeInput = document.getElementById('eventEndTimeInput');

    const eventName = eventNameInput.value;
    const eventStartTimeStr = eventStartTimeInput.value;
    const eventEndTimeStr = eventEndTimeInput.value;

    //debug
    console.log("addEvent" + eventName + " " + eventStartTimeStr + " " + eventEndTimeStr);
    // 将输入的时间字符串转换为Date对象
    const eventStartTime = new Date(startTime);
    const eventEndTime = new Date(startTime);
    eventStartTime.setHours(...eventStartTimeStr.split(':').map(Number), 0);
    eventEndTime.setHours(...eventEndTimeStr.split(':').map(Number), 0);

    if (eventEndTime <= eventStartTime) {
        alert("Event end time must be after start time.");
        return;
    }

    // 将新事件添加到事件列表中
    events.push({name: eventName, startTime: eventStartTime, endTime: eventEndTime});

    // 重置事件输入框
    eventNameInput.value = '';
    eventStartTimeInput.value = '';
    eventEndTimeInput.value = '';

    // 更新事件标记
    refreshEventTime();
    // 保存事件列表
    saveEvents();
}


function editEvent() {
    //debug
    console.log("editEvent");
    // 将新事件添加到事件列表中
    //events.push({name: eventName, startTime: eventStartTime, endTime: eventEndTime});

    // 重置事件输入框
    //eventNameInput.value = '';
    //eventStartTimeInput.value = '';
    //eventEndTimeInput.value = '';

    // 更新事件标记
    refreshEventTime();
    // 保存事件列表
    saveEvents();
}

loadEvents();
loadTime();
setTimerRange();


setInterval(updateTime, 1000); // 每秒更新一次


//添加一个功能，有一个开关控制 是否 每 一段时间询问一次你在做什么
// 开关可以控制是否询问
// 如果询问，询问的时间间隔可以设置
// 每次询问时，可以输入你在做什么，然后记录下来
// 询问的内容可以在页面上显示出来

//获取 id = ifAskDoing
const ifAskDoing = document.getElementById('ifAskDoing');
//获取 id = doingLogList
const doingLogList = document.getElementById('doingLogList');
//获取 id = askIntervalInput
const askIntervalInput = document.getElementById('askIntervalInput');


let isAsking = false;
let askInterval = 0;
let askTimer;

// 监听 ifAskDoing 开关的变化
ifAskDoing.addEventListener('change', function() {
    isAsking = ifAskDoing.checked;
    if (isAsking) {
        startAskTimer();
    } else {
        stopAskTimer();
    }
});

// 监听 askIntervalInput 输入框的变化
askIntervalInput.addEventListener('input', function() {
    askInterval = parseInt(askIntervalInput.value);
    if (isAsking) {
        restartAskTimer();
    }
});

// 启动询问定时器
function startAskTimer() {
    if (askInterval > 0) {
        askTimer = setInterval(askDoing, askInterval * 1000);
    }
}

// 停止询问定时器
function stopAskTimer() {
    clearInterval(askTimer);
}

// 重新启动询问定时器
function restartAskTimer() {
    stopAskTimer();
    startAskTimer();
}

let thingsAreDoing = [];
let thingsAreDoingIndex = 0;
let doingAskingTime = new Date().toTimeString();
// 询问正在做的事情
function askDoing() {
    //先尝试获取上一次的回答，如果没有就默认为“没有回答”，即为和上一次一样，如果上次也没有回答，就默认为“没有回答”
    if(thingsAreDoing[thingsAreDoingIndex] == null || thingsAreDoing[thingsAreDoingIndex] == ""){
        if(thingsAreDoingIndex == 0 || thingsAreDoing[thingsAreDoingIndex - 1] == null || thingsAreDoing[thingsAreDoingIndex - 1] == ""){
            doingLogList.innerHTML += `<li>${doingAskingTime}  没有回答</li>`;
            thingsAreDoing[thingsAreDoingIndex] = "没有回答";
            doingAskingTime = new Date().toTimeString();
        }else{
            doingLogList.innerHTML += `<li>${doingAskingTime + thingsAreDoing[thingsAreDoingIndex - 1]} </li>`;
            //当前的回答就是上一次的回答
            thingsAreDoing[thingsAreDoingIndex] = thingsAreDoing[thingsAreDoingIndex - 1];
        }
    }


    //然后进行新的询问


    //使用 notify API
    //如果点击了消息，就会弹出一个输入框，输入后记录下来
    //如果输入内容为空，就会默认和上一次一样
    //如果点击了关闭，或者消息超时，就会记录下来“没有回答”
    //使用 notify API
    const NOTIFICATION_TITLE = '正在做什么？'
    const NOTIFICATION_BODY = '点击回答'
    const CLICK_MESSAGE = 'Notification clicked'
    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
        () => {
            //使用 dialog API
            //const { dialog } = require('electron').remote;
            window.open('inputBox.html', '_blank', 'top=500,left=200,frame=false,nodeIntegration=no')
        };

    thingsAreDoingIndex++;

    //播放提示音
    notificationAudio.play();
}

//如果检测到窗口大小变化，就重新设置事件标题的位置
window.onresize = function() {
    document.querySelectorAll('.eventTitle').forEach(i => {
        const eventMarker = document.querySelector('.event-marker');
        i.style.left = `${eventMarker.getBoundingClientRect().left * 1}px`;
    });
}




