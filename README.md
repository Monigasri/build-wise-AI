# 🚀 BuildWise AI – Construction Planning & Risk Analyzer

## 📌 Overview

**BuildWise AI** is an advanced AI-powered construction intelligence platform designed to improve project planning, monitor execution, and predict risks using real-world construction parameters.

The system transforms traditional construction management into a **data-driven, predictive, and decision-support platform**.

This project serves as:

* 🏢 A **startup-level SaaS application**
* 🎓 An **academic project (Digital Construction & Infrastructure Systems)**

---

## ❗ Problem Statement

Construction projects often face:

* Delays due to poor scheduling and dependencies
* Cost overruns due to inaccurate estimation
* Resource shortages (labor, equipment)
* External risks (weather, supply chain issues)
* Lack of real-time monitoring and predictive insights

Traditional tools:

* ❌ Do not provide intelligent predictions
* ❌ Cannot dynamically adapt to changes
* ❌ Lack decision-making support

---

## 💡 Proposed Solution

BuildWise AI introduces:

* 📂 CSV-based project input
* 🧠 Multi-factor AI risk analysis
* 📊 Real-time monitoring & dashboards
* 🤖 Intelligent chatbot for decision support
* 🔄 What-if simulation for planning optimization

---

## 📂 CSV-Based Input System

Projects are uploaded using structured CSV files containing:

* Task Name
* Start Date
* End Date
* Duration
* Dependencies
* Resource Count
* Estimated Cost

👉 The system parses, validates, and converts CSV data into a structured project model.

---

## 🧠 Advanced Risk Analysis Engine

The system evaluates risk using real-world construction parameters:

### 📊 Key Parameters

1. **Project Schedule (Time)**

   * Planned vs actual timeline
   * Critical Path Method (CPM)

2. **Cost Variance**

   * Budget vs actual cost
   * Cost overrun percentage

3. **Resource Availability**

   * Labor and equipment adequacy
   * Worker shortages

4. **Weather Conditions**

   * External environmental impact

5. **Permit & Approval Status**

   * Delays in approvals

6. **Design Changes / Scope Creep**

   * Additional work or rework

7. **Safety Incidents**

   * Work stoppages due to safety

8. **Supply Chain Disruptions**

   * Material and vendor delays

---

### 📈 Risk Output

* Total Risk Score (0–100)
* Risk Breakdown (by parameter)
* Risk Level:

  * Low / Medium / High

---

### 🧠 Intelligent Recommendations

The system suggests corrective actions:

* Re-baseline schedule (CPM)
* Fast-track tasks
* Hire additional labor
* Optimize cost (value engineering)
* Switch vendors
* Improve safety protocols

---

## ⏱️ Delay Prediction System

* Uses task dependencies and scheduling logic
* Predicts:

  * Project completion date
  * Delay duration

---

## 💰 Cost Analysis

* Calculates:

  * Total estimated cost
  * Actual vs predicted cost
* Detects cost overruns

---

## 📍 Real-Time Progress Tracking

* Tracks:

  * Planned vs actual progress
* Updates:

  * Risk
  * Delay
  * Performance metrics

---

## 🤖 Intelligent Chatbot

The chatbot:

* Uses real project data
* Provides context-aware answers
* Explains:

  * Why delays occur
  * What risks exist
  * What actions to take

---

## 📊 Dashboard Features

* Risk Score
* Delay Prediction
* Cost Overrun %
* Critical Tasks
* Alerts & warnings

---

## 🧩 Multi-Project Management

* Create multiple construction plans
* Each project is independent
* Switch between projects dynamically

---

## 🏗️ System Architecture

### Frontend

* React.js
* Tailwind CSS
* Recharts / Chart.js

### Backend

* Python (FastAPI)

### Database

* MongoDB / Firebase

### AI/ML Layer

* Pandas (CSV processing)
* Scikit-learn (prediction models)
* Dependency analysis (CPM logic)

---

## ⚙️ Installation & Setup

### 🔹 Prerequisites

* Node.js
* Python 3.8+

---

### 🔹 Clone Repository

```bash
git clone https://github.com/your-username/buildwise-ai.git
cd buildwise-ai
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

### 🔹 Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 🔹 Access

* Frontend: http://localhost:3000
* Backend: http://localhost:8000

---

## 📊 Feasibility Analysis

### ✅ Technical

* Built using modern technologies
* Easily scalable

### 💰 Economic

* Reduces cost overruns
* High ROI

### ⚙️ Operational

* User-friendly interface
* Minimal training

### ⏱️ Schedule

* Modular development possible

---

## 📈 Viability

* High demand in construction industry
* Scalable to smart cities
* Supports sustainable infrastructure

---

## 🌍 Impacts

### 💰 Economic

* Reduced costs
* Improved profitability

### ⚙️ Operational

* Better planning and execution

### 👥 Social

* Faster infrastructure delivery

### 🌱 Environmental

* Reduced material waste

### 🤖 Technological

* Promotes AI adoption in construction

---

## 📚 References

* Kerzner, H. – Project Management
* PMBOK Guide (PMI)
* IEEE Research Papers
* Scikit-learn Documentation
* React Documentation
* FastAPI Documentation
* World Bank Infrastructure Reports

---

## 🚀 Future Enhancements

* 🌦️ Real-time weather API integration
* 📸 Image-based progress tracking
* 🧾 Automated report generation
* 🏙️ Smart city integration

---

## 👨‍💻 Author

**Monigasri m**

**jayamuguntha p**

**Monika r**

---

## ⭐ Conclusion

BuildWise AI is not just a planning tool — it is an **AI-driven decision-making system** that predicts risks, optimizes schedules, and improves construction efficiency using real-world parameters.

---

⭐ *“From manual planning to intelligent construction management.”*
