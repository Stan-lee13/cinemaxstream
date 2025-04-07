
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Default avatars for users to select from
const DEFAULT_AVATARS = [
  {
    id: 'avatar-1',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix',
    alt: 'Avatar 1'
  },
  {
    id: 'avatar-2',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Abby',
    alt: 'Avatar 2'
  },
  {
    id: 'avatar-3',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Max',
    alt: 'Avatar 3'
  },
  {
    id: 'avatar-4',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Cleo',
    alt: 'Avatar 4'
  },
  {
    id: 'avatar-5',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Midnight',
    alt: 'Avatar 5'
  }
];

interface AvatarSelectionProps {
  selectedAvatarUrl: string | null;
  onAvatarSelect: (url: string) => void;
  className?: string;
}

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedAvatarUrl,
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium">Choose an avatar</h3>
      <div className="flex flex-wrap gap-3 items-center">
        {DEFAULT_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            className={`relative transition-transform ${
              selectedAvatarUrl === avatar.url ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
            }`}
            onClick={() => onAvatarSelect(avatar.url)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar.url} alt={avatar.alt} />
              <AvatarFallback>{avatar.alt.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelection;
