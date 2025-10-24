'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type UserPresence } from '@/lib/collaboration/presence';

interface ActiveCollaboratorsProps {
  activeUsers: UserPresence[];
  isConnected: boolean;
}

export function ActiveCollaborators({
  activeUsers,
  isConnected,
}: ActiveCollaboratorsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-muted-foreground text-xs">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Active collaborators */}
      {activeUsers.length > 0 && (
        <>
          <div className="bg-border h-4 w-px" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'}
              editing:
            </span>
            <div className="flex -space-x-2">
              <TooltipProvider>
                {activeUsers.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="border-background ring-background h-6 w-6 border ring-2">
                        <AvatarFallback
                          style={{ backgroundColor: user.color }}
                          className="text-xs font-bold text-white"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage src={`/avatar/${user.id}`} />
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
