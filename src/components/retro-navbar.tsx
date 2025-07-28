import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sword, BookOpen, Calculator, Trophy, User, Settings } from "lucide-react";

export const RetroNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              🎮 SAT ASCEND
            </div>
            <Badge variant="secondary" className="animate-pixel-pulse">
              BETA
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Quests
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              <Sword className="w-4 h-4 mr-2" />
              Battle
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              <Calculator className="w-4 h-4 mr-2" />
              Practice
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:scale-105 transition-transform">
              Sign Up
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};