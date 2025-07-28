import { useEffect, useState } from 'react';
import { getUserProfile, updateXP, updateMapPosition } from '@/lib/api';

export function useGameProgress() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, []);

  const gainXP = async (amount: number) => {
    const updated = await updateXP(amount);
    setProfile((prev: any) => ({ ...prev, ...updated }));
  };

  const moveTo = async (x: number, y: number, zone: string) => {
    const updated = await updateMapPosition(x, y, zone);
    setProfile((prev: any) => ({ ...prev, map_position: updated }));
  };

  return { profile, gainXP, moveTo, loading };
}
