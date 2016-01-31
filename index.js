/**
 * Tail our CloudWatch logs
 *
 */
'use strict';

var _ = require('lodash');
var AWS = require('aws-sdk');
var cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'us-east-1' });

var initialParams = {
	logGroupName: '/aws/lambda/' + process.argv[2],
	interleaved: true,
};

initialParams.startTime = new Date().getTime() - 60000;
initialParams.endTime = new Date().getTime();

var lastEventIds = [];

function getLogs(params, nextToken) {
	var pagedParams = _.clone(params);
	pagedParams.nextToken = nextToken;
	cloudwatchlogs.filterLogEvents(pagedParams, function(error, data) {
		if (error) {
			console.log(error)
		}

		// Trim the lastEventIds
		if(lastEventIds.length > 50){
			lastEventIds = lastEventIds.slice(25);
		}

		if (data.events.length !== 0) {
			var lastDate;
			data.events.forEach(function(event) {
				var ts = new Date(event.timestamp);
				// Only print logs that have not already been printed
				if(lastEventIds.indexOf(event.eventId) < 0){
					console.log(ts + ' : ' + event.message);
					lastEventIds.push(event.eventId);
				}
				if(lastDate === undefined || lastDate < ts){
					lastDate = ts;
				}
			});
			// Only change the start time if we actually received some events
			params.startTime = lastDate.getTime();
		}
		// Pageing support
		if(data.nextToken){
			getLogs(params, data.nextToken);
		} else {
			params.endTime = new Date().getTime();
			setTimeout(getLogs, 2000, params)
		}
	})
}

if (process.argv.length != 3) {
	console.log("usage: node " + process.argv[1] + " LambdaLogName");
	process.exit(1);
}
getLogs(initialParams);
