import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  const projects = [
    { id: 1, name: 'Website Redesign', status: 'Active', progress: 75 },
    { id: 2, name: 'Mobile App', status: 'Planning', progress: 25 },
    { id: 3, name: 'API Integration', status: 'Active', progress: 60 },
    { id: 4, name: 'Design System', status: 'Completed', progress: 100 },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'Active'
                        ? 'bg-green-500/20 text-green-600'
                        : project.status === 'Completed'
                        ? 'bg-blue-500/20 text-blue-600'
                        : 'bg-yellow-500/20 text-yellow-600'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
