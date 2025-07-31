
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Star, CheckCircle, X } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuestChallengeProps {
  checkpoint: any;
  character: any;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const generateQuestions = (subject: string, count: number): Question[] => {
  const mathQuestions = [
    {
      id: '1',
      question: 'What is the value of x in the equation 2x + 5 = 13?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4'
    },
    {
      id: '2', 
      question: 'If f(x) = x² - 3x + 2, what is f(3)?',
      options: ['2', '4', '6', '8'],
      correctAnswer: 0,
      explanation: 'f(3) = 3² - 3(3) + 2 = 9 - 9 + 2 = 2'
    },
    {
      id: '3',
      question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 1,
      explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (7 - 3)/(4 - 2) = 4/2 = 2'
    }
  ];

  const readingQuestions = [
    {
      id: '1',
      question: 'What is the main purpose of a thesis statement?',
      options: ['To conclude an essay', 'To introduce the topic', 'To state the main argument', 'To provide evidence'],
      correctAnswer: 2,
      explanation: 'A thesis statement presents the main argument or central claim of an essay'
    },
    {
      id: '2',
      question: 'Which literary device compares two unlike things using "like" or "as"?',
      options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
      correctAnswer: 1,
      explanation: 'A simile makes comparisons using "like" or "as", while a metaphor makes direct comparisons'
    }
  ];

  const writingQuestions = [
    {
      id: '1',
      question: 'Which sentence is grammatically correct?',
      options: [
        'Neither John nor his friends was going.',
        'Neither John nor his friends were going.',
        'Neither John or his friends were going.',
        'Neither John and his friends was going.'
      ],
      correctAnswer: 1,
      explanation: 'With "neither...nor", the verb agrees with the subject closer to it. "friends" is plural, so use "were"'
    },
    {
      id: '2',
      question: 'What is the correct way to punctuate this sentence: "The book however was very interesting"',
      options: [
        'The book however was very interesting.',
        'The book, however was very interesting.',
        'The book however, was very interesting.',
        'The book, however, was very interesting.'
      ],
      correctAnswer: 3,
      explanation: 'Transitional words like "however" should be set off by commas on both sides when used in the middle of a sentence'
    }
  ];

  let questionBank = mathQuestions;
  if (subject.includes('Reading')) questionBank = readingQuestions;
  if (subject.includes('Writing')) questionBank = writingQuestions;

  return questionBank.slice(0, Math.min(count, questionBank.length));
};

const QuestChallenge = ({ checkpoint, character, onComplete, onBack }: QuestChallengeProps) => {
  const [questions] = useState(() => generateQuestions(checkpoint.subject, checkpoint.questionsCount));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleNextQuestion();
    }
  }, [timeLeft, isAnswered]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    onComplete(score);
  };

  const progress = ((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-card border-border">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '📚'}
            </div>
            <CardTitle className="text-2xl text-foreground">
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{score}/{questions.length}</div>
              <div className="text-muted-foreground">Questions Correct</div>
              <Badge variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'outline'}>
                {percentage}% Score
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Coins Earned:</span>
                <span className="font-bold text-yellow-600">{checkpoint.reward}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>XP Gained:</span>
                <span className="font-bold text-blue-600">{checkpoint.xpReward}</span>
              </div>
            </div>
            
            <Button onClick={handleFinish} className="w-full bg-gradient-primary">
              Complete Quest
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                {timeLeft}s
              </span>
            </div>
            <Badge variant="outline">
              {currentQuestion + 1}/{questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="max-w-3xl mx-auto bg-gradient-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">
                Question {currentQuestion + 1}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  {checkpoint.subject}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-medium text-foreground leading-relaxed">
              {currentQ.question}
            </h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 border-2 transition-all duration-200 ";
                
                if (isAnswered) {
                  if (index === currentQ.correctAnswer) {
                    buttonClass += "bg-green-100 border-green-500 text-green-800";
                  } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                    buttonClass += "bg-red-100 border-red-500 text-red-800";
                  } else {
                    buttonClass += "bg-muted border-border text-muted-foreground";
                  }
                } else {
                  buttonClass += "bg-background border-border hover:border-primary hover:bg-primary/10";
                }
                
                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={buttonClass}
                    variant="outline"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{String.fromCharCode(65 + index)}. {option}</span>
                      {isAnswered && index === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {isAnswered && index === selectedAnswer && index !== currentQ.correctAnswer && (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800 text-sm">{currentQ.explanation}</p>
              </div>
            )}

            {isAnswered && (
              <div className="flex justify-end">
                <Button onClick={handleNextQuestion} className="bg-gradient-primary">
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quest'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestChallenge;
