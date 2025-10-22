/* eslint-disable */
// @ts-nocheck

import type { EscrowEvent } from '@/types/escrow';
import {
  CheckCircle2,
  UserPlus,
  Clock,
  Shield,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EscrowTimelineProps {
  events: EscrowEvent[];
}

/**
 * Returns the appropriate icon for an event type
 */
function getEventIcon(eventType: EscrowEvent['event_type']) {
  const iconClass = 'h-4 w-4';

  switch (eventType) {
    case 'created':
      return <FileText className={iconClass} />;
    case 'participant_joined':
      return <UserPlus className={iconClass} />;
    case 'status_changed':
      return <Clock className={iconClass} />;
    case 'initiator_confirmed':
    case 'participant_confirmed':
      return <CheckCircle2 className={iconClass} />;
    case 'arbiter_requested':
    case 'arbiter_assigned':
      return <Shield className={iconClass} />;
    case 'arbiter_decision':
      return <Shield className={iconClass} />;
    case 'completed':
      return <CheckCircle2 className={iconClass} />;
    case 'cancelled':
      return <XCircle className={iconClass} />;
    case 'disputed':
      return <AlertTriangle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
}

/**
 * Returns human-readable description for an event
 */
function getEventDescription(event: EscrowEvent): string {
  switch (event.event_type) {
    case 'created':
      return 'Escrow created';
    case 'participant_joined':
      return 'Participant joined the escrow';
    case 'status_changed':
      return 'Escrow status changed';
    case 'initiator_confirmed':
      return 'Initiator confirmed completion';
    case 'participant_confirmed':
      return 'Participant confirmed completion';
    case 'arbiter_requested':
      return 'Arbiter requested for dispute resolution';
    case 'arbiter_assigned':
      return 'Arbiter assigned to review the case';
    case 'arbiter_decision':
      return `Arbiter decision: ${event.details?.decision || 'pending'}`;
    case 'completed':
      return 'Escrow completed successfully';
    case 'cancelled':
      return 'Escrow cancelled';
    case 'disputed':
      return 'Dispute raised';
    default:
      return 'Event occurred';
  }
}

/**
 * Returns color classes for an event type
 */
function getEventColor(eventType: EscrowEvent['event_type']): string {
  switch (eventType) {
    case 'completed':
      return 'text-green-600 bg-green-100 dark:bg-green-950';
    case 'initiator_confirmed':
    case 'participant_confirmed':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-950';
    case 'arbiter_requested':
    case 'arbiter_assigned':
    case 'disputed':
      return 'text-amber-600 bg-amber-100 dark:bg-amber-950';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-950';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-950';
  }
}

/**
 * EscrowTimeline Component
 *
 * Displays a chronological timeline of events for an escrow transaction.
 * Shows icons, descriptions, and timestamps for each event.
 *
 * @param events - Array of escrow events to display
 */
export function EscrowTimeline({ events }: EscrowTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">No events yet</p>
      </div>
    );
  }

  // Sort events by timestamp (newest first for display)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4" />
        Event Timeline
      </h3>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="bg-border absolute top-0 left-4 h-full w-px" />

        {/* Events */}
        {sortedEvents.map((event, index) => {
          const isLast = index === sortedEvents.length - 1;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getEventColor(event.event_type)}`}
              >
                {getEventIcon(event.event_type)}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${!isLast ? 'border-b' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {getEventDescription(event)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Event details if available */}
                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="bg-muted/50 mt-2 rounded-md p-2">
                    {event.details.notes && (
                      <p className="text-muted-foreground text-xs">
                        {String(event.details.notes)}
                      </p>
                    )}
                    {event.details.reason && (
                      <p className="text-xs">
                        <span className="font-medium">Reason:</span>{' '}
                        {String(event.details.reason)}
                      </p>
                    )}
                    {event.details.decision && (
                      <p className="text-xs">
                        <span className="font-medium">Decision:</span>{' '}
                        {String(event.details.decision)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
