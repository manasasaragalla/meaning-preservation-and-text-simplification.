# Text Simplification System

This project is a text simplification tool developed using a **T5-small** transformer model. It includes a Python/Flask backend API, a React-based frontend interface, and an evaluation notebook for rigorous performance analysis.

## 🚀 Features
- **Real-time Simplification**: Input complex text and receive a simplified version instantly.
- **REST API**: Flask-based backend for model management and inference.
- **Evaluation Dashboard**: Comprehensive Jupyter Notebook for EDA, model testing, and scoring.
- **Metrics**: Uses BLEU score and Flesch Reading Ease for quality assessment.

## 📂 Project Structure
```bash
.
├── README.md               # Main project documentation
├── backend/                # Flask API
│   ├── app.py              # Main server logic
│   ├── model.py            # T5 model interface
│   ├── evaluate.py         # Scoring logic (BLEU/Flesch)
│   ├── requirements.txt    # Python dependencies
│   └── data/               # Local data storage (test_file.csv)
├── frontend/               # React Application
│   ├── src/                # Component logic (App.js)
│   └── package.json        # Frontend configuration
├── notebooks/              # Data Science Workspace
│   └── text_simplification_notebook.ipynb # EDA & Evaluation
└── report/                 # (Optional) Project reports
```

## 🛠️ Installation & Setup

### 1. Prerequisites
- Python 3.8+
- Node.js & npm
- Git

### 2. Backend Setup
Navigate to the `backend` directory, create a virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The server will start at `http://localhost:5000`.

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
npm run start
```
The application will be available at `http://localhost:3000`.

## 🧪 Quick Testing

### 1. Browser Interface
Visit `http://localhost:3000`, type any complex sentence (e.g., "The mitochondria is the powerhouse of the cell.") into the input box, and click **Simplify**.

### 2. Direct API Test (PowerShell)
If you want to test the backend API directly without the frontend:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/simplify -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"text": "The mitochondria is the powerhouse of the cell."}'
```

The API will return a JSON response similar to:
```json
{
  "original": "The mitochondria is the powerhouse of the cell.",
  "simplified": "...",
  "scores": { "bleu": 42.50, "flesch": 78.10 }
}
```

## 📊 Model Evaluation

### Jupyter Notebook
The evaluation workflow is contained in `notebooks/text_simplification_notebook.ipynb`. 

To run the notebook:
1. Ensure `test_file.csv` is uploaded to the `notebooks/` directory.
2. Open the notebook in VS Code, JupyterLab, or Colab.
3. Run all cells to:
   - Perform full EDA with 4 plots.
   - Run T5-small on 50 samples.
   - Calculate BLEU and Flesch Reading Ease scores.
   - Generate `evaluation_results.csv`.

### Key Metrics
- **BLEU Score**: Measures the overlap between machine-generated and reference simplifications.
- **Flesch Reading Ease**: Indicates the complexity of text (higher = easier to read).

## 📄 License
This project is for educational purposes as part of a Kaggle automation study.
