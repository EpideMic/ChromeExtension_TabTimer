function addListItem(guid, url, date) {
    var list = document.getElementById('urlList');
    var listEntry = document.createElement('li');
    var hrefEntry = document.createElement('a');
    var urlEntry = document.createTextNode(url + ' ' + date);

    hrefEntry.setAttribute('href', url);
    hrefEntry.appendChild(urlEntry);
    listEntry.appendChild(hrefEntry);
    list.appendChild(listEntry);
};

/* 
	var list = document.getElementById('urlList')
						.getElementsByTagName('li');
	
	// only add new URLs
	// ToDo: Change to URL + Date
	for (var i = 0; i < list.length; i++) {
		var innerUrl = list[i].getElementsByTagName('a')[0].getAttribute('href');
		if ( innerUrl == url)
			ret = true;
	}
*/

// catches every triggered alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
    var highli;
    // alarm.name holds the guid the url is identified by in storage
    chrome.storage.sync.get({ timerList: [] }, function(result) {
        var timerList = result.timerList;
        // itteration over every single timer added to the list
        for (var i = 0; i < timerList.length; i++) {
            var timer = timerList[i].timer;
            // only show url(timer) identified by guid given in alarm.name
            if (timer.guid == alarm.name) {
                addListItem(timer.guid, timer.url, timer.date);
                // open tab for current alarm
                //chrome.tabs.create({url: timer.url, selected: false, pinned: true}, function(newTab){
                chrome.tabs.create({ url: timer.url, selected: false, pinned: false }, function(newTab) {
                    chrome.tabs.executeScript(newTab.id, { code: "document.title = '<-TabTimer->'" });
                    //todo: set favicon to highlight new
                });

                // delete the timer from timerlist
                timerList.splice(i, 1);
                i = i - 1;
                // write back the modified array
                chrome.storage.sync.set({ timerList: timerList });
            };
        };
    });
});

// Triggered when any part of chrome.storage is changed (add, delete included)
// Saves storagechanges to backgroundpage
chrome.storage.onChanged.addListener(function() {
    chrome.storage.sync.get(function(result) {
        // Add URL + timestamp to list
        addListItem(result.Guid, result.Url, result.Date);
    });
});


