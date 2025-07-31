import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Map, MapPin, Star, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapExplorer from '@/components/MapExplorer';

interface Checkpoint {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  zone: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  questionsCount: number;
  reward: number;
  xpReward: number;
  unlockLevel: number;
  isCompleted: boolean;
}

const checkpoints: Checkpoint[] = [
  {
    id: 'starting-village',
    name: 'Starting Village',
    description: 'Learn the basics of SAT math',
    x: 2,
    y: 2,
    zone: 'starting_area',
    difficulty: 'Easy',
    subject: 'Math',
    questionsCount: 5,
    reward: 25,
    xpReward: 100,
    unlockLevel: 1,
    isCompleted: false
  },
  {
    id: 'algebra-forest',
    name: 'Algebra Forest',
    description: 'Master linear and quadratic equations',
    x: 4,
    y: 3,
    zone: 'forest',
    difficulty: 'Easy',
    subject: 'Math',
    questionsCount: 8,
    reward: 40,
    xpReward: 150,
    unlockLevel: 2,
    isCompleted: false
  },
  {
    id: 'grammar-castle',
    name: 'Grammar Castle',
    description: 'Defend against grammatical errors',
    x: 6,
    y: 4,
    zone: 'castle',
    difficulty: 'Medium',
    subject: 'Writing',
    questionsCount: 10,
    reward: 60,
    xpReward: 200,
    unlockLevel: 3,
    isCompleted: false
  },
  {
    id: 'reading-mountains',
    name: 'Reading Mountains',
    description: 'Climb to new heights of comprehension',
    x: 3,
    y: 6,
    zone: 'mountains',
    difficulty: 'Medium',
    subject: 'Reading',
    questionsCount: 12,
    reward: 75,
    xpReward: 250,
    unlockLevel: 4,
    isCompleted: false
  },
  {
    id: 'calculus-caverns',
    name: 'Calculus Caverns',
    description: 'Explore the depths of advanced mathematics',
    x: 7,
    y: 6,
    zone: 'caverns',
    difficulty: 'Hard',
    subject: 'Math',
    questionsCount: 15,
    reward: 100,
    xpReward: 350,
    unlockLevel: 6,
    isCompleted: false
  },
  {
    id: 'essay-temple',
    name: 'Essay Temple',
    description: 'Master the art of persuasive writing',
    x: 5,
    y: 8,
    zone: 'temple',
    difficulty: 'Hard',
    subject: 'Writing',
    questionsCount: 8,
    reward: 120,
    xpReward: 400,
    unlockLevel: 7,
    isCompleted: false
  }
];

