import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/ui/character-card";
import { RetroNavbar } from "@/components/retro-navbar";
import { useAuth } from "@/components/auth/auth-context";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import heroCharacters from "@/assets/hero-characters.png";
import fantasyMapBg from "@/assets/fantasy-map-bg.png";

const CHARACTERS = [
  {
    id: "math-wizard",
    name: "Arithmancer",
    class: "Math Wizard",
    description: "Master of numbers and equations. Channels mathematical formulas to cast powerful spells and solve complex problems.",
    icon: "🧙‍♂️",
    color: "math-wizard",
    stats: { strength: 6, intelligence: 10, agility: 7 }
  },
  {
    id: "grammar-guardian",
    name: "Syntax Knight",
    class: "Grammar Guardian",
    description: "Defender of proper language. Uses the power of grammar and syntax to protect knowledge and vanquish errors.",
    icon: "⚔️",
    color: "grammar-guardian",
    stats: { strength: 9, intelligence: 8, agility: 6 }
  },
  {
    id: "reading-ranger",
    name: "Lore Keeper",
    class: "Reading Ranger",
    description: "Scout of stories and comprehension. Navigates through texts with speed and precision to uncover hidden meanings.",
    icon: "🏹",
    color: "reading-ranger",
    stats: { strength: 7, intelligence: 9, agility: 10 }
  }
];

const Index = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background text-foreground">
      <RetroNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${fantasyMapBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pixel-pulse">
                SAT ASCEND
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Embark on an epic quest to master the SAT through retro gaming adventures
              </p>
            </div>
            
            <div className="relative max-w-3xl mx-auto">
              <img 
                src={heroCharacters} 
                alt="Choose your character" 
                className="w-full h-auto rounded-lg shadow-retro"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 border border-border">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Story Quests</span>
              </div>
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 border border-border">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Battle Mode</span>
              </div>
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 border border-border">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Daily Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Character Selection */}
      <section className="py-20 bg-card/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
              Choose Your Class
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each class specializes in different SAT subjects and offers unique abilities and skill trees
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {CHARACTERS.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter === character.id}
                onSelect={setSelectedCharacter}
              />
            ))}
          </div>
          
          {selectedCharacter && (
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow-primary text-lg px-8 py-6"
              >
                Start Your Adventure
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
              Game Features
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "XP & Leveling", desc: "Gain experience and level up your character", icon: "📈" },
              { title: "Skill Trees", desc: "Unlock powerful abilities and perks", icon: "🌳" },
              { title: "Inventory System", desc: "Collect and manage your items", icon: "🎒" },
              { title: "Custom Outfits", desc: "Personalize your character's appearance", icon: "👕" },
              { title: "Fantasy World", desc: "Explore an immersive game world", icon: "🗺️" },
              { title: "Shop System", desc: "Purchase items and upgrades", icon: "🛒" },
              { title: "Subscriptions", desc: "Unlock premium content and features", icon: "⭐" },
              { title: "Leaderboards", desc: "Compete with other players", icon: "🏆" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Begin Your Quest?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students already improving their SAT scores through gaming
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow-primary text-lg px-8 py-6"
            >
              {user ? "Go to Dashboard" : "Create Account"}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6"
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;