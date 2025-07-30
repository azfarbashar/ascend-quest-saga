import React from 'react';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GameHUD from '@/components/GameHUD';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const GameWorld = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-background relative">
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Adventure World</h1>
          <p className="text-muted-foreground">Explore, battle, and level up your character</p>
        </div>
        
        <GameHUD />
      </div>
    </div>
  );
};

export default GameWorld;