const AdventureWorld = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(1);
  const [userPosition, setUserPosition] = useState({ x: 2, y: 2, zone: 'starting_area' });
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [exploringCheckpoint, setExploringCheckpoint] = useState<Checkpoint | null>(null);
  const [userCharacter, setUserCharacter] = useState<any>(null);
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
        .select('level, map_position, selected_character')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUserLevel(data.level || 1);
        setUserPosition(data.map_position as { x: number; y: number; zone: string } || { x: 2, y: 2, zone: 'starting_area' });
        setUserCharacter(data.selected_character);
      }

      // Load completed checkpoints from localStorage (in real app, this would be from database)
      const completed = JSON.parse(localStorage.getItem('completedCheckpoints') || '[]');
      setCompletedCheckpoints(completed);
      setLoading(false);
    };

    fetchUserData();
  }, [user, navigate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-accent text-accent-foreground';
      case 'Medium': return 'bg-secondary text-secondary-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Math': return '🧮';
      case 'Reading': return '📖';
      case 'Writing': return '✍️';
      default: return '📚';
    }
  };

  const isCheckpointUnlocked = (checkpoint: Checkpoint) => {
    return userLevel >= checkpoint.unlockLevel;
  };

  const isCheckpointAccessible = (checkpoint: Checkpoint) => {
    const distance = Math.abs(checkpoint.x - userPosition.x) + Math.abs(checkpoint.y - userPosition.y);
    return distance <= 2; // Can only move to adjacent or nearby checkpoints
  };

  const moveToCheckpoint = async (checkpoint: Checkpoint) => {
    if (!isCheckpointUnlocked(checkpoint)) {
      toast({
        title: "Checkpoint Locked",
        description: `You need to reach level ${checkpoint.unlockLevel} to access this area.`,
        variant: "destructive",
      });
      return;
    }

    if (!isCheckpointAccessible(checkpoint)) {
      toast({
        title: "Too Far Away",
        description: "You can only travel to nearby locations. Complete closer checkpoints first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          map_position: { x: checkpoint.x, y: checkpoint.y, zone: checkpoint.zone }
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      setUserPosition({ x: checkpoint.x, y: checkpoint.y, zone: checkpoint.zone });
      setSelectedCheckpoint(checkpoint);
      
      toast({
        title: "Arrived!",
        description: `You've reached ${checkpoint.name}`,
      });
    } catch (error) {
      console.error('Error updating position:', error);
      toast({
        title: "Travel Failed",
        description: "Unable to travel to this location.",
        variant: "destructive",
      });
    }
  };

  const startQuest = (checkpoint: Checkpoint) => {
    if (completedCheckpoints.includes(checkpoint.id)) {
      toast({
        title: "Already Completed",
        description: "You've already completed this checkpoint!",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Quest Started!",
      description: `Starting ${checkpoint.name} challenge`,
    });

    // Simulate quest completion
    setTimeout(() => {
      const newCompleted = [...completedCheckpoints, checkpoint.id];
      setCompletedCheckpoints(newCompleted);
      localStorage.setItem('completedCheckpoints', JSON.stringify(newCompleted));
      
      updateRewards(checkpoint.reward, checkpoint.xpReward);
      
      toast({
        title: "Quest Completed!",
        description: `Earned ${checkpoint.reward} coins and ${checkpoint.xpReward} XP!`,
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

        setUserLevel(newLevel);
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

  if (exploringCheckpoint && userCharacter) {
    return (
      <MapExplorer
        checkpoint={exploringCheckpoint}
        character={userCharacter}
        onBack={() => setExploringCheckpoint(null)}
        onStartQuest={startQuest}
      />
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
              <h1 className="text-3xl font-bold text-foreground">Adventure World</h1>
              <p className="text-muted-foreground">Explore the world and complete quests to level up</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex items-center space-x-2 p-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">
                  ({userPosition.x}, {userPosition.y}) {userPosition.zone}
                </span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex items-center space-x-2 p-3">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-foreground">Level {userLevel}</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-8 gap-2 mb-8 bg-gradient-card p-6 rounded-lg border border-border">
          {Array.from({ length: 64 }, (_, index) => {
            const x = (index % 8) + 1;
            const y = Math.floor(index / 8) + 1;
            
            const checkpoint = checkpoints.find(cp => cp.x === x && cp.y === y);
            const isCurrentPosition = userPosition.x === x && userPosition.y === y;
            
            return (
              <div
                key={index}
                className={`aspect-square border border-border rounded flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${
                  isCurrentPosition 
                    ? 'bg-gradient-primary text-primary-foreground border-primary' 
                    : checkpoint 
                      ? completedCheckpoints.includes(checkpoint.id)
                        ? 'bg-accent/20 border-accent'
                        : isCheckpointUnlocked(checkpoint)
                          ? 'bg-secondary/20 border-secondary hover:bg-secondary/30'
                          : 'bg-muted/20 border-muted'
                      : 'bg-background/50'
                }`}
                onClick={() => checkpoint && setExploringCheckpoint(checkpoint)}
              >
                {isCurrentPosition && '👤'}
                {checkpoint && !isCurrentPosition && (
                  <span className="text-lg">
                    {completedCheckpoints.includes(checkpoint.id) ? '✅' : getSubjectIcon(checkpoint.subject)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Checkpoint Details */}
        {selectedCheckpoint && (
          <Card className="bg-gradient-card border-border mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getSubjectIcon(selectedCheckpoint.subject)}</span>
                  <div>
                    <CardTitle className="text-xl text-foreground">{selectedCheckpoint.name}</CardTitle>
                    <CardDescription>{selectedCheckpoint.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getDifficultyColor(selectedCheckpoint.difficulty)}>
                  {selectedCheckpoint.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span>{selectedCheckpoint.questionsCount} questions</span>
                </div>
                <span className="text-secondary font-medium">{selectedCheckpoint.reward} coins</span>
                <span className="text-accent font-medium">{selectedCheckpoint.xpReward} XP</span>
              </div>
              <Button 
                onClick={() => startQuest(selectedCheckpoint)}
                disabled={completedCheckpoints.includes(selectedCheckpoint.id)}
                className={completedCheckpoints.includes(selectedCheckpoint.id) ? '' : 'bg-gradient-primary'}
                variant={completedCheckpoints.includes(selectedCheckpoint.id) ? 'secondary' : 'default'}
              >
                {completedCheckpoints.includes(selectedCheckpoint.id) ? 'Completed' : 'Start Quest'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Checkpoints */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span>Available Locations</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkpoints.map((checkpoint) => {
              const isCompleted = completedCheckpoints.includes(checkpoint.id);
              const isUnlocked = isCheckpointUnlocked(checkpoint);
              const isAccessible = isCheckpointAccessible(checkpoint);
              
              return (
                <Card 
                  key={checkpoint.id}
                  className={`bg-gradient-card border-border transition-all duration-300 cursor-pointer ${
                    isCompleted ? 'opacity-75' : 
                    !isUnlocked ? 'opacity-50' : 
                    'hover:border-primary/50'
                  }`}
                  onClick={() => moveToCheckpoint(checkpoint)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{getSubjectIcon(checkpoint.subject)}</span>
                      <div className="flex space-x-2">
                        {isCompleted && <Badge variant="outline">✅</Badge>}
                        {!isUnlocked && <Badge variant="secondary">🔒</Badge>}
                        {!isAccessible && isUnlocked && <Badge variant="outline">📍</Badge>}
                      </div>
                    </div>
                    <CardTitle className="text-sm text-foreground">{checkpoint.name}</CardTitle>
                    <CardDescription className="text-xs">{checkpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={getDifficultyColor(checkpoint.difficulty)}>
                        {checkpoint.difficulty}
                      </Badge>
                      <span className="text-muted-foreground">
                        ({checkpoint.x}, {checkpoint.y})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureWorld;