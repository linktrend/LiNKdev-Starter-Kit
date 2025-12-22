'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, UserOrgCell } from '@/components/ui/table-utils';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
import { TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { Search, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { getUserDisplay } from '@/utils/userDisplay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  factorId: string | null;
  aal: string | null;
  isActive: boolean;
}

interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  currentUserId: string;
  onRevokeSession: (sessionId: string, userId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ActiveSessionsList({
  sessions,
  currentUserId,
  onRevokeSession,
  onRefresh,
  isLoading = false,
}: ActiveSessionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const filteredSessions = sessions.filter((session) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const email = session.userEmail.toLowerCase();
      const name = session.userName.toLowerCase();
      return email.includes(query) || name.includes(query);
    }
    return true;
  });

  // Group sessions by user
  const sessionsByUser = filteredSessions.reduce((acc, session) => {
    if (!acc[session.userId]) {
      acc[session.userId] = [];
    }
    acc[session.userId].push(session);
    return acc;
  }, {} as Record<string, ActiveSession[]>);

  const handleRevokeClick = (session: ActiveSession) => {
    setSessionToRevoke(session);
  };

  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return;

    setIsRevoking(true);
    try {
      await onRevokeSession(sessionToRevoke.id, sessionToRevoke.userId);
      setSessionToRevoke(null);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className={getBadgeClasses('security.active')}>Active</Badge>
    ) : (
      <Badge className={getBadgeClasses('security.inactive')}>Inactive</Badge>
    );
  };

  const getAALBadge = (aal: string | null) => {
    if (!aal) return null;
    
    const variant = aal === 'aal2' ? 'default' : 'outline';
    const label = aal === 'aal2' ? '2FA' : 'Password';
    
    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TableContainer id="active-sessions-table" height="lg">
          <Table className="min-w-[1000px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
            <TableHeader>
              <TableRow>
                <TableHeadText className="min-w-0 max-w-[25%]">User</TableHeadText>
                <TableHeadText className="w-32">Auth Method</TableHeadText>
                <TableHeadText className="w-40">Created</TableHeadText>
                <TableHeadText className="w-40">Last Activity</TableHeadText>
                <TableHeadStatus className="w-28">Status</TableHeadStatus>
                <TableHeadAction className="w-32">Actions</TableHeadAction>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading sessions...
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No active sessions found
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(sessionsByUser).map(([userId, userSessions]) => {
                  const firstSession = userSessions[0];
                  const userDisplay = getUserDisplay({
                    name: firstSession.userName,
                    email: firstSession.userEmail,
                  });
                  const isSelf = userId === currentUserId;

                  return userSessions.map((session, index) => (
                    <TableRow key={session.id}>
                      {index === 0 && (
                        <TableCellText className="min-w-0 max-w-[25%]" rowSpan={userSessions.length}>
                          <div className="flex items-center gap-2">
                            <UserOrgCell
                              primary={userDisplay.primary}
                              secondary={userDisplay.secondary}
                            />
                            {isSelf && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          {userSessions.length > 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {userSessions.length} active sessions
                            </div>
                          )}
                        </TableCellText>
                      )}
                      <TableCellText className="w-32">
                        {getAALBadge(session.aal)}
                      </TableCellText>
                      <TableCellText className="w-40">
                        <DateTimeCell date={new Date(session.createdAt)} />
                      </TableCellText>
                      <TableCellText className="w-40">
                        <DateTimeCell date={new Date(session.updatedAt)} />
                      </TableCellText>
                      <TableCellStatus className="w-28">
                        {getStatusBadge(session.isActive)}
                      </TableCellStatus>
                      <TableCellAction className="w-32">
                        <ActionIconsCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeClick(session)}
                            title="Revoke session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ActionIconsCell>
                      </TableCellAction>
                    </TableRow>
                  ));
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Session Management</p>
              <p className="text-muted-foreground">
                Active sessions represent logged-in users. Revoking a session will immediately log out the user from that device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToRevoke && (
                <>
                  This will immediately log out <strong>{sessionToRevoke.userName}</strong> from this session.
                  <br />
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Session created: {new Date(sessionToRevoke.createdAt).toLocaleString()}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? 'Revoking...' : 'Revoke Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
