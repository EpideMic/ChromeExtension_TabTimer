// checks if the timer matches the recommendation
function isTimerOk(url, datetime) {
    // check if datetime is in the future
    var isoNow = Date.parse(getTimezonedIsoNow());
    //normalizeDatetime(datetime); 
    // !!!!!
    if (datetime <= isoNow) {
        changeStatus('Date has to be in the future !');
        return false;
    };
    // get the list of timers stored in storage
    chrome.storage.sync.get({
        timerList: []
    }, function(result) {
        var timerList = result.timerList;
        // itteration over every single timer added to the list
        for (var i = 0; i < timerList.length; i++) {
            var timer = timerList[i].timer;
            // check if timer is existing
            if (timer.url == url && Date.parse(timer.date) == datetime) {
                chrome
                changeStatus('Timer already added !');
                return false;
            };
        };
    });
    return true;
};


// Creates a Guid and returns it to the caller
function getGuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    // then to call it, plus stitch in '4' in the third group
    guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    return guid;
}

// Save it using the Chrome extension storage API.
// chrome.storage.local.get('inUrl', function (result) {
function saveUrl() {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    // Get current tab to get the used URL
    chrome.tabs.query(queryInfo, function(tabs) {
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];
        // https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;
        var datetime = getDatetime();
        var normDatetime = getNormalizedDatetime();

        //alert(Date.parse(datetime));
        // only add the timer if it matches the recommendations	
        if (isTimerOk(url, datetime) == true) {
            var guid = getGuid();
            // Save it using the Chrome extension storage API.
            var timer = {
                guid: guid,
                url: url,
                date: normDatetime
            };
            // get current array
            chrome.storage.sync.get({
                timerList: []
            }, function(result) {
                //Add new entry to array
                var timerList = result.timerList;
                timerList.push({
                    timer
                });
                chrome.storage.sync.set({
                    timerList: timerList
                });
            });

            // Set alarm to defined date and time to trigger opening of a new tab
            chrome.alarms.create(guid, {
                when: normDatetime
            });
            changeStatus('Timer added');
        };
    });
};

// HELPER ----------------------------------------------------------------------------------

// returns Date.Now() as ISO without seconds and miliseconds. 
// toISOString destroys the timezone so we have to add it manually...
// datetime-local can somehow not handle more precise dates 
function getTimezonedIsoNow() {
    var normDate = new Date();
    var timezonedIsoDate = new Date(Date.parse(normDate.toISOString()) - normDate.getTimezoneOffset() * 60000).toISOString();
    var timezonedIsoDateShort = timezonedIsoDate.substr(0, timezonedIsoDate.length - 8);

    return timezonedIsoDateShort;
}

// Changes the current status
function changeStatus(statusText) {
    document.getElementById('status').textContent = statusText;
};

// Initialize the DateTime-input with now
function initDatetime() {
    document.getElementById('ipDatetime').value = getTimezonedIsoNow();
};

// Get the datetime specified in field ipDatetime 
function getDatetime() {
    var controlDate = document.getElementById('ipDatetime').value;
    return Date.parse(controlDate);
};

// Get the datetime specified in field ipDatetime 
// "Faked" time has to be normaliezed again... Yes...tah sux !
function getNormalizedDatetime() {
    var normDate = new Date();
    //var controlDate = getDatetime();
    var timezonedIsoDate = getDatetime() + normDate.getTimezoneOffset() * 60000;

    return timezonedIsoDate;
};

// ------------------------------------------------------------------------------------------
// Triggered when button is clicked
document.addEventListener('DOMContentLoaded', function() {
    // just for debugging
    initDatetime();

    // Get 
    document.getElementById('addCurrent')
        .addEventListener('click', function(e) {
            saveUrl();
            //window.close();
        });
    document.getElementById('removeCurrent')
        .addEventListener('click', function(e) {
            chrome.storage.sync.clear();
            chrome.alarms.clearAll();
            changeStatus('All timers have been removed !');
            //window.close();
        });
    document.getElementById('settingsLink')
        .addEventListener('click', function(e) {
            changeStatus('settingsLink... ');
            //chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
            //window.close();
        });
});