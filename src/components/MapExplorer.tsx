import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star, Trophy, Sword, Shield, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
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

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{checkpoint.name}</h1>
              <p className="text-muted-foreground">{checkpoint.description}</p>
            </div>
          </div>
          <Badge className={getDifficultyColor(checkpoint.difficulty)}>
            {checkpoint.difficulty}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Character Stats */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Your Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{character.avatar}</div>
                  <h3 className="font-bold text-foreground">{character.name}</h3>
                  <p className="text-sm text-muted-foreground">{character.class}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Health</span>
                    </div>
                    <span className="text-sm font-medium">{character.stats.health}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sword className="w-4 h-4 text-primary" />
                      <span className="text-sm">Attack</span>
                    </div>
                    <span className="text-sm font-medium">{character.stats.attack}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span className="text-sm">Defense</span>
                    </div>
                    <span className="text-sm font-medium">{character.stats.defense}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Use WASD or arrow keys to move</p>
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <Button size="sm" onClick={() => movePlayer('up')}>↑</Button>
                  <div></div>
                  <Button size="sm" onClick={() => movePlayer('left')}>←</Button>
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <Button size="sm" onClick={() => movePlayer('right')}>→</Button>
                  <div></div>
                  <Button size="sm" onClick={() => movePlayer('down')}>↓</Button>
                  <div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-border mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">Explore {checkpoint.zone}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>({playerPosition.x}, {playerPosition.y})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Game Grid */}
                <div className="grid grid-cols-10 gap-1 mb-4 bg-background/20 p-4 rounded-lg">
                  {Array.from({ length: 100 }, (_, index) => {
                    const x = index % 10;
                    const y = Math.floor(index / 10);
                    const isPlayer = playerPosition.x === x && playerPosition.y === y;
                    const npc = npcs.find(npc => npc.x === x && npc.y === y);
                    
                    return (
                      <div
                        key={index}
                        className={`aspect-square border border-border/50 rounded flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${
                          isPlayer 
                            ? 'bg-gradient-primary text-primary-foreground border-primary' 
                            : npc
                              ? 'bg-accent/20 border-accent'
                              : 'bg-background/50 hover:bg-background/70'
                        }`}
                        onClick={() => setPlayerPosition({ x, y })}
                      >
                        {isPlayer && <span className="text-lg">{character.avatar}</span>}
                        {npc && !isPlayer && (
                          <span className="text-lg">{getNPCEmoji(npc.type)}</span>
                        )}
                        {!isPlayer && !npc && (
                          <span className="text-xs opacity-50">{getTerrainEmoji(x, y)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quest Info */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-accent" />
                      <span>{checkpoint.questionsCount} questions</span>
                    </div>
                    <span className="text-secondary font-medium">{checkpoint.reward} coins</span>
                    <span className="text-accent font-medium">{checkpoint.xpReward} XP</span>
                  </div>
                  <Button 
                    onClick={() => onStartQuest(checkpoint)}
                    className="bg-gradient-primary"
                  >
                    Start Quest
                  </Button>
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