'use client';

import { BookOpen, Clock, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Module1Page() {
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
            <div className="text-2xl font-bold">3/8</div>
            <p className="text-xs text-muted-foreground">
              37% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 15m</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Group</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active members
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
                { title: 'Introduction to Concepts', status: 'completed', duration: '15 min' },
                { title: 'Basic Principles', status: 'completed', duration: '20 min' },
                { title: 'Practical Examples', status: 'completed', duration: '25 min' },
                { title: 'Advanced Techniques', status: 'current', duration: '30 min' },
                { title: 'Case Studies', status: 'locked', duration: '35 min' },
                { title: 'Final Assessment', status: 'locked', duration: '45 min' },
              ].map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-700' :
                      lesson.status === 'current' ? 'bg-blue-100 text-blue-700' :
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
                    variant={lesson.status === 'current' ? 'default' : 'outline'}
                    disabled={lesson.status === 'locked'}
                  >
                    {lesson.status === 'completed' ? 'Review' : 
                     lesson.status === 'current' ? 'Continue' : 'Locked'}
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
                <h4 className="font-medium mb-2">Module 1 Study Guide</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guide covering all key concepts and examples.
                </p>
                <Button size="sm" variant="outline">Download PDF</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Practice Exercises</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Hands-on exercises to reinforce your learning.
                </p>
                <Button size="sm" variant="outline">Start Practice</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Discussion Forum</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other learners and ask questions.
                </p>
                <Button size="sm" variant="outline">Join Discussion</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Completed &quot;Practical Examples&quot; lesson</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Posted question in discussion forum</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Downloaded Module 1 Study Guide</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
