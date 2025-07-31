
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, X, Coins, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';

interface CharacterUpgradeProps {
  character: any;
  onClose: () => void;
  onUpdate: (character: any) => void;
}

const CharacterUpgrade = ({ character, onClose, onUpdate }: CharacterUpgradeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [characterData, setCharacterData] = useState(character || {
    id: 'default',
    name: 'Adventurer',
    class: 'Student',
    stats: { health: 100, attack: 25, defense: 20, speed: 15 },
    avatar: '🧙‍♂️',
    level: 1,
    upgradeCosts: { health: 10, attack: 15, defense: 12, speed: 8 }
  });
  
  const [userCoins, setUserCoins] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newName, setNewName] = useState(characterData.name);

  React.useEffect(() => {
    const fetchUserCoins = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('coins')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserCoins(data.coins);
        }
      }
    };
    fetchUserCoins();
  }, [user]);

  const upgradeStat = async (statName: string) => {
    const cost = characterData.upgradeCosts[statName];
    
    if (userCoins < cost) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${cost} coins to upgrade ${statName}`,
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Deduct coins from user
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: userCoins - cost })
        .eq('user_id', user!.id);

      if (coinsError) throw coinsError;

      // Update character stats
      const updatedCharacter = {
        ...characterData,
        stats: {
          ...characterData.stats,
          [statName]: characterData.stats[statName] + 5
        },
        upgradeCosts: {
          ...characterData.upgradeCosts,
          [statName]: Math.floor(cost * 1.2) // Increase cost by 20%
        }
      };

      const { error: charError } = await supabase
        .from('profiles')
        .update({ selected_character: updatedCharacter })
        .eq('user_id', user!.id);

      if (charError) throw charError;

      setCharacterData(updatedCharacter);
      setUserCoins(prev => prev - cost);
      
      toast({
        title: "Stat Upgraded!",
        description: `${statName} increased by 5 points`,
      });
    } catch (error) {
      console.error('Error upgrading stat:', error);
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade character stat",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCharacterName = async () => {
    if (!newName.trim() || newName === characterData.name) return;

    setIsUpdating(true);
    try {
      const updatedCharacter = {
        ...characterData,
        name: newName.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ selected_character: updatedCharacter })
        .eq('user_id', user!.id);

      if (error) throw error;

      setCharacterData(updatedCharacter);
      
      toast({
        title: "Name Updated!",
        description: `Character renamed to ${newName}`,
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update character name",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatColor = (statName: string) => {
    switch (statName) {
      case 'health': return 'text-red-500';
      case 'attack': return 'text-orange-500';
      case 'defense': return 'text-blue-500';
      case 'speed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'health': return '❤️';
      case 'attack': return '⚔️';
      case 'defense': return '🛡️';
      case 'speed': return '⚡';
      default: return '📊';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Character Upgrade</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">{userCoins}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Character Info */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Character Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-2">{characterData.avatar}</div>
                  <Badge variant="secondary">{characterData.class}</Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character Name</label>
                  <div className="flex space-x-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter character name"
                      className="flex-1"
                    />
                    <Button
                      onClick={updateCharacterName}
                      disabled={isUpdating || !newName.trim() || newName === characterData.name}
                      size="sm"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Upgrade */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Upgrade Stats</CardTitle>
                <CardDescription>Spend coins to improve your character's abilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(characterData.stats).map(([statName, statValue]) => (
                  <div key={statName} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatIcon(statName)}</span>
                      <div>
                        <div className="font-medium capitalize">{statName}</div>
                        <div className={`text-sm ${getStatColor(statName)} font-bold`}>
                          {statValue}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Coins className="w-3 h-3" />
                        <span>{characterData.upgradeCosts[statName]}</span>
                      </div>
                      <Button
                        onClick={() => upgradeStat(statName)}
                        disabled={isUpdating || userCoins < characterData.upgradeCosts[statName]}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onUpdate(characterData);
                toast({
                  title: "Character Updated!",
                  description: "Your character changes have been saved",
                });
              }}
              className="bg-gradient-primary"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterUpgrade;
