import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Coins, Star, Settings, User } from "lucide-react";
import { CharacterSelection } from "@/components/CharacterSelection";
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
    <div className="min-h-screen bg-gradient-background">
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
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Your Character</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{selectedCharacterData.icon}</div>
                    <h3 className="text-xl font-bold text-foreground">{selectedCharacterData.name}</h3>
                    <Badge variant="secondary" className="font-medium">
                      {selectedCharacterData.class}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    {selectedCharacterData.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Stats</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-destructive">STR</div>
                        <div className="text-muted-foreground">{selectedCharacterData.stats.strength}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-primary">INT</div>
                        <div className="text-muted-foreground">{selectedCharacterData.stats.intelligence}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-accent">AGI</div>
                        <div className="text-muted-foreground">{selectedCharacterData.stats.agility}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCharacterSelection(true)}
                  >
                    Change Character
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.display_name || "Hero"}!
              </h1>
              <p className="text-muted-foreground">Ready for your next quest?</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profile?.level || 1}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Star className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{profile?.experience || 0}</div>
              <Progress value={experienceProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(profile?.experience || 0) % 1000} / {experienceToNextLevel} to next level
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coins</CardTitle>
              <Coins className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{profile?.coins || 100}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Character</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.selected_character ? (
                <Badge variant="secondary">{selectedCharacterData?.name || profile.selected_character}</Badge>
              ) : (
                <Button size="sm" onClick={() => setShowCharacterSelection(true)}>
                  Choose Character
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Adventure World</CardTitle>
              <CardDescription>Explore the game world and level up</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-primary" 
                onClick={() => navigate('/adventure')}
              >
                Enter Adventure
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Battle Mode</CardTitle>
              <CardDescription>Challenge powerful bosses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-accent"
                onClick={() => navigate('/battle')}
              >
                Enter Battle
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Daily Challenge</CardTitle>
              <CardDescription>Earn bonus rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-secondary"
                onClick={() => navigate('/daily-challenge')}
              >
                Accept Challenge
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Shop</CardTitle>
              <CardDescription>Buy items and upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/shop')}
              >
                Browse Shop
              </Button>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;