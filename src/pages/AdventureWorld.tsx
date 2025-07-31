
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Star, Trophy, Lock, CheckCircle } from 'lucide-react';
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
  bgColor: string;
  emoji: string;
}

const checkpoints: Checkpoint[] = [
  {
    id: 'starting-village',
    name: 'Starting Village',
    description: 'Learn the basics of SAT math',
    x: 50,
    y: 70,
    zone: 'starting_area',
    difficulty: 'Easy',
    subject: 'Math',
    questionsCount: 5,
    reward: 25,
    xpReward: 100,
    unlockLevel: 1,
    isCompleted: false,
    bgColor: 'from-green-400 to-green-600',
    emoji: '🏘️'
  },
  {
    id: 'algebra-forest',
    name: 'Algebra Forest',
    description: 'Master linear and quadratic equations',
    x: 20,
    y: 50,
    zone: 'forest',
    difficulty: 'Easy',
    subject: 'Math',
    questionsCount: 8,
    reward: 40,
    xpReward: 150,
    unlockLevel: 2,
    isCompleted: false,
    bgColor: 'from-green-500 to-green-700',
    emoji: '🌲'
  },
  {
    id: 'grammar-castle',
    name: 'Grammar Castle',
    description: 'Defend against grammatical errors',
    x: 50,
    y: 30,
    zone: 'castle',
    difficulty: 'Medium',
    subject: 'Writing',
    questionsCount: 10,
    reward: 60,
    xpReward: 200,
    unlockLevel: 3,
    isCompleted: false,
    bgColor: 'from-red-400 to-red-600',
    emoji: '🏰'
  },
  {
    id: 'reading-mountains',
    name: 'Reading Mountains',
    description: 'Climb to new heights of comprehension',
    x: 75,
    y: 45,
    zone: 'mountains',
    difficulty: 'Medium',
    subject: 'Reading',
    questionsCount: 12,
    reward: 75,
    xpReward: 250,
    unlockLevel: 4,
    isCompleted: false,
    bgColor: 'from-gray-400 to-gray-600',
    emoji: '⛰️'
  },
  {
    id: 'calculus-caverns',
    name: 'Calculus Caverns',
    description: 'Explore the depths of advanced mathematics',
    x: 25,
    y: 20,
    zone: 'caverns',
    difficulty: 'Hard',
    subject: 'Math',
    questionsCount: 15,
    reward: 100,
    xpReward: 350,
    unlockLevel: 6,
    isCompleted: false,
    bgColor: 'from-purple-500 to-purple-700',
    emoji: '🕳️'
  },
  {
    id: 'essay-temple',
    name: 'Essay Temple',
    description: 'Master the art of persuasive writing',
    x: 75,
    y: 20,
    zone: 'temple',
    difficulty: 'Hard',
    subject: 'Writing',
    questionsCount: 8,
    reward: 120,
    xpReward: 400,
    unlockLevel: 7,
    isCompleted: false,
    bgColor: 'from-yellow-400 to-yellow-600',
    emoji: '🏛️'
  },
  {
    id: 'crystal-tower',
    name: 'Crystal Tower',
    description: 'The ultimate SAT challenge',
    x: 50,
    y: 10,
    zone: 'tower',
    difficulty: 'Hard',
    subject: 'Mixed',
    questionsCount: 20,
    reward: 200,
    xpReward: 500,
    unlockLevel: 10,
    isCompleted: false,
    bgColor: 'from-blue-400 to-purple-600',
    emoji: '🗼'
  }
];

