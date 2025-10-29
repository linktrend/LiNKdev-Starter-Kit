'use client';

import { BookOpen, Clock, CheckCircle, Lock, Star, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Module3Page() {
  return (
    <div className="space-y-6">

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prerequisites</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1/2</div>
            <p className="text-xs text-muted-foreground">
              Complete Module 2
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6h 15m</div>
            <p className="text-xs text-muted-foreground">
              Total duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Advanced</div>
            <p className="text-xs text-muted-foreground">
              Expert level
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
                { title: 'Advanced Architecture Patterns', status: 'locked', duration: '45 min' },
                { title: 'Performance Optimization', status: 'locked', duration: '50 min' },
                { title: 'Security Best Practices', status: 'locked', duration: '40 min' },
                { title: 'Scalability Solutions', status: 'locked', duration: '55 min' },
                { title: 'Integration Strategies', status: 'locked', duration: '35 min' },
                { title: 'Monitoring & Analytics', status: 'locked', duration: '30 min' },
                { title: 'DevOps & Deployment', status: 'locked', duration: '40 min' },
                { title: 'Troubleshooting & Debugging', status: 'locked', duration: '35 min' },
                { title: 'Capstone Project', status: 'locked', duration: '90 min' },
                { title: 'Final Certification', status: 'locked', duration: '120 min' },
              ].map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium">
                      <Lock className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                  >
                    Locked
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
              <div className="p-4 border rounded-lg opacity-60">
                <h4 className="font-medium mb-2">Advanced Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guides for expert-level concepts.
                </p>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>
              
              <div className="p-4 border rounded-lg opacity-60">
                <h4 className="font-medium mb-2">Expert Workshops</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Live sessions with industry experts.
                </p>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>
              
              <div className="p-4 border rounded-lg opacity-60">
                <h4 className="font-medium mb-2">Capstone Project</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Build a real-world application using all concepts.
                </p>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>

              <div className="p-4 border rounded-lg opacity-60">
                <h4 className="font-medium mb-2">Certification Exam</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Earn your expert-level certification.
                </p>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unlock Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Unlock Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-medium">Complete Module 1</p>
                <p className="text-sm text-muted-foreground">Foundation concepts and basics</p>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-medium">
                <Lock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Complete Module 2</p>
                <p className="text-sm text-muted-foreground">Intermediate concepts and applications</p>
              </div>
              <Badge variant="outline">Required</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-medium">
                <Lock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Pass Module 2 Assessment</p>
                <p className="text-sm text-muted-foreground">Score 80% or higher on final exam</p>
              </div>
              <Badge variant="outline">Required</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Focus on completing Module 2 with a strong understanding of the concepts. 
              Module 3 builds heavily on the advanced topics covered in Module 2.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
