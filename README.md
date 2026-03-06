# Jibiji PWA (记笔记)

A premium Progressive Web App (PWA) designed for language learners. Jibiji automatically handles pronunciation guides for Chinese (Pinyin) and Japanese, making it effortless to create and review language study notes.

## 🌐 Live Demo

You can access the live application at: **[https://jibiji.netlify.app](https://jibiji.netlify.app)**

## 📱 How to Use as an App (Add to Home Screen)

To get the full native app experience, you can add Jibiji directly to your phone's home screen.

**On iPhone/iPad (Safari):**
1. Open [jibiji.netlify.app](https://jibiji.netlify.app) in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom of the screen).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right corner.
5. You can now launch Jibiji directly from your home screen just like a regular app!

## ✨ Key Features

### 🌐 Language Learning Focus
- **Automatic Pinyin**: Seamlessly adds Pinyin with proper tone marks for Chinese characters using `pinyin-pro`.
- **Japanese Support**: Automatically converts Hiragana and Katakana to Romaji using `wanakana`.
- **Ruby Text Rendering**: Beautifully formatted pronunciation guides displayed above characters for better readability.
- **Smart Parsing**: Distinguishes between Chinese and Japanese text automatically to provide the correct pronunciation guide.

### 📝 Smart Editor & Preview
- **Custom Markdown Syntax**:
  - `#` for Headers, `##` for Sub-headers.
  - `*text*` for **Bold** text.
  - `/red(text)` for highlighting critical parts in red.
- **Pinning System**: Keep your most important memos at the top.
- **PDF Export**: Optimized print layout for saving your notes as high-quality PDFs.

### 🎨 Design System
- **Premium Aesthetics**: Clean and modern interface designed for an optimal user experience.
- **Glassmorphism**: Subtle blur and transparency effects for a modern, OS-integrated feel.
- **Dark Mode**: Fully supports native dark mode with adaptive color schemes.
- **Micro-animations**: Smooth transitions and hover effects for a responsive user experience.

### ⚡ Progressive Web App (PWA)
- **Installable**: Can be added to your home screen on mobile and desktop devices.
- **Offline Capability**: Access your memos anytime, even without an internet connection.

### 🛡️ Privacy & Storage (No Database)
- **Local-Only Persistence**: Jibiji does **not** use a centralized database. All your memos are stored locally in your browser's `localStorage` using [Zustand persistence](https://github.com/pmndrs/zustand).
- **Privacy First**: Your notes never leave your device. This ensures maximum privacy and allows the app to work lightning-fast without a server connection.
- **Auto-Save Mechanism**: Memos are automatically saved as you type. Each memo is assigned a unique ID (UUID) and remains persistent across sessions unless you manually clear your browser data.
- **Export for Backup**: Use the PDF/Share feature to save permanent records of your notes outside the browser.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistence)
- **Language Utils**: `pinyin-pro`, `wanakana`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Netlify](https://www.netlify.com/)

## 🚀 Getting Started (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/W00SE0K/jibiji-pwa.git
   cd jibiji-pwa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📄 License

This project is public and open for anyone to use.
