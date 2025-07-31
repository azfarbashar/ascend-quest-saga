import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Coins, Star, Settings, User, Package, Sword, Shield, Zap, Plus } from "lucide-react";
import { CharacterSelection } from "@/components/CharacterSelection";
import CharacterUpgrade from "@/components/CharacterUpgrade";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  selected_character: string | null;
  level: number;
  experience: number;
  coins: number;
}

interface Character {
  id: string;
  name: string;
  class: string;
  description: string;
  icon: string;
  color: string;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
  };
}

const characters: Character[] = [
  {
    id: 'math-wizard',
    name: 'Math Wizard',
    class: 'Number Cruncher',
    description: 'Master of equations and mathematical mysteries.',
    icon: '🧙‍♂️',
    color: 'math-wizard',
    stats: { strength: 5, intelligence: 9, agility: 6 }
  },
  {
    id: 'grammar-guardian',
    name: 'Grammar Guardian',
    class: 'Word Protector',
    description: 'Defender of proper language and syntax.',
    icon: '⚔️',
    color: 'grammar-guardian',
    stats: { strength: 7, intelligence: 8, agility: 5 }
  },
  {
    id: 'reading-ranger',
    name: 'Reading Ranger',
    class: 'Text Explorer',
    description: 'Scout of comprehension and critical thinking.',
    icon: '🏹',
    color: 'reading-ranger',
    stats: { strength: 6, intelligence: 7, agility: 8 }
  }
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacterData, setSelectedCharacterData] = useState<Character | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        if (data.selected_character) {
          const character = characters.find(c => c.id === data.selected_character);
          setSelectedCharacterData(character || null);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacterData(character);
    setProfile(prev => prev ? { ...prev, selected_character: character.id } : null);
  };

  const experienceToNextLevel = 1000 * profile?.level || 1000;
  const experienceProgress = profile ? (profile.experience % 1000) / 10 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        {/* Character Selection Modal */}
        <CharacterSelection
          currentCharacter={profile?.selected_character || ''}
          onCharacterSelect={handleCharacterSelect}
          isOpen={showCharacterSelection}
          onClose={() => setShowCharacterSelection(false)}
        />

        <div className="flex gap-8">
          {/* Character Sidebar */}
          {selectedCharacterData && (
            <div className="w-80 space-y-6">
              <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>PLAYER.CHAR</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center border border-green-400/30 rounded p-4 bg-black/50">
                    <div className="text-5xl mb-2">{selectedCharacterData.icon}</div>
                    <h3 className="text-xl font-bold text-green-300">{selectedCharacterData.name}</h3>
                    <Badge className="bg-green-700 text-green-100 border-green-400">
                      {selectedCharacterData.class}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-green-300/70 text-center font-mono">
                    {selectedCharacterData.description}
                  </p>
                  
                  <div className="space-y-3 border border-green-400/30 rounded p-3 bg-black/30">
                    <h4 className="text-sm font-bold text-green-400">STATS.SYS</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-red-400"><Sword className="w-3 h-3 mr-1"/>STR</span>
                        <span className="text-green-300">{selectedCharacterData.stats.strength}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-blue-400"><Zap className="w-3 h-3 mr-1"/>INT</span>
                        <span className="text-green-300">{selectedCharacterData.stats.intelligence}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-yellow-400"><Shield className="w-3 h-3 mr-1"/>AGI</span>
                        <span className="text-green-300">{selectedCharacterData.stats.agility}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-green-700 hover:bg-green-600 text-black border border-green-400"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      UPGRADE.EXE
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10"
                      onClick={() => setShowCharacterSelection(true)}
                    >
                      SWAP.CHAR
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>INVENTORY.SYS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="aspect-square border border-green-400/30 rounded bg-black/50 flex items-center justify-center text-green-400/30 text-xs hover:border-green-400/60 transition-colors"
                      >
                        {i < inventory.length ? inventory[i].icon : "[ ]"}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-300/50 mt-2 text-center">
                    {inventory.length}/12 SLOTS.USED
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border border-green-400/30 rounded p-4 bg-green-900/10">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 border-2 border-green-400 rounded bg-black/50 flex items-center justify-center">
              <span className="text-green-400 text-2xl font-bold">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-400 font-mono">
                {'>'} WELCOME.BACK {profile?.display_name?.toUpperCase() || "PLAYER"}
              </h1>
              <p className="text-green-300/70 font-mono">SYSTEM.STATUS: READY.FOR.QUEST</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button className="bg-green-700 hover:bg-green-600 text-black border border-green-400">
              <Settings className="w-4 h-4 mr-2" />
              CONFIG.SYS
            </Button>
            <Button className="bg-red-700 hover:bg-red-600 text-white border border-red-400" onClick={signOut}>
              LOGOUT.EXE
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400">LEVEL.SYS</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300 font-mono">{profile?.level || 1}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400">EXP.DATA</CardTitle>
              <Star className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300 font-mono">{profile?.experience || 0}</div>
              <div className="mt-2 bg-black/50 border border-green-400/30 rounded h-2">
                <div 
                  className="bg-green-400 h-full rounded transition-all duration-300"
                  style={{ width: `${experienceProgress}%` }}
                />
              </div>
              <p className="text-xs text-green-300/70 mt-1 font-mono">
                {(profile?.experience || 0) % 1000} / {experienceToNextLevel} TO.NEXT
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400">COINS.BAL</CardTitle>
              <Coins className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300 font-mono">{profile?.coins || 100}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 shadow-lg shadow-green-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400">CHAR.ID</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.selected_character ? (
                <Badge className="bg-green-700 text-green-100 border-green-400 font-mono">
                  {selectedCharacterData?.name || profile.selected_character}
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-green-700 hover:bg-green-600 text-black border border-green-400"
                  onClick={() => setShowCharacterSelection(true)}
                >
                  SELECT.CHAR
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-green-900/20 border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer shadow-lg shadow-green-400/10 hover:shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-400 font-mono">ADVENTURE.EXE</CardTitle>
              <CardDescription className="text-green-300/70 font-mono">Explore.the.game.world.and.level.up</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-700 hover:bg-green-600 text-black border border-green-400 font-mono" 
                onClick={() => navigate('/adventure')}
              >
                {'>'} ENTER.WORLD
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer shadow-lg shadow-green-400/10 hover:shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-400 font-mono">BATTLE.SYS</CardTitle>
              <CardDescription className="text-green-300/70 font-mono">Challenge.powerful.bosses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-red-700 hover:bg-red-600 text-white border border-red-400 font-mono"
                onClick={() => navigate('/battle')}
              >
                {'>'} ENTER.BATTLE
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer shadow-lg shadow-green-400/10 hover:shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-400 font-mono">DAILY.QUEST</CardTitle>
              <CardDescription className="text-green-300/70 font-mono">Earn.bonus.rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-700 hover:bg-blue-600 text-white border border-blue-400 font-mono"
                onClick={() => navigate('/daily-challenge')}
              >
                {'>'} ACCEPT.CHALLENGE
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer shadow-lg shadow-green-400/10 hover:shadow-green-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-400 font-mono">SHOP.NET</CardTitle>
              <CardDescription className="text-green-300/70 font-mono">Buy.items.and.upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-black border border-green-400 text-green-400 hover:bg-green-400/10 font-mono"
                onClick={() => navigate('/shop')}
              >
                {'>'} BROWSE.SHOP
              </Button>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      </div>

      {/* Character Upgrade Modal */}
      {showUpgradeModal && selectedCharacterData && (
        <CharacterUpgrade
          character={selectedCharacterData}
          onClose={() => setShowUpgradeModal(false)}
          onUpdate={(updatedCharacter) => {
            setSelectedCharacterData(updatedCharacter);
            setShowUpgradeModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;