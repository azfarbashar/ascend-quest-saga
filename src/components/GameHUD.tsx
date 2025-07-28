import React from 'react';
import { useGameProgress } from '@/hooks/useGameProgress';

export default function GameHUD() {
  const { profile, gainXP, moveTo, loading } = useGameProgress();

  if (loading) return <div className="text-white">Loading...</div>;
  if (!profile) return <div className="text-red-500">User not found</div>;

  const { level, experience, map_position } = profile;

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl shadow-xl max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">🧠 Player Stats</h1>
      <p>Level: {level}</p>
      <p>XP: {experience}</p>
      <p>Map Position: ({map_position?.x}, {map_position?.y}) - {map_position?.zone}</p>

      <div className="flex flex-col gap-2 mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2"
          onClick={() => gainXP(100)}
        >
          Gain 100 XP
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 rounded px-4 py-2"
          onClick={() => moveTo(2, 5, 'forest')}
        >
          Move to Forest (2, 5)
        </button>
      </div>
    </div>
  );
}
