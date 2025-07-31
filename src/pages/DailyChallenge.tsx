import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Star, Trophy, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  xpReward: number;
  timeLimit: number; // in minutes
  questions: number;
  subject: string;
}

const dailyChallenges: DailyChallenge[] = [
  {
    id: 'math-basics',
    title: 'Algebra Fundamentals',
    description: 'Master basic algebraic equations and inequalities',
    difficulty: 'Easy',
    reward: 50,
    xpReward: 200,
    timeLimit: 15,
    questions: 10,
    subject: 'Mathematics'
  },
  {
    id: 'reading-comprehension',
    title: 'Literary Analysis',
    description: 'Analyze complex passages and identify main themes',
    difficulty: 'Medium',
    reward: 75,
    xpReward: 300,
    timeLimit: 20,
    questions: 8,
    subject: 'Reading'
  },
  {
    id: 'grammar-advanced',
    title: 'Advanced Grammar',
    description: 'Complex sentence structures and punctuation rules',
    difficulty: 'Hard',
    reward: 100,
    xpReward: 500,
    timeLimit: 25,
    questions: 12,
    subject: 'Writing'
  }
];

const DailyChallenge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // In a real app, you'd fetch completed challenges from the database
    // For now, we'll use localStorage for demo purposes
    const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
    setCompletedChallenges(completed);
    setLoading(false);
  }, [user, navigate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-accent text-accent-foreground';
      case 'Medium': return 'bg-secondary text-secondary-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStartChallenge = async (challenge: DailyChallenge) => {
    if (completedChallenges.includes(challenge.id)) {
      toast({
        title: "Already Completed",
        description: "You've already completed this challenge today!",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Challenge Started!",
      description: `Starting ${challenge.title}. Good luck!`,
    });

    // In a real app, this would navigate to the actual challenge
    // For demo, we'll simulate completion
    setTimeout(() => {
      const newCompleted = [...completedChallenges, challenge.id];
      setCompletedChallenges(newCompleted);
      localStorage.setItem('completedChallenges', JSON.stringify(newCompleted));
      
      // Award coins and XP
      updateRewards(challenge.reward, challenge.xpReward);
      
      toast({
        title: "Challenge Completed!",
        description: `Earned ${challenge.reward} coins and ${challenge.xpReward} XP!`,
      });
    }, 3000);
  };

  const updateRewards = async (coins: number, xp: number) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins, experience, level')
        .eq('user_id', user!.id)
        .single();

      if (profile) {
        const newXP = profile.experience + xp;
        const newLevel = Math.floor(1 + Math.sqrt(newXP / 100));
        
        await supabase
          .from('profiles')
          .update({ 
            coins: profile.coins + coins,
            experience: newXP,
            level: newLevel
          })
          .eq('user_id', user!.id);
      }
    } catch (error) {
      console.error('Error updating rewards:', error);
    }
  };

  const totalChallenges = dailyChallenges.length;
  const completedCount = completedChallenges.length;
  const progressPercentage = (completedCount / totalChallenges) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Daily Challenges</h1>
              <p className="text-muted-foreground">Complete daily challenges to earn bonus rewards</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-card border-border mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Today's Progress</CardTitle>
                <CardDescription>
                  {completedCount} of {totalChallenges} challenges completed
                </CardDescription>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {completedCount === totalChallenges 
                ? "🎉 All challenges completed! Check back tomorrow for new ones." 
                : `${totalChallenges - completedCount} challenges remaining`
              }
            </p>
          </CardContent>
        </Card>

        {/* Challenges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dailyChallenges.map((challenge) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            
            return (
              <Card 
                key={challenge.id} 
                className={`bg-gradient-card border-border transition-all duration-300 ${
                  isCompleted ? 'opacity-75' : 'hover:border-primary/50'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    {isCompleted && <Badge variant="outline">✓ Completed</Badge>}
                  </div>
                  <CardTitle className="text-lg text-foreground">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{challenge.timeLimit} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-accent" />
                      <span>{challenge.questions} questions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-4 text-sm">
                      <span className="text-secondary font-medium">{challenge.reward} coins</span>
                      <span className="text-accent font-medium">{challenge.xpReward} XP</span>
                    </div>
                    <Button 
                      onClick={() => handleStartChallenge(challenge)}
                      disabled={isCompleted}
                      className={isCompleted ? '' : 'bg-gradient-primary'}
                      variant={isCompleted ? 'secondary' : 'default'}
                    >
                      {isCompleted ? 'Completed' : 'Start Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;