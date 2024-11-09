const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apikey: process.env.GROQ_API_KEY });

const conversationHistory = {};

router.post('/ollama', async (req, res) => {
    try {
        const userId = req.body.userId || "default"; // Use unique user ID in production
        const userMessage = req.body.message.trim();
        console.log("User Message:", userMessage);

        // Initialize history for new users
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [
                {
                    role: "system",
                    content: "Develop a system that can classify and use generative answers for suggesting you the places to visit in india based on your current trip activity and give me some place ticket links"
                }
            ];
        }

        // Add the new user message to history
        conversationHistory[userId].push({ role: "user", content: userMessage });

        // Generate completion with the entire conversation history
        const chatCompletion = await groq.chat.completions.create({
            messages: conversationHistory[userId],
            model: "llama3-8b-8192",
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        });

        // Handle streamed response
        let responseContent = '';
        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            process.stdout.write(content);
            responseContent += content;
        }

        // Add assistant's response to the conversation history
        conversationHistory[userId].push({ role: "assistant", content: responseContent });

        // Send the response to the client
        res.send({ status: "Ok", data: responseContent });
    } catch (err) {
        res.status(500).send({
            status: "Error",
            message: err.message
        });
    }
})

const groqTest = async () => {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "Develop a system that can classify and use generative answers for suggesting you the places to visit in india based on your current trip activity." },
            { role: "user", content: "I want travel in winter" }
        ],
        model: "llama3-8b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
    });

    for await (const chunk of completion) {
        console.log(chunk.choices[0]?.delta?.content);
    }
}

// groqTest();
module.exports = router;


