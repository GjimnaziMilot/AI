const express = require('express');
const cors = require('cors');

const app = express();

// 1. Aktivizimi i gjerë i CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Blindimi i sigurisë për kërkesat e jashtme
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

const SYSTEM_INSTRUCTION = `
Ti je Asistenti Virtual zyrtar me Inteligjencë Artificiale i Gjimnazit Milot.
Detyra jote është të orientosh dhe ndihmosh nxënësit, prindërit dhe mësuesit rreth faqes sonë.
Përgjigju gjithmonë në mënyrë shumë të sjellshme, të qartë, të shkurtër dhe VETËM në gjuhën shqipe.
Rregullat dhe linket e orientimit:
- Nëse pyesin për historikun e shkollës, mund t'u tregosh pjesë nga kjo faqe kryesore.
- Nëse pyesin për njoftimet e fundit, orientoji te faqja: <a href='njof.html'><b>Njoftime</b></a>.
- Nëse pyesin për Maturën Shtetërore, dokumentet apo rregullat, thuaju të shkojnë te: <a href='matura.html'><b>Matura Shtetërore</b></a>.
- Nëse kërkojnë kontaktin ose adresën e email-it, jepu 'milotgjimnazi@yahoo.com' ose orientoji te: <a href='kontakt.html'><b>Kontakt</b></a>.
- Nëse pyesin për strukturën ose udhëheqjen e shkollës, orientoji te: <a href='Organizimi.html'><b>Organizimi i shkollës</b></a>.
Nëse të bëjnë pyetje që nuk kanë lidhje fare me shkollën ose arsimin, ktheji me mirësjellje përsëri te tema e Gjimnazit Milot.
`;

app.post('/api/chat', async (req, res) => {
    const { pyetja } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: pyetja }] }],
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
            })
        });

        const data = await response.json();
        
        // 🛠️ VALIDIMI: Sigurohemi që ekziston rruga përpara se të nxjerrim tekstin
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const pergjigjiaAI = data.candidates[0].content.parts[0].text;
            res.json({ text: pergjigjiaAI });
        } else {
            console.error("Strukturë e gabuar nga Google API:", JSON.stringify(data));
            res.json({ text: "Më falni, nuk arrita të procesoj përgjigjen e saktë. Provoni përsëri!" });
        }

    } catch (error) {
        console.error("Gabim në server:", error);
        res.status(500).json({ text: 'Gabim gjatë komunikimit të serverit me inteligjencën artificiale.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveri po punon në portën ${PORT}`));
