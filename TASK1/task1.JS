// server.js
const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const WINDOWSIZE = 10;
let numberWindow = [];

const apiUrls = {
    'p': 'http://20.244.56.144/evaluation-service/primes',
    'f': 'http://20.244.56.144/evaluation-service/fibo',
    'e': 'http://20.244.56.144/evaluation-service/even',
    'r': 'http://20.244.56.144/evaluation-service/rand',
};


const AUTHTOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMwNzQ5LCJpYXQiOjE3NDcwMzA0NDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjJlNWE2OTA2LWZiZTMtNGU3Ni1hNTNjLTdkMTJiMTNhNzk0NyIsInN1YiI6Im11a2lscy4yMml0QGtvbmd1LmVkdSJ9LCJlbWFpbCI6Im11a2lscy4yMml0QGtvbmd1LmVkdSIsIm5hbWUiOiJtdWtpbCBzIiwicm9sbE5vIjoiMjJpdHIwNjQiLCJhY2Nlc3NDb2RlIjoiam1wWmFGIiwiY2xpZW50SUQiOiIyZTVhNjkwNi1mYmUzLTRlNzYtYTUzYy03ZDEyYjEzYTc5NDciLCJjbGllbnRTZWNyZXQiOiJVdGZ1cWpNdWhLUFRkSldiIn0.A03QbDb5SnbYneuRSDfSmo09nJNDcYQqJZpqQcW6RKo";

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;

    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const url = apiUrls[numberid];
    const windowPrevState = [...numberWindow];
    let numbersFromAPI = [];

    try {
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                'Authorization': AUTHTOKEN
            }
        });

        if (response.data && Array.isArray(response.data.numbers)) {
            numbersFromAPI = response.data.numbers;
        }
    } catch (err) {
        console.error("API error or timeout:", err.message);
        return res.json({
            windowPrevState,
            windowCurrState: numberWindow,
            numbers: [],
            avg: Number(average(numberWindow).toFixed(2))
        });
    }

   
    for (let num of numbersFromAPI) {
        if (!numberWindow.includes(num)) {
            numberWindow.push(num);
        }
    }

    if (numberWindow.length > WINDOWSIZE) {
        numberWindow = numberWindow.slice(numberWindow.length - WINDOWSIZE);
    }

    const avg = numberWindow.length > 0 ? average(numberWindow) : 0;

    res.json({
        windowPrevState,
        windowCurrState: numberWindow,
        numbers: numbersFromAPI,
        avg: Number(avg.toFixed(2))
    });
});

function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
