# Calorie Lens 🥗📸

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://callens.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**Calorie Lens** is an AI-powered nutrition tracking application designed to make logging your daily food intake effortless. Instead of manually searching through endless food databases, simply type what you ate or snap a picture of your meal, and our Gemini AI integration will automatically estimate the calories and macronutrients (Protein, Carbs, Fats).

Live application: [https://callens.vercel.app/](https://callens.vercel.app/)  
GitHub Repository: [https://github.com/2012prabhat/calorie_lens](https://github.com/2012prabhat/calorie_lens)

---

## ✨ Features

- **🧠 AI-Powered Logging:** Describe your meal in plain text or upload a photo. The Gemini AI model instantly analyzes the food and extracts accurate caloric and macronutrient data.
- **📊 Real-time Dashboard:** Track your daily calories, protein, carbs, and fat against your personalized goals using beautifully designed, dynamic charts and progress indicators.
- **📈 History & Weight Tracking:** Visualize your 7-day nutritional trends and long-term weight journey using interactive `Recharts` graphs.
- **⚡ Lightning Fast Navigation:** Built with Next.js App Router and Redux Toolkit caching to ensure instant, zero-loading-spinner tab switching.
- **🎯 Custom Nutrition Plans:** Calculate your TDEE and set personalized goals based on your age, weight, height, and activity level.
- **🔒 Secure Authentication:** Full authentication system (Login, Signup, Email Verification, Password Reset) built from scratch using JWT and Bcrypt.
- **💳 Premium Subscriptions:** Integrated Stripe checkout for premium features, complete with automated webhook handling and 7-day free trials.
- **🌓 Dark Mode:** Sleek, modern glassmorphic design that seamlessly transitions between light and dark themes.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (App Router, React 19)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) (State Management & Caching)
- [Recharts](https://recharts.org/) (Data Visualization)
- [Lucide React](https://lucide.dev/) (Icons)
- [React Hot Toast](https://react-hot-toast.com/) (Notifications)

**Backend & Database:**
- Next.js Route Handlers (Serverless APIs)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [Google Gemini API](https://ai.google.dev/) (AI Image & Text Analysis)
- [Stripe](https://stripe.com/) (Payments & Subscriptions)
- [Nodemailer](https://nodemailer.com/) (Transactional Emails)
- JWT & Bcrypt (Authentication)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine. You will also need a MongoDB database URL and API keys for Google Gemini and Stripe.

### 1. Clone the repository
```bash
git clone https://github.com/2012prabhat/calorie_lens.git
cd calorie_lens
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3600

# AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe (For Subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3600](http://localhost:3600) in your browser to see the application.

---

## 🗺️ API Routes Overview

```text
/api
  ├── auth
  │   ├── signup
  │   ├── login
  │   ├── me
  │   └── logout
  │
  ├── food
  │   ├── log        (POST)
  │   ├── history    (GET)
  │   ├── today      (GET)
  │   └── [id]       (DELETE)
  │
  ├── plan           (GET, POST)
  │
  ├── stripe
  │   ├── checkout   (POST)
  │   ├── verify     (POST)
  │   └── webhook    (POST)
  │
  └── weight
      ├── log        (POST)
      └── history    (GET)
```

---

## 📄 License
This project is for educational and portfolio purposes. Feel free to explore, fork, and learn from the code!