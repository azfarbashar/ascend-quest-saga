import { useState } from 'react';
import { CharacterCard } from '@/components/ui/character-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    description: 'Master of equations and mathematical mysteries. Excels at algebra, geometry, and calculus.',
    icon: '🧙‍♂️',
    color: 'math-wizard',
    stats: { strength: 5, intelligence: 9, agility: 6 }
  },
  {
    id: 'grammar-guardian',
    name: 'Grammar Guardian',
    class: 'Word Protector',
    description: 'Defender of proper language and syntax. Expert in writing, grammar, and literature.',
    icon: '⚔️',
    color: 'grammar-guardian',
    stats: { strength: 7, intelligence: 8, agility: 5 }
  },
  {
    id: 'reading-ranger',
    name: 'Reading Ranger',
    class: 'Text Explorer',
    description: 'Scout of comprehension and critical thinking. Specializes in reading analysis and interpretation.',
    icon: '🏹',
    color: 'reading-ranger',
    stats: { strength: 6, intelligence: 7, agility: 8 }
  }
];

interface CharacterSelectionProps {
  currentCharacter?: string;
  onCharacterSelect: (character: Character) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterSelection = ({ currentCharacter, onCharacterSelect, isOpen, onClose }: CharacterSelectionProps) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string>(currentCharacter || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleConfirmSelection = async () => {
    if (!selectedCharacter) return;
    
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ selected_character: selectedCharacter })
        .eq('user_id', user.id);

      if (error) throw error;

      const character = characters.find(c => c.id === selectedCharacter);
      if (character) {
        onCharacterSelect(character);
        toast({
          title: "Character Selected!",
          description: `You are now playing as ${character.name}`,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error updating character:', error);
      toast({
        title: "Error",
        description: "Failed to update character selection",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Character</h2>
          <p className="text-muted-foreground mb-6">Select your learning companion for the SAT Quest adventure!</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter === character.id}
                onSelect={setSelectedCharacter}
              />
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={!selectedCharacter || isUpdating}
              className="bg-gradient-primary"
            >
              {isUpdating ? 'Updating...' : 'Confirm Selection'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};