/**
 * Tail our CloudWatch logs
 *
 */
'use strict';
const AWS = require('aws-sdk');
const clone = require('clone');

const cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'us-east-1' });

const initialParams = {
	logGroupName: process.argv[2],
	interleaved: true,
};

if (!initialParams.logGroupName.startsWith('/')) {
	initialParams.logGroupName = `/aws/lambda/${initialParams.logGroupName}`;
}


initialParams.startTime = new Date().getTime() - 60000;
initialParams.endTime = new Date().getTime();

let lastEventIds = [];

function getLogs(params, nextToken) {
	let pagedParams = clone(params);
	pagedParams.nextToken = nextToken;
	cloudwatchlogs.filterLogEvents(pagedParams, (error, data) => {
		if (error) {
			console.log(error)
		}

		// Trim the lastEventIds
		if(lastEventIds.length > 50){
			lastEventIds = lastEventIds.slice(25);
		}

		if (data.events.length !== 0) {
			let lastDate;
			data.events.forEach((event) => {
				const ts = new Date(event.timestamp);
				// Only print logs that have not already been printed
				if(lastEventIds.indexOf(event.eventId) < 0){
					console.log(`[${ts}]\t${event.message}`);
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
	});
}
getLogs(initialParams);
