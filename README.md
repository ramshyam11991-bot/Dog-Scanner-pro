# Dog Scanner Backend

Ye chhota server aapki Gemini API key ko surakshit (server-side) rakhta hai,
taaki wo kabhi bhi app ke code mein public na ho.

## Deploy kaise karein (Render.com par, free)

1. https://render.com par jaake free account banayein (GitHub se sign in kar sakte hain).
2. Sabse pehle is poori `dog-scanner-backend` folder ko GitHub par ek naye repository mein upload karein.
   - Agar GitHub use karna nahi aata, "GitHub Desktop" app download karke us se bhi kar sakte hain,
     ya Render ki site par "Deploy from Git" ki jagah manual upload ka option dhoondh sakte hain.
3. Render dashboard mein "New +" → "Web Service" par click karein, apna GitHub repo select karein.
4. Settings mein:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. "Environment Variables" section mein ek naya variable add karein:
   - Key: `GEMINI_API_KEY`
   - Value: apni (nayi, regenerate ki hui) Gemini key
6. "Create Web Service" dabayein. 2-3 minute mein deploy ho jayega.
7. Aapko ek URL milega jaisa: `https://dog-scanner-backend.onrender.com`
   - Isी URL ko aap apne frontend (web app ya mobile app) mein use karenge,
     `/api/scan` endpoint ke saath, jaise: `https://dog-scanner-backend.onrender.com/api/scan`

## Test kaise karein

Deploy hone ke baad browser mein wo URL kholiye — agar
`{"status":"ok","message":"Dog Scanner backend chal raha hai."}`
dikh raha hai, toh sab sahi hai.

## Zaroori: API key kabhi bhi is code mein directly mat likhiye

Key hamesha "Environment Variables" section mein hi daalein (Render, Railway, ya
jo bhi hosting use karein, sab mein ye option hota hai). Isse key kabhi bhi
public GitHub code ya browser mein expose nahi hogi.
