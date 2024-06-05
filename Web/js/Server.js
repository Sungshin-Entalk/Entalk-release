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
app.use(express.static(path.join(__dirname, '..', '..', 'web')));

const pythonScriptPath = path.join(__dirname, "..", "..", "AI", "Text", "test.py");

app.post('/submit', async (req, res) => {
    const userMessage = req.body.message;
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Python executable not found.');
    }
});

// 최근 파일 URL 불러오는 라우트
app.get('/latest-audio', async (req, res) => {
    const params = {
        Bucket: 'aws-entalk', // 버킷 이름
        Prefix: 'audio/output-' // 'audio/' 폴더 내 'output-'로 시작하는 파일
    };

    try {
        const s3Response = await s3.listObjectsV2(params).promise();
        const objects = s3Response.Contents;
        if (objects.length === 0) {
            console.log('No audio files found');
            return res.status(404).send({ message: 'No audio files found' });
        }

        // 가장 최근 파일을 찾기 위해 정렬
        const sortedFiles = objects.sort((a, b) => b.LastModified - a.LastModified);
        
        // 가장 최근 파일의 URL 가져오기
        const latestFile = sortedFiles[0];
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'aws-entalk',
            Key: latestFile.Key,
            Expires: 60 * 5 // URL은 5분 동안 유효
        });
        console.log('Latest audio URL:', url);
        res.send({ url });
    } catch (error) {
        console.error('Error fetching the latest audio:', error);
        res.status(500).send({ message: 'Error fetching the latest audio' });
    }
});


app.listen(PORT, () => {
    console.log('Serving static from:', path.join(__dirname, 'web'));
    console.log('__dirname:', __dirname);
    console.log(`Server running at http://localhost:${PORT}`);
});
