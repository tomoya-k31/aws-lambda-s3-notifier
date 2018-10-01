const https = require('https');
const url = require('url');

const slackWebhookUrl = url.parse(process.env.SLACK_WEBHOOK_URL);

exports.handler = (event) => {

    const bucketName = event.Records[0].s3.bucket.name;
    const awsRegion = event.Records[0].awsRegion;
    const eventName = event.Records[0].eventName;
    const filePath = event.Records[0].s3.object.key;
    const fileSize = bytesToSize(event.Records[0].s3.object.size);

    const payload = {
        username: 'AWS通知',
        attachments: [
            {
                'text': `:s3: AmazonS3 (${awsRegion})`,
                'color': '#C95849',
                'fields': [
                    {
                        "title": "EventType",
                        "value": `\`${eventName}\``,
                        "short": true
                    },
                    {
                        "title": "Object",
                        "value": `\`s3://${bucketName}/${filePath}\` (${fileSize})`,
                        "short": true
                    },
                ]
            }
        ],
    };

    const req = https.request({
        hostname: slackWebhookUrl.hostname,
        port: 443,
        path: slackWebhookUrl.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    req.write(JSON.stringify(payload));
    req.end();
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + sizes[i];
};