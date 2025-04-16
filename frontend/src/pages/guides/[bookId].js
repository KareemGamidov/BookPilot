import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressTracker from '../../components/ProgressTracker';
import { useAuth } from '../../contexts/AuthContext';
import { guidesAPI, booksAPI } from '../../utils/api';

const GuideView = () => {
  const [guide, setGuide] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chapters');
  const [activeChapter, setActiveChapter] = useState(0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { bookId } = router.query;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (bookId) {
      fetchGuideAndBook();
    }
  }, [isAuthenticated, bookId, router]);

  const fetchGuideAndBook = async () => {
    try {
      setLoading(true);
      const [guideResponse, bookResponse] = await Promise.all([
        guidesAPI.getGuide(bookId),
        booksAPI.getBook(bookId)
      ]);
      
      setGuide(guideResponse.data);
      setBook(bookResponse.data);
      setError('');
    } catch (err) {
      console.error('Error fetching guide:', err);
      setError('Failed to load guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (chapterIndex) => {
    if (!guide) return;
    
    try {
      const completedChapters = [...guide.progress.completed_chapters];
      if (!completedChapters.includes(chapterIndex)) {
        completedChapters.push(chapterIndex);
      }
      
      await guidesAPI.updateProgress(bookId, { completed_chapters: completedChapters });
      
      // Update local state
      setGuide({
        ...guide,
        progress: {
          ...guide.progress,
          completed_chapters: completedChapters
        }
      });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await guidesAPI.exportGuide(bookId, 'pdf');
      // In a real implementation, we would handle the download here
      alert('Guide exported successfully! Download would start in a real implementation.');
    } catch (err) {
      console.error('Error exporting guide:', err);
      alert('Failed to export guide. Please try again.');
    }
  };

  const handleChatClick = () => {
    router.push(`/chat/${bookId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary-500">Loading guide...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push('/books')}>
          Back to Books
        </Button>
      </Layout>
    );
  }

  if (!guide || !book) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-secondary-700 mb-2">Guide not found</h3>
          <p className="text-secondary-500 mb-6">
            The guide you're looking for doesn't exist or is still being processed.
          </p>
          <Button variant="outline" onClick={() => router.push('/books')}>
            Back to Books
          </Button>
        </div>
      </Layout>
    );
  }

  const content = guide.json_content;
  const progress = guide.progress;
  const completionPercentage = content.chapters.length > 0 
    ? (progress.completed_chapters.length / content.chapters.length) * 100 
    : 0;

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            {content.author && (
              <p className="text-secondary-600">by {content.author}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleChatClick}>
              Chat with Book
            </Button>
            <Button variant="primary" onClick={handleExport}>
              Export Guide
            </Button>
          </div>
        </div>
        
        <ProgressTracker 
          total={content.chapters.length} 
          completed={progress.completed_chapters.length} 
          className="mb-6"
        />
        
        <div className="border-b border-secondary-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chapters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setActiveTab('synthesis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'synthesis'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Synthesis
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quiz'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Quiz
            </button>
          </nav>
        </div>
        
        {activeTab === 'chapters' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="sticky top-6">
                  <h3 className="text-lg font-medium mb-3">Table of Contents</h3>
                  <ul className="space-y-2">
                    {content.toc.map((chapter, index) => (
                      <li key={index}>
                        <button
                          onClick={() => setActiveChapter(index)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            activeChapter === index
                              ? 'bg-primary-50 text-primary-700'
                              : 'hover:bg-secondary-50'
                          } ${
                            progress.completed_chapters.includes(index)
                              ? 'font-medium'
                              : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">
                              {progress.completed_chapters.includes(index) ? (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="w-4 h-4 inline-block"></span>
                              )}
                            </span>
                            {chapter}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <h2 className="text-xl font-semibold mb-4">{content.chapters[activeChapter]?.title || 'Chapter'}</h2>
                  
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p className="mb-6">{content.chapters[activeChapter]?.summary}</p>
                    
                    <h3 className="text-lg font-medium mb-2">Reflective Questions</h3>
                    <ul className="list-disc pl-5 mb-6">
                      {content.chapters[activeChapter]?.questions.map((question, index) => (
                        <li key={index} className="mb-2">{question}</li>
                      ))}
                    </ul>
                    
                    <h3 className="text-lg font-medium mb-2">Actionable Task</h3>
                    <div className="bg-primary-50 p-4 rounded-md border border-primary-100 mb-6">
                      <p className="text-primary-800">{content.chapters[activeChapter]?.task}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => activeChapter > 0 && setActiveChapter(activeChapter - 1)}
                      disabled={activeChapter === 0}
                    >
                      Previous Chapter
                    </Button>
                    
                    {progress.completed_chapters.includes(activeChapter) ? (
                      <Button
                        variant="secondary"
                        onClick={() => activeChapter < content.chapters.length - 1 && setActiveChapter(activeChapter + 1)}
                        disabled={activeChapter === content.chapters.length - 1}
                      >
                        Next Chapter
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          updateProgress(activeChapter);
                          if (activeChapter < content.chapters.length - 1) {
                            setActiveChapter(activeChapter + 1);
                          }
                        }}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'synthesis' && (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Synthesis</h2>
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium mb-3">Key Takeaways</h3>
              <ul className="list-disc pl-5 mb-6">
                {content.synthesis.key_takeaways.map((takeaway, index) => (
                  <li key={index} className="mb-2">{takeaway}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium mb-3">Action Plan</h3>
              <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
                <p className="text-primary-800 whitespace-pre-line">{content.synthesis.action_plan}</p>
              </div>
            </div>
          </Card>
        )}
        
        {activeTab === 'quiz' && (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Knowledge Check</h2>
            
            <div className="space-y-8">
              {content.quiz.map((question, qIndex) => (
                <div key={qIndex} className="border-b border-secondary-200 pb-6 last:border-0">
                  <h3 className="text-lg font-medium mb-3">Question {qIndex + 1}</h3>
                  <p className="mb-4">{question.question}</p>
                  
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex}
                        className={`p-3 rounded-md border cursor-pointer ${
                          progress.quiz_results && progress.quiz_results[qIndex] === oIndex
                            ? oIndex === question.correct_answer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                            : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                        onClick={() => {
                          if (!progress.quiz_results) {
                            const newResults = {};
                            newResults[qIndex] = oIndex;
                            guidesAPI.updateProgress(bookId, { quiz_results: newResults });
                            
                            // Update local state
                            setGuide({
                              ...guide,
                              progress: {
                                ...guide.progress,
                                quiz_results: newResults
                              }
                            });
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              progress.quiz_results && progress.quiz_results[qIndex] === oIndex
                                ? oIndex === question.correct_answer
                                  ? 'bg-green-500 border-green-500'
                                  : 'bg-red-500 border-red-500'
                                : 'border-secondary-300'
                            }`}>
                              {progress.quiz_results && progress.quiz_results[qIndex] === oIndex && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  {oIndex === question.correct_answer ? (
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  )}
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="ml-3">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {progress.quiz_results && progress.quiz_results[qIndex] !== undefined && (
                    <div className={`mt-4 p-3 rounded-md ${
                      progress.quiz_results[qIndex] === question.correct_answer
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {progress.quiz_results[qIndex] === question.correct_answer
                        ? 'Correct! Well done.'
                        : `Incorrect. The correct answer is: ${question.options[question.correct_answer]}`
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default GuideView;
