import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sword, Shield, Heart, ArrowLeft, Crown, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Boss {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  hp: number;
  reward: number;
  xpReward: number;
  unlockLevel: number;
  icon: string;
  weaknesses: string[];
}

const bosses: Boss[] = [
  {
    id: 'algebra-ogre',
    name: 'Algebra Ogre',
    description: 'A massive creature that throws algebraic equations at heroes',
    difficulty: 1,
    hp: 100,
    reward: 100,
    xpReward: 300,
    unlockLevel: 1,
    icon: '👹',
    weaknesses: ['Linear Equations', 'Basic Algebra']
  },
  {
    id: 'grammar-gargoyle',
    name: 'Grammar Gargoyle',
    description: 'Stone guardian that tests your mastery of language',
    difficulty: 2,
    hp: 150,
    reward: 150,
    xpReward: 450,
    unlockLevel: 3,
    icon: '🗿',
    weaknesses: ['Punctuation', 'Sentence Structure']
  },
  {
    id: 'reading-dragon',
    name: 'Reading Dragon',
    description: 'Ancient dragon that breathes complex passages',
    difficulty: 3,
    hp: 200,
    reward: 200,
    xpReward: 600,
    unlockLevel: 5,
    icon: '🐉',
    weaknesses: ['Comprehension', 'Critical Analysis']
  },
  {
    id: 'calculus-demon',
    name: 'Calculus Demon',
    description: 'Infernal entity of derivatives and integrals',
    difficulty: 4,
    hp: 300,
    reward: 300,
    xpReward: 800,
    unlockLevel: 8,
    icon: '😈',
    weaknesses: ['Derivatives', 'Integrals', 'Limits']
  },
  {
    id: 'sat-sovereign',
    name: 'SAT Sovereign',
    description: 'The ultimate challenge - master of all SAT domains',
    difficulty: 5,
    hp: 500,
    reward: 500,
    xpReward: 1200,
    unlockLevel: 12,
    icon: '👑',
    weaknesses: ['All Subjects']
  }
];

const BattleMode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(1);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('level')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user level:', error);
      } else {
        setUserLevel(data.level || 1);
      }

      // Load defeated bosses from localStorage (in real app, this would be from database)
      const defeated = JSON.parse(localStorage.getItem('defeatedBosses') || '[]');
      setDefeatedBosses(defeated);
      setLoading(false);
    };

    fetchUserData();
  }, [user, navigate]);

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < difficulty ? 'text-destructive' : 'text-muted-foreground'}`}
        fill={i < difficulty ? 'currentColor' : 'none'}
      />
    ));
  };

  const startBattle = (boss: Boss) => {
    if (userLevel < boss.unlockLevel) {
      toast({
        title: "Level Too Low",
        description: `You need to reach level ${boss.unlockLevel} to challenge this boss.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedBoss(boss);
    setBattleInProgress(true);
    setPlayerHP(100);
    setBossHP(boss.hp);
    
    toast({
      title: "Battle Started!",
      description: `You're now facing the ${boss.name}!`,
    });
  };

  const simulateBattleTurn = () => {
    if (!selectedBoss) return;

    // Simulate battle mechanics
    const playerDamage = Math.floor(Math.random() * 30) + 10;
    const bossDamage = Math.floor(Math.random() * 20) + 5;

    const newBossHP = Math.max(0, bossHP - playerDamage);
    const newPlayerHP = Math.max(0, playerHP - bossDamage);

    setBossHP(newBossHP);
    setPlayerHP(newPlayerHP);

    if (newBossHP <= 0) {
      // Player wins
      setTimeout(() => {
        const newDefeated = [...defeatedBosses, selectedBoss.id];
        setDefeatedBosses(newDefeated);
        localStorage.setItem('defeatedBosses', JSON.stringify(newDefeated));
        
        updateRewards(selectedBoss.reward, selectedBoss.xpReward);
        
        toast({
          title: "Victory!",
          description: `You defeated the ${selectedBoss.name}! Earned ${selectedBoss.reward} coins and ${selectedBoss.xpReward} XP!`,
        });
        
        endBattle();
      }, 1000);
    } else if (newPlayerHP <= 0) {
      // Player loses
      setTimeout(() => {
        toast({
          title: "Defeat",
          description: `The ${selectedBoss.name} has defeated you. Train harder and try again!`,
          variant: "destructive",
        });
        endBattle();
      }, 1000);
    }
  };

  const endBattle = () => {
    setBattleInProgress(false);
    setSelectedBoss(null);
    setPlayerHP(100);
    setBossHP(100);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (battleInProgress && selectedBoss) {
    return (
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gradient-card border-border max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">{selectedBoss.icon}</div>
              <CardTitle className="text-2xl text-foreground">{selectedBoss.name}</CardTitle>
              <CardDescription>Battle in Progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Boss HP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-destructive">Boss HP</span>
                  <span className="text-destructive">{bossHP}/{selectedBoss.hp}</span>
                </div>
                <Progress value={(bossHP / selectedBoss.hp) * 100} className="h-3" />
              </div>

              {/* Player HP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-accent">Your HP</span>
                  <span className="text-accent">{playerHP}/100</span>
                </div>
                <Progress value={playerHP} className="h-3" />
              </div>

              {/* Battle Actions */}
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={simulateBattleTurn}
                  className="bg-gradient-primary"
                  disabled={playerHP <= 0 || bossHP <= 0}
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Attack
                </Button>
                <Button variant="outline" onClick={endBattle}>
                  Retreat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <h1 className="text-3xl font-bold text-foreground">Battle Mode</h1>
              <p className="text-muted-foreground">Challenge powerful bosses to test your knowledge</p>
            </div>
          </div>
          <Card className="bg-gradient-card border-border">
            <CardContent className="flex items-center space-x-2 p-4">
              <Crown className="w-5 h-5 text-primary" />
              <span className="text-foreground">Level {userLevel}</span>
            </CardContent>
          </Card>
        </div>

        {/* Boss List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bosses.map((boss) => {
            const isDefeated = defeatedBosses.includes(boss.id);
            const isLocked = userLevel < boss.unlockLevel;
            
            return (
              <Card 
                key={boss.id} 
                className={`bg-gradient-card border-border transition-all duration-300 ${
                  isDefeated ? 'opacity-75' : isLocked ? 'opacity-50' : 'hover:border-primary/50'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getDifficultyStars(boss.difficulty)}
                    </div>
                    {isDefeated && <Badge variant="outline">✓ Defeated</Badge>}
                    {isLocked && <Badge variant="secondary">🔒 Locked</Badge>}
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{boss.icon}</div>
                    <CardTitle className="text-lg text-foreground">{boss.name}</CardTitle>
                    <CardDescription>{boss.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span>{boss.hp} HP</span>
                    </div>
                    <span className="text-muted-foreground">Level {boss.unlockLevel}+</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Weaknesses:</h4>
                    <div className="flex flex-wrap gap-1">
                      {boss.weaknesses.map((weakness, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-4 text-sm">
                      <span className="text-secondary font-medium">{boss.reward} coins</span>
                      <span className="text-accent font-medium">{boss.xpReward} XP</span>
                    </div>
                    <Button 
                      onClick={() => startBattle(boss)}
                      disabled={isLocked || isDefeated}
                      className={isLocked || isDefeated ? '' : 'bg-gradient-primary'}
                      variant={isLocked || isDefeated ? 'secondary' : 'default'}
                    >
                      {isDefeated ? 'Defeated' : isLocked ? `Level ${boss.unlockLevel}` : 'Challenge'}
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

export default BattleMode;