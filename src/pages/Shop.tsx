import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Star, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'power-up' | 'cosmetic' | 'boost';
  icon: string;
  effect: string;
}

const shopItems: ShopItem[] = [
  {
    id: 'xp-boost',
    name: 'XP Boost',
    description: 'Double your experience points for the next 3 questions',
    price: 50,
    type: 'boost',
    icon: '⚡',
    effect: '+100% XP for 3 questions'
  },
  {
    id: 'time-freeze',
    name: 'Time Freeze',
    description: 'Stop the timer for 30 seconds during any challenge',
    price: 75,
    type: 'power-up',
    icon: '❄️',
    effect: 'Pause timer for 30s'
  },
  {
    id: 'hint-crystal',
    name: 'Hint Crystal',
    description: 'Reveals one incorrect answer in multiple choice questions',
    price: 100,
    type: 'power-up',
    icon: '🔮',
    effect: 'Eliminate 1 wrong answer'
  },
  {
    id: 'golden-crown',
    name: 'Golden Crown',
    description: 'Show off your achievements with this prestigious crown',
    price: 200,
    type: 'cosmetic',
    icon: '👑',
    effect: 'Cosmetic upgrade'
  },
  {
    id: 'shield-protection',
    name: 'Shield Protection',
    description: 'Protects you from losing points on one wrong answer',
    price: 150,
    type: 'power-up',
    icon: '🛡️',
    effect: 'No penalty for 1 mistake'
  },
  {
    id: 'coin-multiplier',
    name: 'Coin Multiplier',
    description: 'Earn 50% more coins for the next 5 completed challenges',
    price: 120,
    type: 'boost',
    icon: '💰',
    effect: '+50% coins for 5 challenges'
  }
];

const Shop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchCoins = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching coins:', error);
      } else {
        setCoins(data.coins || 0);
      }
      setLoading(false);
    };

    fetchCoins();
  }, [user, navigate]);

  const handlePurchase = async (item: ShopItem) => {
    if (coins < item.price) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${item.price - coins} more coins to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ coins: coins - item.price })
        .eq('user_id', user!.id);

      if (error) throw error;

      setCoins(coins - item.price);
      toast({
        title: "Purchase Successful!",
        description: `You bought ${item.name} for ${item.price} coins.`,
      });
    } catch (error) {
      console.error('Error making purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'power-up': return 'bg-gradient-primary';
      case 'boost': return 'bg-gradient-accent';
      case 'cosmetic': return 'bg-gradient-secondary';
      default: return 'bg-gradient-primary';
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">SAT Quest Shop</h1>
              <p className="text-muted-foreground">Enhance your learning experience with powerful items</p>
            </div>
          </div>
          <Card className="bg-gradient-card border-border">
            <CardContent className="flex items-center space-x-2 p-4">
              <Coins className="w-5 h-5 text-secondary" />
              <span className="text-xl font-bold text-secondary">{coins}</span>
            </CardContent>
          </Card>
        </div>

        {/* Shop Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => (
            <Card key={item.id} className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{item.icon}</div>
                  <Badge className={getTypeColor(item.type)}>
                    {item.type.replace('-', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-foreground">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-accent">
                  <Star className="w-4 h-4" />
                  <span>{item.effect}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-secondary" />
                    <span className="text-lg font-bold text-secondary">{item.price}</span>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={coins < item.price}
                    className={coins >= item.price ? getTypeColor(item.type) : ''}
                    variant={coins >= item.price ? 'default' : 'secondary'}
                  >
                    {coins >= item.price ? 'Buy Now' : 'Not Enough Coins'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;