import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Lejon faqen tënde HTML të komunikojë me Render

# Konfigurimi i Gemini API (Do ta vendosësh si Environment Variable në Render)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Informacioni i shkollës që asistenti duhet të dijë patjetër
CONTEXT = """
Ti je asistenti virtual zyrtar i Gjimnazit Milot. Përgjigju në mënyrë të sjellshme, ndihmuese dhe shkurt në gjuhën shqipe.
Informacione rreth shkollës:
- Historia: Viti shkollor 1971-1972 u hap Shkolla e Mesme pa shkëputje nga puna (dega Agronomi). Në vitin 1986-1987 u vu në punë ndërtesa e re e shkollës (Gjimnazi i sotëm). Viti 1987-1988 shënon fillimin e arsimit të mesëm të përgjithshëm në Milot.
- Kontakti: Email zyrtar është milotgjimnazi@yahoo.com.
- Aktivitetet: Shkolla organizon Festivalin e Shkencave, Olimpiada, etj.
- Nëse të pyesin për gjëra që nuk i di, drejtoji tek faqja e kontaktit ose tek stafi i shkollës.
"""

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Mesazhi mungon"}), 400

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Bashkojmë kontekstin e shkollës me pyetjen e përdoruesit
        full_prompt = f"{CONTEXT}\n\nPërdoruesi pyet: {user_message}\nAsistenti:"
        
        response = model.generate_content(full_prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "Më falni, pati një problem teknik. Ju lutem provojeni përsëri."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
