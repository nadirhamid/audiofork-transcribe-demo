# Audiofork Google Speech Transcribe Demo

## About 
This is a working demo that can generate live transcriptions using Google cloud speech APIs and [Asterisk Audiofork](https://github.com/nadirhamid/asterisk-audiofork).

## Setup

1. NPM install
```
npm install
```

2. Copy example .env
```
cp .env.example .env
```

3. update .env with the path to your  Google service-account.json

## Run Sample

```
node app.js
```

## Example Output

```
Running Audio fork Google cloud speech demo
Updated transription: Hello, my name is testing.
...
Updated transription: Hello, my name is testing. I am 15 years old.
```
