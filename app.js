var fs = require("fs");

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('Bahia-911.tsv')
});

var events = {},
    count = 0;

lineReader.on('line', function (line) {
    var record = line.split(/\t/g);

    if (count > 0) {
	    var event = record[3];
	    events[event] = events[event] ? events[event] + 1 : 1;
	}

	if (count > 150357) {
    	console.log(events);
	}

	count++;
});

// console.log(events);