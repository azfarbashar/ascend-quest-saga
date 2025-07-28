import { supabase } from './supabaseClient';

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateXP(amount: number) {
  const profile = await getUserProfile();
  const newXP = profile.experience + amount;
  const newLevel = Math.floor(1 + Math.sqrt(newXP / 100));

  const { error } = await supabase
    .from('profiles')
    .update({ experience: newXP, level: newLevel })
    .eq('user_id', profile.user_id);

  if (error) throw error;
  return { experience: newXP, level: newLevel };
}

export async function updateMapPosition(x: number, y: number, zone: string) {
  const profile = await getUserProfile();

  const { error } = await supabase
    .from('profiles')
    .update({ map_position: { x, y, zone } })
    .eq('user_id', profile.user_id);

  if (error) throw error;
  return { x, y, zone };
}
