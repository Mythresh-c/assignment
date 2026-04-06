# EduGen AI - Educational Content Generator ⚡

A full-stack AI-powered educational content generator utilizing an agent-based pipeline. It dynamically generates explanation content and Multiple Choice Questions (MCQs) tailored to specific grade levels.

## Features

- **Agentic Pipeline**: Utilizes a `GeneratorAgent` to draft content, and a `ReviewerAgent` to review age-appropriateness and correctness. If the review fails, it refines the content automatically before finalizing.
- **Grade-level Calibration**: Calibrates the generated language and complexity automatically for young children (Grades 1-3), middle-schoolers (Grades 4-6), or high-school students.
- **Modern UI**: An intuitive, responsive React interface that visualizes the pipeline (Generator > Reviewer > Refiner) with a sleek Step Indicator and clean visualization of generated MCQs.

## Project Structure

- `frontend/`: React application built with Vite.
- `backend/`: FastAPI Python application powered by the Groq API (`llama-3.3-70b-versatile`).

## Getting Started

1. Clone the repository.
2. Open two terminal instances, one for the frontend and one for the backend.
3. Configure your API key:
   - Add your `GROQ_API_KEY` to `backend/.env`
4. Run the backend:
   `cd backend`
   `pip install -r requirements.txt`
   `python -m uvicorn main:app --reload`
5. Run the frontend:
   `cd frontend`
   `npm install`
   `npm run dev`

Navigate to `http://localhost:5173` to start generating content!
