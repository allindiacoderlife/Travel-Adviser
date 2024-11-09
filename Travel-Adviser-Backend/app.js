const express = require('express');
const app = express();
const dotenv = require('dotenv');
const ollama = require('./router/ollama');
dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use('/', ollama);

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})