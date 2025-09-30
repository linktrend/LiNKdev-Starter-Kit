'use client';

import { useState } from 'react';
import { Button } from '@starter/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@starter/ui';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

export default function TestRealtimePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testRealtime = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to test real-time functionality' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test Real-Time Functionality</h1>
        <p className="text-muted-foreground mt-2">
          This page allows you to test the real-time capabilities by inserting test data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to insert a test audit log. If real-time is working correctly,
            you should see the new log appear instantly on the Audit Logs page without refreshing.
          </p>
          
          <Button 
            onClick={testRealtime} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Testing...' : 'Insert Test Audit Log'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 rounded-lg border">
              {result.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Success!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
              )}
              
              <div className="mt-2">
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Open the Audit Logs page in another tab</li>
              <li>Click the "Insert Test Audit Log" button above</li>
              <li>Check if the new log appears instantly on the Audit Logs page</li>
              <li>Look for the "Live" indicator in the top-right of the Audit Logs page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
