import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, School, Edit3, Trash2, Share2 } from "lucide-react";
import { getCurrentUser, getUserEssays, Essay } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UsageIndicator from "@/components/UsageIndicator";

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
      <div className="pt-20 sm:pt-24 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">My Essays</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Welcome back, {user?.user_metadata?.full_name || user?.email}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/subscription-management')} 
                    className="gap-2 w-full sm:w-auto touch-manipulation"
                  >
                    Manage Billing
                  </Button>
                  <Button 
                    onClick={() => navigate('/essay-builder')} 
                    className="gap-2 w-full sm:w-auto touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                    New Essay
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <UsageIndicator />
            </div>
          </div>

          <div className="lg:col-span-3">
            {essays.length === 0 ? (
              <Card className="text-center py-12 sm:py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No essays yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
                    Create your first college application essay to get started
                  </p>
                  <Button 
                    onClick={() => navigate('/essay-builder')}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Essay
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {essays.map((essay) => (
                  <Card key={essay.id} className="hover:shadow-card transition-shadow touch-manipulation">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base sm:text-lg line-clamp-2 mb-2">
                            {essay.school}
                          </CardTitle>
                          <CardDescription className="line-clamp-3 text-sm">
                            {essay.prompt}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getWordCount(essay.generated_essay)} words
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatDate(essay.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <School className="h-3 w-3 sm:h-4 sm:w-4" />
                          Essay
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 touch-manipulation"
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
                          className="touch-manipulation"
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
      <Footer />
    </div>
  );
}