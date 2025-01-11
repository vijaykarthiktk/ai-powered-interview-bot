import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InterviewRole, Question, Answer } from '../types';

const genAI = new GoogleGenerativeAI('');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateQuestions(role: InterviewRole, count: number = 5): Promise<Question[]> {
  const prompt = `Generate ${count} interview questions for a ${role.title} position. 
    Include a mix of behavioral and ${role.category} questions.
    Format as JSON array with properties: id, text, category (behavioral/technical/general), difficulty (easy/medium/hard)`;

  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text().replace("'''json ", "").replace("'''", "");
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse questions:', error);
    return [];
  }
}

export async function evaluateAnswer(question: Question, answer: string): Promise<Omit<Answer, 'questionId' | 'timestamp'>> {
  const prompt = `
    Question: ${question.text}
    Answer: ${answer}
    
    Evaluate this interview answer and provide:
    1. Constructive feedback (2-3 sentences)
    2. Score out of 10
    
    Format as JSON with properties: feedback (string), score (number)`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    return {
      text: question.text,
      feedback: "Unable to evaluate answer.",
      score: 5
    };
  }
}