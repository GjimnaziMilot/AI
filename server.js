const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Shërbe skedarët statikë të faqes sate
app.use(express.static(path.join(__dirname, './')));

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
    // Çelësi merret në mënyrë super të sigurt nga mjedisi i Render
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
        const pergjigjiaAI = data.candidates[0].content.parts[0].text;
        res.json({ text: pergjigjiaAI });

    } catch (error) {
        res.status(500).json({ error: 'Gabim gjatë përpunimit në server' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveri po punon në portën ${PORT}`));