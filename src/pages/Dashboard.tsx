import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, School, Edit3, Trash2, Share2 } from "lucide-react";
import { getCurrentUser, getUserEssays, Essay } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";

export default function Dashboard() {
  const navigate = useNavigate();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }

      setUser(currentUser);
      const { data: essaysData, error } = await getUserEssays(currentUser.id);
      
      if (error) {
        toast.error("Failed to load essays");
      } else {
        setEssays(essaysData || []);
      }
    } catch (error) {
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Essays</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <Button onClick={() => navigate('/essay-builder')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Essay
            </Button>
          </div>

          {essays.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No essays yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first college application essay to get started
                </p>
                <Button onClick={() => navigate('/essay-builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Essay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement sharing
                    toast.success("Sharing feature coming soon!");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {essays.map((essay) => (
                <Card key={essay.id} className="hover:shadow-card transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {essay.school}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {essay.prompt}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {getWordCount(essay.generated_essay)} words
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(essay.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <School className="h-4 w-4" />
                        Essay
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate('/essay-result', { 
                          state: { 
                            school: essay.school,
                            prompt: essay.prompt,
                            responses: essay.responses,
                            savedEssay: essay.generated_essay,
                            essayId: essay.id
                          }
                        })}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement sharing
                          toast.success("Sharing feature coming soon!");
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}