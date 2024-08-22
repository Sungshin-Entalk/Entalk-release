const express = require('express');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const app = express();
const PORT = 3000;
const path = require('path');


// Python 경로를 동적으로 찾기
const getPythonExecutable = () => {
    return new Promise((resolve, reject) => {
        exec('which python3', (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

// dotenv 패키지를 로드합니다.
require('dotenv').config();

// AWS S3 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'Web')));

const pythonScriptPath = path.join(__dirname, "..", "..", "AI", "Text", "test.py");

app.post('/submit', async (req, res) => {

    console.log('Received request:', req.body);

    const userMessage = req.body.message;
    const character = req.body.character; // 캐릭터 정보를 받아옴
    let pythonScriptPath;

    // 캐릭터에 따라 실행할 Python 스크립트를 선택
    if (character === 'sherlock') {
        pythonScriptPath = path.join(__dirname, "..", "..", "AI", "Text", "test.py");
    } else if (character === 'spiderman') {
        pythonScriptPath = path.join(__dirname, "..", "..", "AI", "Text", "test_spiderman.py");
    } else if (character === 'hermione') {
        pythonScriptPath = path.join(__dirname, "..", "..", "AI", "Text", "test_hermione.py");
    } 
    else {
        console.log('Unknown character:', character); // 오류 로그
        return res.status(400).send('Unknown character');
    }

    try {
        const pythonExecutable = await getPythonExecutable();
        exec(`${pythonExecutable} "${pythonScriptPath}" "${userMessage}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send(stderr);
            }
            // Python 스크립트의 출력을 클라이언트에게 전송
            const userResponse = stdout.trim().split("\n").slice(-1)[0]; // 유저 메시지와 응답만 추출
            res.json({ reply: userResponse });
            console.log('User response:', userResponse);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Python executable not found.');
    }
});


// 최근 파일 URL 불러오는 라우트
// 셜록 audio 연결 코드
app.get('/latest-audio-sherlock', async (req, res) => {
    const params = {
        Bucket: 'aws-entalk',
        Prefix: 'audio/output-' // 셜록의 오디오 파일이 'audio/sherlock-'로 시작한다고 가정
    };

    try {
        const s3Response = await s3.listObjectsV2(params).promise();
        const objects = s3Response.Contents;

        if (objects.length === 0) {
            console.log('No Sherlock audio files found');
            return res.status(404).send({ message: 'No Sherlock audio files found' });
        }

        const sortedFiles = objects.sort((a, b) => b.LastModified - a.LastModified);
        const latestFile = sortedFiles[0];
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'aws-entalk',
            Key: latestFile.Key,
            Expires: 60 * 5
        });
        console.log('Latest Sherlock audio URL:', url);
        res.send({ url });
    } catch (error) {
        console.error('Error fetching the latest Sherlock audio:', error);
        res.status(500).send({ message: 'Error fetching the latest Sherlock audio' });
    }
});

// 헤르미온느 audio 연결 코드
app.get('/latest-audio-hermione', async (req, res) => {
    const params = {
        Bucket: 'aws-entalk',
        Prefix: 'hermione/output-' // 헤르미온느의 오디오 파일이 'audio/hermione-'로 시작한다고 가정
    };

    try {
        const s3Response = await s3.listObjectsV2(params).promise();
        const objects = s3Response.Contents;

        if (objects.length === 0) {
            console.log('No Hermione audio files found');
            return res.status(404).send({ message: 'No Hermione audio files found' });
        }

        const sortedFiles = objects.sort((a, b) => b.LastModified - a.LastModified);
        const latestFile = sortedFiles[0];
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'aws-entalk',
            Key: latestFile.Key,
            Expires: 60 * 5
        });
        console.log('Latest Hermione audio URL:', url);
        res.send({ url });
    } catch (error) {
        console.error('Error fetching the latest Hermione audio:', error);
        res.status(500).send({ message: 'Error fetching the latest Hermione audio' });
    }
});

// 스파이더맨 audio 연결 코드
app.get('/latest-audio-spiderman', async (req, res) => {
    const params = {
        Bucket: 'aws-entalk',
        Prefix: 'spiderman/output-' 
    };

    try {
        const s3Response = await s3.listObjectsV2(params).promise();
        const objects = s3Response.Contents;

        if (objects.length === 0) {
            console.log('No Spiderman audio files found');
            return res.status(404).send({ message: 'No Spiderman audio files found' });
        }

        const sortedFiles = objects.sort((a, b) => b.LastModified - a.LastModified);
        const latestFile = sortedFiles[0];
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'aws-entalk',
            Key: latestFile.Key,
            Expires: 60 * 5
        });
        console.log('Latest Spiderman audio URL:', url);
        res.send({ url });
    } catch (error) {
        console.error('Error fetching the latest Spiderman audio:', error);
        res.status(500).send({ message: 'Error fetching the latest Spiderman audio' });
    }
});



app.listen(PORT, () => {
    console.log('Serving static from:', path.join(__dirname, 'Web'));
    console.log('__dirname:', __dirname);
    console.log(`Server running at http://localhost:${PORT}`);
});
