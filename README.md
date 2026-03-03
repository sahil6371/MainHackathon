# NagrikAI

NagrikAI is a React + Vite web app for reporting civic issues in Mumbai.
Users can upload an issue photo, get AI-based issue classification, submit the complaint to Firestore, and share or track complaints publicly.

## Features

- AI-assisted issue detection from photo (Gemini)
- Ward detection from GPS location
- Complaint registration in Firebase Firestore
- Public complaint tracking page (`/complaint/:id`)
- Social sharing and officer email flow (EmailJS)

## Tech Stack

- React 19
- Vite 7
- Firebase (Firestore)
- Google Generative AI (`@google/generative-ai`)
- EmailJS (`@emailjs/browser`)
- Leaflet + React Leaflet
- React Router

## Project Structure

```
src/
	components/
		MapView.jsx
		Signup.jsx
		Step3.jsx
	data/
		wardData.js
	pages/
		ComplaintPage.jsx
	App.jsx
	firebase.js
	main.jsx
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

3. Start development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` — start local development server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint

## Routing

- `/` — main complaint reporting flow
- `/complaint/:id` — public complaint tracking page

## Deployment

This project is configured for Vercel (`vercel.json` included).

### Build command

```bash
npm run build
```

### Output directory

`dist`

## Notes

- Firebase configuration is currently in `src/firebase.js`.
- Make sure your Gemini and EmailJS credentials are valid before testing the full flow.
