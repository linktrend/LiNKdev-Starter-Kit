'use client';

/**
 * SQL Editor Component
 * Simple textarea-based SQL editor with syntax highlighting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Play, History, Trash2, Clock } from 'lucide-react';
import { useQueryHistory, type QueryHistoryItem } from '@/hooks/useQueryHistory';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  disabled?: boolean;
}

export function SqlEditor({
  value,
  onChange,
  onExecute,
  isExecuting,
  disabled = false,
}: SqlEditorProps) {
  const { history, clearHistory } = useQueryHistory();
  const [showHistory, setShowHistory] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Execute on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isExecuting && !disabled && value.trim()) {
        onExecute();
      }
    }
  };

  const loadQueryFromHistory = (item: QueryHistoryItem) => {
    onChange(item.query);
    setShowHistory(false);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT * FROM users LIMIT 10;"
          className="font-mono min-h-[200px] text-sm resize-y"
          disabled={disabled || isExecuting}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Write your SQL query here. Press{' '}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded border">⌘/Ctrl + Enter</kbd> to
            execute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <DropdownMenu open={showHistory} onOpenChange={setShowHistory}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <History className="h-4 w-4 mr-2" />
                  History ({history.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[400px] max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Query History</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                    }}
                    className="h-6 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {history.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => loadQueryFromHistory(item)}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          item.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {item.status === 'success'
                          ? `${item.rowCount} rows`
                          : 'Error'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                    <code className="text-xs font-mono line-clamp-2 w-full text-left">
                      {item.query}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.executedAt).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={onExecute}
            disabled={!value.trim() || isExecuting || disabled}
            className="w-full sm:w-auto"
          >
            {isExecuting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Query
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
