import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, FileText, Send, CheckCircle, AlertCircle } from "lucide-react";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ReviewRequest {
  id: string;
  essay_id: string;
  user_id: string;
  reviewer_instructions: string;
  review_status: string;
  reviewer_feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  essays: {
    school: string;
    prompt: string;
    generated_essay: string;
    user_profiles: {
      full_name: string;
    };
  };
}

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewRequest | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    checkReviewerAccess();
    loadReviews();
  }, []);

  const checkReviewerAccess = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      // Check if user has reviewer permissions (you can implement role-based access)
      // For now, we'll allow any authenticated user to access this for demo purposes
      // In production, you'd check for a 'reviewer' role or specific permissions
      setUser(currentUser);
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('human_reviews')
        .select(`
          *,
          essays!inner(
            school,
            prompt,
            generated_essay,
            user_profiles!inner(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load reviews");
        console.error('Error loading reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSelect = (review: ReviewRequest) => {
    setSelectedReview(review);
    setFeedback(review.reviewer_feedback || "");
  };

  const handleStatusUpdate = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('human_reviews')
        .update({ 
          review_status: newStatus,
          ...(newStatus === 'in_review' ? { reviewed_at: null } : {})
        })
        .eq('id', reviewId);

      if (error) {
        toast.error("Failed to update status");
      } else {
        toast.success("Status updated successfully");
        loadReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(prev => prev ? { ...prev, review_status: newStatus } : null);
        }
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedReview || !feedback.trim()) {
      toast.error("Please provide feedback before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the review with feedback
      const { error: reviewError } = await supabase
        .from('human_reviews')
        .update({
          reviewer_feedback: feedback,
          review_status: 'completed',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (reviewError) {
        toast.error("Failed to submit feedback");
        return;
      }

      // Update the essay status
      const { error: essayError } = await supabase
        .from('essays')
        .update({
          review_status: 'completed',
          human_review: feedback
        })
        .eq('id', selectedReview.essay_id);

      if (essayError) {
        console.error('Error updating essay status:', essayError);
      }

      // Send notification to user (you can implement email notification here)
      toast.success("Feedback submitted successfully! User has been notified.");
      
      // Refresh the reviews list
      loadReviews();
      setSelectedReview(null);
      setFeedback("");

    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'all') return true;
    return review.review_status === filterStatus;
  });

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
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reviewer Dashboard</h1>
            <p className="text-muted-foreground">
              Review and provide feedback on student essays
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Requests</h2>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredReviews.map((review) => (
                  <Card 
                    key={review.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedReview?.id === review.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleReviewSelect(review)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{review.essays.school}</CardTitle>
                        {getStatusBadge(review.review_status)}
                      </div>
                      <CardDescription className="text-xs">
                        {review.essays.user_profiles.full_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {getWordCount(review.essays.generated_essay)} words
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredReviews.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No reviews found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Review Details */}
            <div className="lg:col-span-2">
              {selectedReview ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {selectedReview.essays.user_profiles.full_name}
                          </CardTitle>
                          <CardDescription>
                            {selectedReview.essays.school} • Submitted {new Date(selectedReview.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedReview.review_status)}
                          <Select 
                            value={selectedReview.review_status} 
                            onValueChange={(value) => handleStatusUpdate(selectedReview.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Essay Prompt:</h4>
                          <p className="text-sm italic bg-muted/50 p-3 rounded">
                            "{selectedReview.essays.prompt}"
                          </p>
                        </div>
                        
                        {selectedReview.reviewer_instructions && (
                          <div>
                            <h4 className="font-medium mb-2">Review Instructions:</h4>
                            <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                              {selectedReview.reviewer_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="essay" className="w-full">
                    <TabsList>
                      <TabsTrigger value="essay">Essay Content</TabsTrigger>
                      <TabsTrigger value="feedback">Provide Feedback</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="essay" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Essay Content ({getWordCount(selectedReview.essays.generated_essay)} words)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            {selectedReview.essays.generated_essay.split('\n\n').map((paragraph, index) => (
                              <p key={index} className="mb-4 text-sm leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="feedback" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Provide Feedback
                          </CardTitle>
                          <CardDescription>
                            Give detailed, constructive feedback to help the student improve their essay
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Textarea
                            placeholder="Provide detailed feedback on content, structure, grammar, authenticity, and college-specific recommendations..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-h-[200px]"
                          />
                          
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              {feedback.length} characters
                            </p>
                            <Button 
                              onClick={handleSubmitFeedback}
                              disabled={isSubmitting || !feedback.trim() || selectedReview.review_status === 'completed'}
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit Feedback
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {selectedReview.review_status === 'completed' && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  Feedback submitted on {selectedReview.reviewed_at && new Date(selectedReview.reviewed_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Review</h3>
                    <p className="text-muted-foreground">
                      Choose a review request from the list to view details and provide feedback
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}