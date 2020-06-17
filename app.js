var speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
var env = require("dotenv");

var parsed = env.config({
    path: '.env'
});
console.log("Running Audio fork Google cloud speech demo");
console.log("google credentials path is: " + process.env.GOOGLE_APPLICATION_CREDENTIALS);
var now = Date.now();
const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080
});
var fs = require('fs');
async function stt(file) {
    console.log("calling stt");
    const speechClient = new speech.SpeechClient();
    //const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');

    const audio = {
        content: audioBytes,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000,
        languageCode: 'en-US'
    };
    const request = {
        audio,
        config
    };
    console.log("calling API");
    return await speechClient.recognize(request);
}

var bytesThreshold = 1024 * 50;
wss.on('connection', function connection(ws) {
    console.log("got connection ");

    var recv = 0;
    var buffers = [];
    var transcription = "";
    var waiting = false;

    // use setImmediate to wait until waiting = false
    function wait() {
        return new Promise(function(resolve, reject) {
            if (waiting) {
                setImmediate(wait);
                return;
            }
            resolve();
        });
    }

    function processTranscriptionPart(part) {
        if (transcription === '') {
            transcription = part;
            return;
        }
        // add a space so that there is a break between processed segments
        transcription += ' ' + part;
    }

    ws.on('message', async function incoming(message) {
        await wait();
        recv += message.length;
        buffers.push(message);
        if (recv >= bytesThreshold) {
            // tell next messages to wait
            waiting = true;
            var sending = Buffer.concat(buffers);
            recv = 0;
            buffers = [];
            var data = await stt(sending);
            const results = data[0].results;
            const part = results.map(function(result) {
                return result.alternatives[0].transcript;
            }).join('\n');
            processTranscriptionPart(part);
            console.log("Updated transription: " + transcription);
            // complete the wait
            waiting = false;
        }
    });
});
