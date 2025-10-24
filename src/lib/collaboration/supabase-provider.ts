'use client';

import * as Y from 'yjs';
import { createClient } from '@/lib/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface SupabaseProviderConfig {
  ydoc: Y.Doc;
  name: string;
  awareness?: Any;
}

/**
 * Supabase Realtime provider for Yjs
 * Syncs document changes through Supabase Realtime subscriptions
 */
export class SupabaseProvider {
  private ydoc: Y.Doc;
  private name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private channel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private awareness: any;
  private isReady = false;

  constructor(config: SupabaseProviderConfig) {
    this.ydoc = config.ydoc;
    this.name = config.name;
    this.awareness = config.awareness;
    this.supabase = createClient();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add timeout to prevent hanging indefinitely
      const timeoutId = setTimeout(() => {
        console.error(
          '[Provider] ❌ CONNECTION TIMEOUT - Promise never resolved after 10 seconds'
        );
        reject(
          new Error('Connection timeout - Provider took too long to connect')
        );
      }, 10000);

      const resolveWithCleanup = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      const rejectWithCleanup = (error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      };

      try {
        const channelName = `agreement:${this.name}`;
        console.log('[Provider] Creating channel:', channelName);
        this.channel = this.supabase.channel(channelName);

        console.log('[Provider] Setting up broadcast listener...');
        this.channel.on(
          'broadcast',
          { event: 'update' },
          ({ payload }: { payload: { update: Uint8Array } }) => {
            console.log(
              '[Provider] Received update from broadcast, applying...'
            );
            if (payload.update) {
              Y.applyUpdate(this.ydoc, payload.update);
            }
          }
        );

        console.log('[Provider] Setting up presence sync listener...');
        this.channel.on('presence', { event: 'sync' }, () => {
          console.log('[Provider] Presence sync event');
          this.syncPresence();
        });

        console.log('[Provider] Setting up presence join listener...');
        this.channel.on(
          'presence',
          { event: 'join' },
          ({ newPresences }: { newPresences?: unknown[] }) => {
            console.log('[Provider] New user joined:', newPresences?.length);
            if (this.awareness && newPresences) {
              newPresences.forEach((presence: unknown) => {
                const p = presence as { user?: { id: string; name?: string } };
                console.log('[Provider] Processing presence:', p.user?.name);
                if (p.user?.id && p.user?.id !== this.getCurrentUserId()) {
                  this.awareness.setLocalState({ ...p.user });
                }
              });
            }
          }
        );

        console.log('[Provider] Setting up presence leave listener...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.channel.on('presence', { event: 'leave' }, (data: any) => {
          console.log('[Provider] User left:', data);
        });

        console.log('[Provider] Setting up Y.Doc update listener...');
        const updateHandler = (update: Uint8Array) => {
          console.log(
            '[Provider] 📝 Y.Doc UPDATE FIRED -',
            update.length,
            'bytes'
          );
          if (this.channel) {
            console.log('[Provider] Sending to channel...');
            this.channel.send({
              type: 'broadcast',
              event: 'update',
              payload: { update },
            });
          } else {
            console.warn('[Provider] ⚠️ No channel to send update');
          }
        };

        this.ydoc.on('update', updateHandler);
        console.log('[Provider] ✅ Y.Doc listener attached');

        console.log('[Provider] Subscribing to channel...');

        // Subscribe to channel (don't wait for status callback - it may not fire)
        this.channel.subscribe((status: string) => {
          console.log('[Provider] Channel status:', status);
        });

        console.log('[Provider] ✅ Channel subscribed');
        this.isReady = true;

        // Broadcast presence asynchronously
        this.broadcastPresence()
          .then(() => {
            console.log('[Provider] ✅ Presence broadcast complete');
          })
          .catch((err) => {
            console.error('[Provider] ⚠️ Error broadcasting presence:', err);
          });

        console.log('[Provider] ✅ RESOLVING PROMISE - CONNECTION COMPLETE');
        resolveWithCleanup();
      } catch (error) {
        console.error(
          '[Provider] ❌ Error connecting SupabaseProvider:',
          error
        );
        rejectWithCleanup(error as Error);
      }
    });
  }

  disconnect(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private async broadcastPresence(): Promise<void> {
    console.log('[Provider] Broadcasting presence...');
    const user = await this.getCurrentUser();
    console.log('[Provider] Current user for presence:', user?.email);
    if (user && this.channel) {
      const presenceData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Anonymous',
          cursor: null,
        },
      };
      console.log('[Provider] Tracking presence:', presenceData.user.name);
      await this.channel.track(presenceData);
      console.log('[Provider] ✅ Presence tracked');
    } else {
      console.warn(
        '[Provider] ⚠️ Could not broadcast presence - no user or channel'
      );
    }
  }

  private syncPresence(): void {
    console.log('[Provider] Syncing presence...');
    if (!this.channel) {
      console.warn('[Provider] ⚠️ No channel for presence sync');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presences = this.channel.presenceState() as any;
    console.log(
      '[Provider] Presence state keys:',
      Object.keys(presences).length
    );

    if (this.awareness) {
      Object.values(presences).forEach((presenceList: unknown) => {
        if (Array.isArray(presenceList)) {
          console.log(
            '[Provider] Processing',
            presenceList.length,
            'presences'
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presenceList.forEach((p: any) => {
            console.log(
              '[Provider] Syncing user:',
              p.user?.name,
              'id:',
              p.user?.id
            );
            if (p.user?.id !== this.getCurrentUserId()) {
              this.awareness.setLocalState(p.user);
            }
          });
        }
      });
    }
  }

  private getCurrentUserId(): string | null {
    try {
      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('sb-token')
          : null;
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.sub;
      }
    } catch {
      return null;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getCurrentUser(): Promise<any> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }
}
