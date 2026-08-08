# 🌌 Into the Algorithm

<p align="center">
  <img src="./app/src/assets/hero.png" alt="Into the Algorithm Banner" width="100%" style="border-radius: 16px;" />
</p>

<p align="center">
  <strong>Demystify Machine Learning from First-Principles Math to Production PyTorch Code</strong>
</p>

<p align="center">
  <a href="https://github.com/alhajbaig/Into-The-Algorithm"><img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="https://github.com/alhajbaig/Into-The-Algorithm"><img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://github.com/alhajbaig/Into-The-Algorithm"><img src="https://img.shields.io/badge/Framer_Motion-11.x-0055FF?logo=framer&logoColor=white" alt="Framer Motion"></a>
  <a href="https://github.com/alhajbaig/Into-The-Algorithm"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

---

## 🚀 Overview

**Into the Algorithm** is an interactive, browser-native platform built to visualize, demystify, and practice core Machine Learning algorithms. 

Instead of treating AI as a black box, this platform provides first-principles interactive visualizations — allowing users to orbit 3D decision hyperplanes, tune bagging decision forests in real-time, simulate gradient descent optimization paths over 2D loss bowls, and level up for technical AI interviews through a gamified 10-level campaign.

---

## ✨ Core Features

### 🔮 1. Surreal 3D Logistic Hyperplane Visualizer
- **Interactive 3D Projection**: Drag-to-rotate camera controls for full pitch and yaw exploration.
- **Sigmoidal Mesh Surface**: Real-time rendering of the 3D sigmoidal surface boundary $P(Y=1 \mid \mathbf{x}) = \sigma(\mathbf{w}^T \mathbf{x} + b)$.
- **Translucent Decision Plane**: Visualizes the decision plane at $z = 0.5$ with 3D drop-stem data points.
- **Live 3D Optimizer**: Watch weight parameters $(\mathbf{w}_1, \mathbf{w}_2, b)$ update step-by-step via 3D gradient descent.

### 🌲 2. Interactive Random Forest Explorer
- **Ensemble Bagging Controls**: Tune tree counts ($1-20$), max depth, min samples split, and feature subsampling ratios ($0.2-1.0$).
- **Impurity Criteria**: Toggle between **Gini Impurity** ($\text{Gini} = 1 - \sum p_i^2$) and **Entropy** ($H = -\sum p_i \log_2 p_i$).
- **Single Tree Inspector**: Switch views to inspect individual decision trees within the ensemble.
- **Feature Importance Chart**: Real-time bar chart showing normalized Gini feature importance across input features.

### 📉 3. Gradient Descent Loss Landscape Simulator
- **2D Loss Surface Maps**: Choose between Elliptic Bowl, Saddle Point, and Himmelblau loss landscapes.
- **Optimizer Algorithms**: Compare convergence trajectories for Standard SGD, Momentum ($\beta=0.9$), and Nesterov Accelerated Gradient.
- **Interactive Trajectory Tracing**: Click anywhere on the loss surface to release an optimization particle and monitor learning rate behavior.

### 🎮 4. Gamified 10-Level ML Quest
- **Interview Preparation**: 10 campaign levels inspired by top tech company ML engineering interview loops.
- **Interactive Learning Modes**: Quizzes, theoretical flashcards, system design scenarios, and live Python/NumPy coding challenges.
- **Gamification Mechanics**: XP tracking, daily streaks, coin rewards, and unlockable achievement badges.

### 🌌 5. Unified Neural Particle Canvas Background
- **Interactive Constellation**: Particle network featuring synaptic pulses and interactive cursor repulsion.
- **Floating Tensor Ribbon**: Floating mathematical equations ($\sigma(z)$, $\nabla J(\theta)$, $\text{Attention}(Q,K,V)$).
- **Theme Switcher**: Instant switching between **Cyber**, **Emerald (Matrix)**, and **Violet** color palettes across all routes.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, JavaScript (ES6+), HTML5 Canvas (2D & 3D Matrix Math)
- **Styling & Design System**: Vanilla CSS tokens, Glassmorphism backdrop-blur effects, Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Animations**: Framer Motion, HTML5 `requestAnimationFrame`
- **Icons**: Lucide React
- **Build Tool**: Vite 8

---

## 📁 Directory Structure

```
Into-The-Algorithm/
├── app/                             # Main React Web Application
│   ├── public/                      # Static assets & standalone HTML lab pages
│   │   └── learn/                   # Linear Reg, Logistic Reg, K-Means Labs
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Animated glass header with active link indicators
│   │   │   ├── LevelMap.jsx         # Gamified 10-level campaign map
│   │   │   └── landing/             # Interactive 3D & Forest visualization playgrounds
│   │   │       ├── ModernHeroSection.jsx
│   │   │       ├── InteractiveLogistic3DPlayground.jsx
│   │   │       ├── InteractiveRandomForestPlayground.jsx
│   │   │       ├── GradientDescentSimulator.jsx
│   │   │       └── NeuralCanvasBackground.jsx
│   │   ├── context/                 # GameContext for XP & Streaks
│   │   ├── data/                    # Interview questions & achievement badges
│   │   ├── pages/                   # Home, LevelPlay, BadgesPage
│   │   ├── App.jsx                  # Main router shell & persistent background
│   │   └── index.css                # Global design system tokens
│   └── package.json
├── ML ALGO VISUALIZE/               # First-principles canvas visualization labs
├── ML GAMING/                       # Standalone ML Quest module
└── README.md
```

---

## ⚙️ Getting Started locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/alhajbaig/Into-The-Algorithm.git
   cd Into-The-Algorithm/app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ for Machine Learning Engineers, Data Scientists, and AI Researchers.
</p>
