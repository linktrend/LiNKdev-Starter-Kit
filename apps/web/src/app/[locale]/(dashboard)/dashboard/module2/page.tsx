'use client';

import { BookOpen, Clock, CheckCircle, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Module2Page() {
  return (
    <div className="space-y-6">

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/10</div>
            <p className="text-xs text-muted-foreground">
              Ready to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4h 30m</div>
            <p className="text-xs text-muted-foreground">
              Total duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prerequisites</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">
              Module 1 complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Advanced Concepts Overview', status: 'available', duration: '20 min' },
                { title: 'Complex Problem Solving', status: 'locked', duration: '25 min' },
                { title: 'Real-world Applications', status: 'locked', duration: '30 min' },
                { title: 'Best Practices', status: 'locked', duration: '25 min' },
                { title: 'Common Pitfalls', status: 'locked', duration: '20 min' },
                { title: 'Performance Optimization', status: 'locked', duration: '35 min' },
                { title: 'Integration Patterns', status: 'locked', duration: '30 min' },
                { title: 'Testing Strategies', status: 'locked', duration: '25 min' },
                { title: 'Project Workshop', status: 'locked', duration: '45 min' },
                { title: 'Module Assessment', status: 'locked', duration: '60 min' },
              ].map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-700' :
                      lesson.status === 'available' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {lesson.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={lesson.status === 'available' ? 'default' : 'outline'}
                    disabled={lesson.status === 'locked'}
                  >
                    {lesson.status === 'completed' ? 'Review' : 
                     lesson.status === 'available' ? 'Start' : 'Locked'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Module 2 Workbook</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Interactive exercises and practice problems for hands-on learning.
                </p>
                <Button size="sm" variant="outline">Open Workbook</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Video Tutorials</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Step-by-step video guides for complex concepts.
                </p>
                <Button size="sm" variant="outline">Watch Videos</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Code Examples</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Downloadable code samples and templates.
                </p>
                <Button size="sm" variant="outline">Download Code</Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Peer Review</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get feedback from other learners on your projects.
                </p>
                <Button size="sm" variant="outline">Submit for Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Complete Module 1</p>
                <p className="text-sm text-muted-foreground">Foundation concepts and basics</p>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Start Module 2</p>
                <p className="text-sm text-muted-foreground">Intermediate concepts and applications</p>
              </div>
              <Badge variant="default">Current</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Begin Module 3</p>
                <p className="text-sm text-muted-foreground">Advanced topics and specialization</p>
              </div>
              <Badge variant="outline">Locked</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
