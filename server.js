const express = require('express');
const cors = require('cors');

const app = express();

// 1. Aktivizimi i CORS për të lejuar komunikimin nga çdo domain (përfshirë faqen e shkollës)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware shtesë për të shmangur bllokimet e sigurisë para kërkesave (Preflight OPTIONS)
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

// 3. Udhëzimet e sistemit (System Instructions) për të trajnuar inteligjencën artificiale
const SYSTEM_INSTRUCTION = `
Ti je Asistenti Virtual zyrtar me Inteligjencë Artificiale i Gjimnazit Milot.
Detyra jote është të orientosh dhe ndihmosh nxënësit, prindërit dhe mësuesit rreth faqes sonë.
Përgjigju gjithmonë në mënyrë shumë të sjellshme, të qartë, të shkurtër dhe VETËM në gjuhën shqipe.
Rregullat dhe linket e orientimit:
- Nëse pyesin për orarin e mësimit ose ndonjë klasë, thuaju të klikojnë te faqja: <a href='/orari.html'><b>Orari i Mësimeve</b></a>.
- Nëse pyesin për regjistrimet e reja në klasën e 10-të ose dokumentet, thuaju të shkojnë te: <a href='/regjistrimet.html'><b>Regjistrimi i Nxënësve</b></a>.
- Nëse kërkojnë kontaktin, vendndodhjen ose numrin, jepu email-in 'info@gjimnazimilot.edu.al' i cili gjendet te: <a href='/kontakti.html'><b>Kontakti</b></a>.
- Nëse pyesin për mësuesit, drejtorinë ose stafin, orientoji te: <a href='/stafi.html'><b>Stafi i Shkollës</b></a>.
Nëse të bëjnë pyetje që nuk kanë lidhje me shkollën apo arsimin, ktheji me mirësjellje përsëri te tema e Gjimnazit Milot.
`;

// 4. Endpoint-i kryesor i bisedës (Chat API)
app.post('/api/chat', async (req, res) => {
    const { pyetja } = req.body;
    
    // Leximi i çelësit sekret nga mjedisi i sigurt i Render (Environment Variables)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        console.error("GABIM: Variabla GEMINI_API_KEY nuk është konfiguruar në Render!");
        return res.status(500).json({ text: "Gabim i konfigurimit të brendshëm në server. Çelësi mungon." });
    }

    try {
        // URL zyrtare për modelin e ri Gemini 1.5 Flash
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
        
        // 🛠️ VALIDIMI: Sigurohemi që ekziston çdo nivel i objektit JSON përpara se të nxjerrim tekstin
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const pergjigjiaAI = data.candidates[0].content.parts[0].text;
            res.json({ text: pergjigjiaAI });
        } else {
            console.error("Strukturë e gabuar ose e papritur nga API e Google:", JSON.stringify(data));
            res.json({ text: "Më falni, nuk arrita të procesoj përgjigjen e saktë. Ju lutem provoni përsëri!" });
        }

    } catch (error) {
        console.error("Gabim kritik gjatë ekzekutimit në server:", error);
        res.status(500).json({ text: 'Ndodhi një gabim gjatë komunikimit të serverit me Inteligjencën Artificiale.' });
    }
});

// 5. Nisja e Serverit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveri po punon me sukses në portën ${PORT}`));
