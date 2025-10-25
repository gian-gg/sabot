'use client';

import { useState, useEffect } from 'react';
import CollaborativeEditor from '@/components/shared/collaborative-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const randomColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
];

function generateRandomName() {
  const adjectives = ['Happy', 'Smart', 'Quick', 'Brave', 'Clever', 'Swift'];
  const nouns = ['Panda', 'Eagle', 'Fox', 'Wolf', 'Tiger', 'Dolphin'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

export default function CollabTestPage() {
  const [documentId, setDocumentId] = useState('sabot-test-doc');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');
  const [mounted, setMounted] = useState(false);

  // Initialize random values on client side only
  useEffect(() => {
    setUserName(generateRandomName());
    setUserColor(randomColors[Math.floor(Math.random() * randomColors.length)]);
  }, []);

  const handleJoinRoom = () => {
    setMounted(true);
  };

  const handleNewRoom = () => {
    const randomId = `doc-${Math.random().toString(36).substring(2, 9)}`;
    setDocumentId(randomId);
    setMounted(true);
  };

  const handleLeaveRoom = () => {
    setMounted(false);
  };

  if (!mounted) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Collaborative Editor Test</CardTitle>
            <CardDescription>
              Join an existing document or create a new one to test real-time
              collaboration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentId">Document ID</Label>
              <Input
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Enter document ID"
              />
              <p className="text-muted-foreground text-xs">
                Use the same ID across multiple tabs to collaborate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <div className="flex gap-2">
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setUserName(generateRandomName())}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="size-4 rounded-full border-2"
                  style={{ backgroundColor: userColor }}
                />
                <p className="text-muted-foreground text-xs">
                  Your cursor color
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleJoinRoom} className="flex-1">
                Join Document
              </Button>
              <Button
                onClick={handleNewRoom}
                variant="outline"
                className="flex-1"
              >
                Create New Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collaborative Editor Test</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Editing as{' '}
            <span className="font-medium" style={{ color: userColor }}>
              {userName}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={handleLeaveRoom}>
          Leave Document
        </Button>
      </div>

      <CollaborativeEditor
        documentId={documentId}
        userName={userName}
        userColor={userColor}
      />
    </div>
  );
}