const AdventureWorld = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(1);
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
        .select('level, selected_character')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUserLevel(data.level || 1);
        setUserCharacter(data.selected_character);
      }

      const completed = JSON.parse(localStorage.getItem('completedCheckpoints') || '[]');
      setCompletedCheckpoints(completed);
      setLoading(false);
    };

    fetchUserData();
  }, [user, navigate]);

  const isCheckpointUnlocked = (checkpoint: Checkpoint) => {
    return userLevel >= checkpoint.unlockLevel;
  };

  const handleCheckpointClick = (checkpoint: Checkpoint) => {
    if (!isCheckpointUnlocked(checkpoint)) {
      toast({
        title: "Area Locked",
        description: `You need to reach level ${checkpoint.unlockLevel} to access this area.`,
        variant: "destructive",
      });
      return;
    }

    setExploringCheckpoint(checkpoint);
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

  if (exploringCheckpoint) {
    const defaultCharacter = userCharacter && userCharacter.stats ? userCharacter : {
      id: 'default',
      name: 'Adventurer',
      class: 'Student',
      stats: { health: 100, attack: 25, defense: 20, speed: 15 },
      avatar: '🧙‍♂️'
    };
    
    return (
      <MapExplorer
        checkpoint={exploringCheckpoint}
        character={defaultCharacter}
        onBack={() => setExploringCheckpoint(null)}
        onStartQuest={startQuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Floating clouds background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[10%] left-[5%] text-6xl animate-[float_6s_ease-in-out_infinite]">☁️</div>
        <div className="absolute top-[20%] right-[10%] text-4xl animate-[float_8s_ease-in-out_infinite_reverse]">☁️</div>
        <div className="absolute top-[60%] left-[15%] text-5xl animate-[float_7s_ease-in-out_infinite]">☁️</div>
        <div className="absolute bottom-[20%] right-[20%] text-3xl animate-[float_9s_ease-in-out_infinite_reverse]">☁️</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">World Map</h1>
              <p className="text-blue-100">Choose your adventure</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Card className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold">Level {userLevel}</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* World Map */}
        <div className="relative w-full h-[600px] bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl"
             style={{
               backgroundImage: `
                 linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 50%, rgba(29, 78, 216, 1) 100%),
                 radial-gradient(circle at 20% 20%, rgba(147, 197, 253, 0.3) 0%, transparent 50%),
                 radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.3) 0%, transparent 50%)
               `
             }}>
          {/* Floating grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%)
              `,
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          {/* Floating Islands */}
          {checkpoints.map((checkpoint, index) => {
            const isCompleted = completedCheckpoints.includes(checkpoint.id);
            const isUnlocked = isCheckpointUnlocked(checkpoint);
            
            // Create isometric floating island effect
            const getIslandStyle = (id: string) => {
              const baseStyles = {
                transform: 'perspective(600px) rotateX(30deg) rotateY(-15deg)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.2)',
                position: 'relative' as const,
                background: '',
                width: '120px',
                height: '100px'
              };

              switch(id) {
                case 'starting-village':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 70%, #15803d 100%)' };
                case 'algebra-forest':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #16a34a 0%, #166534 70%, #14532d 100%)' };
                case 'grammar-castle':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 70%, #991b1b 100%)' };
                case 'reading-mountains':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #6b7280 0%, #4b5563 70%, #374151 100%)' };
                case 'calculus-caverns':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #7c3aed 0%, #6d28d9 70%, #5b21b6 100%)' };
                case 'essay-temple':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #eab308 0%, #ca8a04 70%, #a16207 100%)' };
                case 'crystal-tower':
                  return { ...baseStyles, background: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 70%, #1d4ed8 100%)' };
                default:
                  return baseStyles;
              }
            };
            
            return (
              <div
                key={checkpoint.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110 animate-[float_6s_ease-in-out_infinite]"
                style={{
                  left: `${checkpoint.x}%`,
                  top: `${checkpoint.y}%`,
                  animationDelay: `${index * 0.5}s`
                }}
                onClick={() => handleCheckpointClick(checkpoint)}
              >
                {/* Floating Island */}
                <div style={getIslandStyle(checkpoint.id)} className="relative overflow-hidden">
                  {/* Island base with texture */}
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%)
                      `
                    }}></div>
                  </div>
                  
                  {/* Lock overlay for locked areas */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-[20px] backdrop-blur-sm">
                      <div className="bg-black/80 rounded-full p-3">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Completion badge */}
                  {isCompleted && (
                    <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 border-2 border-white shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {/* Island content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="text-3xl mb-2 drop-shadow-lg">{checkpoint.emoji}</div>
                    <div className="text-sm font-bold text-white text-center drop-shadow-lg bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {checkpoint.name.split(' ')[0]}
                    </div>
                  </div>

                  {/* Island shadow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-24 h-6 bg-black/20 rounded-full blur-sm"></div>
                </div>

                {/* Floating info on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
                    <CardContent className="p-3 text-xs">
                      <div className="font-bold text-center mb-1">{checkpoint.name}</div>
                      <div className="text-muted-foreground text-center mb-2">{checkpoint.description}</div>
                      <div className="flex items-center justify-between space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Level {checkpoint.unlockLevel}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{checkpoint.xpReward} XP</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}

          {/* Connecting paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            {/* Connect starting village to forest */}
            <path
              d={`M ${50}% ${70}% Q ${35}% ${60}% ${20}% ${50}%`}
              stroke="url(#pathGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              className="animate-pulse"
            />
            {/* Connect village to castle */}
            <path
              d={`M ${50}% ${70}% L ${50}% ${30}%`}
              stroke="url(#pathGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              className="animate-pulse"
            />
            {/* Connect castle to mountains */}
            <path
              d={`M ${50}% ${30}% Q ${62}% ${37}% ${75}% ${45}%`}
              stroke="url(#pathGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-6 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Unlocked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Locked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default AdventureWorld;
