'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Clock, 
  Trash2,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionsActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionsActivityModal({ open, onOpenChange }: SessionsActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock session data - in real app, this would come from props or server state
  const sessions: Session[] = [
    {
      id: '1',
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 120.0.0',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.100',
      lastActive: '2024-01-27 14:30:25',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      deviceType: 'mobile',
      browser: 'Safari 17.2',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.101',
      lastActive: '2024-01-27 12:15:10',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Firefox 121.0',
      location: 'New York, NY',
      ipAddress: '203.0.113.42',
      lastActive: '2024-01-26 09:45:33',
      isCurrent: false,
    },
    {
      id: '4',
      device: 'iPad Air',
      deviceType: 'tablet',
      browser: 'Safari 17.1',
      location: 'Los Angeles, CA',
      ipAddress: '198.51.100.15',
      lastActive: '2024-01-25 16:20:18',
      isCurrent: false,
    },
  ];

  const getDeviceIcon = (deviceType: Session['deviceType']) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (lastActive: string) => {
    const now = new Date();
    const active = new Date(lastActive);
    const diffInMinutes = Math.floor((now.getTime() - active.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual session revocation logic
      console.log('Revoking session:', sessionId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Session revoked successfully');
    } catch (error) {
      console.error('Session revocation error:', error);
      toast.error('Failed to revoke session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutAll = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual sign out all sessions logic
      console.log('Signing out all sessions...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('All sessions signed out successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Sign out all error:', error);
      toast.error('Failed to sign out all sessions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Sessions
          </DialogTitle>
          <DialogDescription>
            Manage your active sessions and sign out devices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(sessions[0].deviceType)}
                  <div>
                    <p className="font-medium">{sessions[0].device}</p>
                    <p className="text-sm text-muted-foreground">
                      {sessions[0].browser} • {sessions[0].location}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Current
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.browser}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{session.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{getTimeAgo(session.lastActive)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {session.ipAddress}
                        </code>
                      </TableCell>
                      <TableCell>
                        {session.isCurrent ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Security Warning */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you see any suspicious activity or unrecognized sessions, revoke them immediately and change your password.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleSignOutAll}
            disabled={isSubmitting}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Signing out...' : 'Sign Out All Devices'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
