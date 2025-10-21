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
    try {
      this.channel = this.supabase.channel(`agreement:${this.name}`);

      this.channel.on(
        'broadcast',
        { event: 'update' },
        ({ payload }: { payload: { update: Uint8Array } }) => {
          if (payload.update) {
            Y.applyUpdate(this.ydoc, payload.update);
          }
        }
      );

      this.channel.on('presence', { event: 'sync' }, () => {
        this.syncPresence();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.channel.on(
        'presence',
        { event: 'join' },
        ({ newPresences }: any) => {
          if (this.awareness && newPresences) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newPresences.forEach((presence: any) => {
              if (
                presence.user?.id &&
                presence.user?.id !== this.getCurrentUserId()
              ) {
                this.awareness.setLocalState({ ...presence.user });
              }
            });
          }
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.channel.on('presence', { event: 'leave' }, ({}: any) => {
        // Handle user leaving
      });

      const updateHandler = (update: Uint8Array) => {
        if (this.channel) {
          this.channel.send({
            type: 'broadcast',
            event: 'update',
            payload: { update },
          });
        }
      };

      this.ydoc.on('update', updateHandler);

      await this.channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.isReady = true;
          this.broadcastPresence();
        }
      });
    } catch (error) {
      console.error('Error connecting SupabaseProvider:', error);
    }
  }

  disconnect(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private async broadcastPresence(): Promise<void> {
    const user = await this.getCurrentUser();
    if (user && this.channel) {
      await this.channel.track({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Anonymous',
          cursor: null,
        },
      });
    }
  }

  private syncPresence(): void {
    if (!this.channel) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presences = this.channel.presenceState() as any;
    if (this.awareness) {
      Object.values(presences).forEach((presenceList: unknown) => {
        if (Array.isArray(presenceList)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presenceList.forEach((p: any) => {
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
