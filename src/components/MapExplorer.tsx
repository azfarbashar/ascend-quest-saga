import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star, Trophy, Sword, Shield, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuestChallenge from '@/components/QuestChallenge';

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

interface Character {
  id: string;
  name: string;
  class: string;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  avatar: string;
}

interface MapExplorerProps {
  checkpoint: Checkpoint;
  character: Character;
  onBack: () => void;
  onStartQuest: (checkpoint: Checkpoint) => void;
}

const MapExplorer = ({ checkpoint, character, onBack, onStartQuest }: MapExplorerProps) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 5, y: 5 });
  const [npcs] = useState([
    { id: 'npc1', x: 3, y: 3, type: 'quest', name: 'Quest Giver' },
    { id: 'npc2', x: 7, y: 2, type: 'shop', name: 'Merchant' },
    { id: 'npc3', x: 8, y: 7, type: 'info', name: 'Sage' }
  ]);
  const [showClouds, setShowClouds] = useState(true);
  const [showQuest, setShowQuest] = useState(false);
  const { toast } = useToast();

  // Cloud loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClouds(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log(`Moving player ${direction}`);
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'up':
          newY = Math.max(0, prev.y - 1);
          break;
        case 'down':
          newY = Math.min(9, prev.y + 1);
          break;
        case 'left':
          newX = Math.max(0, prev.x - 1);
          break;
        case 'right':
          newX = Math.min(9, prev.x + 1);
          break;
      }
      
      console.log(`New position: (${newX}, ${newY})`);
      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleStartQuest = () => {
    setShowQuest(true);
  };

  const handleQuestComplete = (score: number) => {
    setShowQuest(false);
    onStartQuest(checkpoint);
    toast({
      title: "Quest Completed!",
      description: `You scored ${score}/${checkpoint.questionsCount}!`,
    });
  };

  // Check for NPC interactions
  useEffect(() => {
    const nearbyNpc = npcs.find(npc => 
      Math.abs(npc.x - playerPosition.x) <= 1 && 
      Math.abs(npc.y - playerPosition.y) <= 1
    );

    if (nearbyNpc) {
      toast({
        title: `Near ${nearbyNpc.name}`,
        description: "Press SPACE to interact",
      });
    }
  }, [playerPosition, npcs, toast]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-accent text-accent-foreground';
      case 'Medium': return 'bg-secondary text-secondary-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTerrainEmoji = (x: number, y: number) => {
    const terrainMap: { [key: string]: string } = {
      'starting_area': '🌱',
      'forest': '🌲',
      'castle': '🏰',
      'mountains': '⛰️',
      'caverns': '🕳️',
      'temple': '🏛️'
    };
    return terrainMap[checkpoint.zone] || '🌿';
  };

  const getNPCEmoji = (type: string) => {
    switch (type) {
      case 'quest': return '❗';
      case 'shop': return '🛒';
      case 'info': return '💡';
      default: return '👤';
    }
  };

  if (showClouds) {
    return (
      <div className="min-h-screen bg-gradient-background relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-pulse">☁️</div>
            <p className="text-xl text-foreground">Loading {checkpoint.name}...</p>
          </div>
        </div>
        {/* Animated clouds */}
        <div className="absolute inset-0">
          <div className="absolute text-6xl opacity-80 top-[20%] -right-[10%] animate-[slide-in-right_2s_ease-out]">☁️</div>
          <div className="absolute text-6xl opacity-80 top-[50%] -right-[10%] animate-[slide-in-right_2s_ease-out] [animation-delay:0.5s]">☁️</div>
          <div className="absolute text-6xl opacity-80 top-[70%] -right-[10%] animate-[slide-in-right_2s_ease-out] [animation-delay:1s]">☁️</div>
          <div className="absolute text-4xl opacity-60 top-[10%] -right-[15%] animate-[slide-in-right_2.5s_ease-out] [animation-delay:0.2s]">☁️</div>
          <div className="absolute text-5xl opacity-70 top-[80%] -right-[5%] animate-[slide-in-right_1.8s_ease-out] [animation-delay:0.8s]">☁️</div>
        </div>
      </div>
    );
  }

  if (showQuest) {
    return (
      <QuestChallenge
        checkpoint={checkpoint}
        character={character}
        onComplete={handleQuestComplete}
        onBack={() => setShowQuest(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative overflow-hidden"
         style={{
           backgroundImage: `
             radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.9) 0%, transparent 50%),
             radial-gradient(circle at 70% 80%, rgba(22, 163, 74, 0.7) 0%, transparent 50%),
             repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 20px)
           `
         }}>
      {/* 2D Game Environment */}
      <div className="absolute inset-0">
        {/* Trees and environment */}
        <div className="absolute top-[15%] left-[10%] text-6xl">🌳</div>
        <div className="absolute top-[25%] right-[15%] text-5xl">🌲</div>
        <div className="absolute bottom-[30%] left-[20%] text-4xl">🌿</div>
        <div className="absolute bottom-[20%] right-[25%] text-6xl">🏠</div>
        <div className="absolute top-[40%] left-[60%] text-3xl">🌸</div>
        <div className="absolute bottom-[50%] right-[40%] text-4xl">🍄</div>
        
        {/* Your Character */}
        <div className="absolute bottom-[35%] left-[45%] text-8xl animate-bounce z-10 drop-shadow-lg">
          {character.avatar || '🧙‍♂️'}
        </div>
        
        {/* NPCs or other characters */}
        <div className="absolute top-[60%] left-[30%] text-6xl">👤</div>
        <div className="absolute bottom-[40%] right-[30%] text-5xl">🧝‍♀️</div>
      </div>
      <div className="container mx-auto px-4 py-8 relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <div className="flex items-center space-x-4">
            <Button className="bg-green-700 hover:bg-green-600 text-white border border-green-400" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">{checkpoint.name}</h1>
              <p className="text-white/80 drop-shadow">{checkpoint.description}</p>
            </div>
          </div>
          <Badge className={`${getDifficultyColor(checkpoint.difficulty)} drop-shadow-lg`}>
            {checkpoint.difficulty}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Character Stats */}
          <div className="lg:col-span-1">
            <Card className="bg-white/20 backdrop-blur-sm border-white/30 mb-4 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Your Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center border border-white/30 rounded p-3 bg-black/20">
                  <div className="text-4xl mb-2">{character.avatar}</div>
                  <h3 className="font-bold text-white">{character.name}</h3>
                  <p className="text-sm text-white/70">{character.class}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">Health</span>
                    </div>
                    <span className="text-sm font-medium text-white">{character.stats.health}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white">Attack</span>
                    </div>
                    <span className="text-sm font-medium text-white">{character.stats.attack}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">Defense</span>
                    </div>
                    <span className="text-sm font-medium text-white">{character.stats.defense}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quest Action */}
            <Card className="bg-white/20 backdrop-blur-sm border-white/30 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Quest Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{checkpoint.questionsCount} Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>{checkpoint.reward} Coins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span>{checkpoint.xpReward} XP</span>
                  </div>
                </div>
                <Button 
                  onClick={handleStartQuest}
                  className="w-full bg-green-700 hover:bg-green-600 text-white border border-green-400"
                >
                  Start Quest Challenge
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Game Area - 2D Scene */}
          <div className="lg:col-span-3">
            <Card className="bg-white/20 backdrop-blur-sm border-white/30 mb-4 shadow-lg min-h-[500px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Explore {checkpoint.name}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <MapPin className="w-4 h-4" />
                    <span>Interactive Area</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                {/* 2D Game Environment */}
                <div 
                  className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-b from-green-300 to-green-500 border-2 border-white/30"
                  style={{
                    backgroundImage: `
                      linear-gradient(180deg, #86efac 0%, #22c55e  40%, #16a34a  100%),
                      radial-gradient(circle at 30% 60%, rgba(34, 197, 94, 0.6) 0%, transparent 50%),
                      radial-gradient(circle at 70% 20%, rgba(22, 163, 74, 0.4) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Background Elements */}
                  <div className="absolute bottom-0 left-10 text-6xl z-10">🏠</div>
                  <div className="absolute top-5 left-5 text-4xl">🌳</div>
                  <div className="absolute top-8 right-8 text-5xl">🌲</div>
                  <div className="absolute bottom-10 right-20 text-3xl">🌿</div>
                  <div className="absolute top-1/2 left-1/3 text-2xl">🌸</div>
                  <div className="absolute bottom-1/4 left-1/4 text-3xl">🍄</div>
                  
                  {/* Path */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-full bg-gradient-to-t from-amber-200 to-amber-100 opacity-60 rounded-t-full"></div>
                  
                  {/* Your Character - Centered and larger */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-8xl animate-bounce z-20 drop-shadow-2xl cursor-pointer"
                       onClick={handleStartQuest}>
                    {character.avatar || '🧙‍♂️'}
                  </div>
                  
                  {/* NPCs */}
                  <div className="absolute top-1/3 left-1/4 text-5xl animate-pulse cursor-pointer hover:scale-110 transition-transform"
                       title="Quest Giver">
                    👤
                  </div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl animate-pulse cursor-pointer hover:scale-110 transition-transform"
                       title="Helper NPC">
                    🧝‍♀️
                  </div>
                  
                  {/* Interactive Elements */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-black text-sm font-medium border border-white">
                    Click on your character to start the quest!
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="mt-4 text-center">
                  <p className="text-white/80 text-sm mb-2">
                    Welcome to {checkpoint.name}! Click on your character to begin the quest challenge.
                  </p>
                  <p className="text-white/60 text-xs">
                    Complete {checkpoint.questionsCount} questions to earn {checkpoint.reward} coins and {checkpoint.xpReward} XP
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
