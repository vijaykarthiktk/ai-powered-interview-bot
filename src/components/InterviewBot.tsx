import React, { useState } from 'react';
import { Bot, Send, RefreshCw, Award, Loader2 } from 'lucide-react';
import type { InterviewSession, Answer, InterviewRole } from '../types';
import { RoleSelection } from './RoleSelection';
import { generateQuestions, evaluateAnswer } from '../services/gemini';

export function InterviewBot() {
    const [session, setSession] = useState<InterviewSession>({
        role: {} as InterviewRole,
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        status: 'role-selection',
    });
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const currentQuestion = session.questions[session.currentQuestionIndex] || {};

    const handleSelectRole = async (role: InterviewRole) => {
        setLoading(true);
        try {
            const questions = await generateQuestions(role);
            setSession({
                role,
                questions,
                currentQuestionIndex: 0,
                answers: [],
                status: 'in-progress',
            });
        } catch (error) {
            console.error('Failed to generate questions:', error);
            // Handle error appropriately, e.g., show an alert or fallback message
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentAnswer.trim() || loading || !currentQuestion.text) return;

        setLoading(true);
        try {
            const evaluation = await evaluateAnswer(currentQuestion, currentAnswer);
            const answer: Answer = {
                questionId: currentQuestion.id,
                text: currentAnswer,
                feedback: evaluation.feedback,
                score: evaluation.score,
                timestamp: new Date(),
            };

            setSession(prev => ({
                ...prev,
                answers: [...prev.answers, answer],
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                status: prev.currentQuestionIndex === prev.questions.length - 1
                    ? 'completed'
                    : 'in-progress',
            }));

            setCurrentAnswer('');
        } catch (error) {
            console.error('Failed to evaluate answer:', error);
            // Handle error appropriately, e.g., show an alert or fallback message
        } finally {
            setLoading(false);
        }
    };

    const startNewSession = () => {
        setSession({
            role: {} as InterviewRole,
            questions: [],
            currentQuestionIndex: 0,
            answers: [],
            status: 'role-selection',
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-600">
                    {session.status === 'role-selection'
                        ? 'Generating interview questions...'
                        : 'Evaluating your answer...'}
                </p>
            </div>
        );
    }

    if (session.status === 'role-selection') {
        return <RoleSelection onSelectRole={handleSelectRole} />;
    }

    if (session.status === 'completed') {
        const averageScore = session.answers.reduce((acc, curr) => acc + curr.score, 0) / session.answers.length;

        return (
            <div className="flex flex-col items-center justify-center space-y-6 p-8">
                <Award className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800">Interview Complete!</h2>
                <div className="text-center">
                    <p className="text-gray-600">Role: {session.role.title}</p>
                    <p className="text-gray-600">Average Score: {averageScore.toFixed(1)}/10</p>
                </div>
                <button
                    onClick={startNewSession}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Start New Interview</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Bot className="w-8 h-8 text-blue-500" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {session.role.title} Interview
                            </h2>
                            <p className="text-sm text-gray-600">
                                Question {session.currentQuestionIndex + 1} of {session.questions.length}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={startNewSession}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Change Role
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-lg text-gray-700">{currentQuestion.text || 'No question available'}</p>
                    <div className="flex space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-sm ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {currentQuestion.difficulty || 'Unknown'}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            {currentQuestion.category || 'General'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!currentAnswer.trim() || loading}
                            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Submit Answer</span>
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {session.answers.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Feedback</h3>
                        <div className="space-y-4">
                            {session.answers.map((answer, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Question {index + 1}</p>
                                    <p className="text-gray-800 mb-2">{answer.text}</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-blue-600">{answer.feedback}</p>
                                        <span className="text-gray-600">Score: {answer.score}/10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
