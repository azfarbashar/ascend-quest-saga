import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Coins, Star, Settings } from "lucide-react";
import GameHUD from "@/components/GameHUD";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  selected_character: string | null;
  level: number;
  experience: number;
  coins: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

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
                <Badge variant="secondary">{profile.selected_character}</Badge>
              ) : (
                <Button size="sm" onClick={() => navigate("/")}>
                  Choose Character
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game HUD Integration */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Adventure Map</CardTitle>
              <CardDescription>Track your progress and explore the world</CardDescription>
            </CardHeader>
            <CardContent>
              <GameHUD />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Story Quests</CardTitle>
              <CardDescription>Continue your adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-primary">Start Quest</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Battle Mode</CardTitle>
              <CardDescription>Challenge powerful bosses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-accent">Enter Battle</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Daily Challenge</CardTitle>
              <CardDescription>Earn bonus rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-secondary">Accept Challenge</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Shop</CardTitle>
              <CardDescription>Buy items and upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Browse Shop</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;