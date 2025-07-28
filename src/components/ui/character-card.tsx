import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: {
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
  };
  isSelected?: boolean;
  onSelect: (characterId: string) => void;
}

export const CharacterCard = ({ character, isSelected, onSelect }: CharacterCardProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'math-wizard':
        return 'border-math-wizard bg-math-wizard/10 shadow-glow-secondary';
      case 'grammar-guardian':
        return 'border-grammar-guardian bg-grammar-guardian/10 shadow-glow-secondary';
      case 'reading-ranger':
        return 'border-reading-ranger bg-reading-ranger/10 shadow-glow-accent';
      default:
        return 'border-primary bg-primary/10 shadow-glow-primary';
    }
  };

  return (
    <Card 
      className={cn(
        "relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-card border-2",
        getColorClasses(character.color),
        isSelected && "ring-2 ring-primary animate-neon-glow"
      )}
      onClick={() => onSelect(character.id)}
    >
      <div className="text-center space-y-4">
        <div className="text-6xl animate-float">{character.icon}</div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{character.name}</h3>
          <Badge variant="secondary" className="font-medium">
            {character.class}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {character.description}
        </p>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Base Stats</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-destructive">STR</div>
              <div className="text-muted-foreground">{character.stats.strength}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-primary">INT</div>
              <div className="text-muted-foreground">{character.stats.intelligence}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-accent">AGI</div>
              <div className="text-muted-foreground">{character.stats.agility}</div>
            </div>
          </div>
        </div>
        
        <Button 
          variant={isSelected ? "default" : "outline"}
          className={cn(
            "w-full transition-all duration-300",
            isSelected && "animate-pixel-pulse"
          )}
        >
          {isSelected ? "Selected" : "Choose Character"}
        </Button>
      </div>
    </Card>
  );
};