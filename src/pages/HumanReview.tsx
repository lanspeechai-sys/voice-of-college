import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getCurrentUser, getUserEssays, Essay, checkUsageLimit, incrementUserUsage, trackUsage, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/UpgradeModal";

export default function HumanReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [selectedEssay, setSelectedEssay] = useState<string>("");
  const [reviewInstructions, setReviewInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCheck, setUsageCheck] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Check if essay was preselected from EssayResult page
    if (location.state?.preselectedEssay) {
      setSelectedEssay(location.state.preselectedEssay);
    }
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
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
      toast.error("Failed to load data");
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedEssay || !reviewInstructions.trim()) {
      toast.error("Please select an essay and provide review instructions");
      return;
    }

    // Check usage limits before submitting
    const limitCheck = await checkUsageLimit(user.id, 'human_review');
    if (!limitCheck.canProceed) {
      setUsageCheck(limitCheck);
      setShowUpgradeModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert into human_reviews table
      const { data: reviewData, error: reviewError } = await supabase
        .from('human_reviews')
        .insert({
          essay_id: selectedEssay,
          user_id: user.id,
          reviewer_instructions: reviewInstructions,
          review_status: 'pending'
        })
        .select()
        .single();

      if (reviewError) {
        console.error('Error submitting review:', reviewError);
        toast.error("Failed to submit essay for review");
        return;
      }

      // Update essay status
      const { error: essayError } = await supabase
        .from('essays')
        .update({
          review_status: 'pending',
          review_requested_at: new Date().toISOString()
        })
        .eq('id', selectedEssay);

      if (essayError) {
        console.error('Error updating essay status:', essayError);
        // Don't return here as the review was already submitted
      }

      // Track usage and increment counter
      await trackUsage(user.id, 'human_review_requested', selectedEssay);
      await incrementUserUsage(user.id, 'human_reviews_used');
      
      toast.success("Essay submitted for human review! Our team has been notified and you'll receive feedback within 48 hours.");
      
      // Reset form
      setSelectedEssay("");
      setReviewInstructions("");
      
      // Reload essays to show updated status
      await loadData();
      
    } catch (error) {
      console.error('Error in review submission:', error);
      toast.error("Failed to submit for review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'in_review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Review Complete</Badge>;
      default:
        return <Badge variant="outline">Not Reviewed</Badge>;
    }
  };

  const selectedEssayData = essays.find(e => e.id === selectedEssay);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Human Essay Review</h1>
            <p className="text-muted-foreground">
              Get professional feedback from experienced admissions counselors
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Submit Essay for Review
                </CardTitle>
                <CardDescription>
                  Professional review with detailed feedback and suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Essay</label>
                  <Select value={selectedEssay} onValueChange={setSelectedEssay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an essay to review..." />
                    </SelectTrigger>
                    <SelectContent>
                      {essays.map((essay) => (
                        <SelectItem key={essay.id} value={essay.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{essay.school}</span>
                            {getReviewStatusBadge(essay.review_status)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Review Instructions</label>
                  <Textarea
                    placeholder="Please provide specific areas you'd like the reviewer to focus on (e.g., content flow, grammar, authenticity, college-specific requirements, etc.)"
                    value={reviewInstructions}
                    onChange={(e) => setReviewInstructions(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Review Process</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Professional review within 48 hours</li>
                    <li>• Detailed feedback on content and structure</li>
                    <li>• Grammar and style improvements</li>
                    <li>• College-specific recommendations</li>
                    <li>• Unlimited revisions based on feedback</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || !selectedEssay || !reviewInstructions.trim()}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review ($5)"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {essays.filter(e => e.review_status).map((essay) => (
                    <div key={essay.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{essay.school}</p>
                        <p className="text-xs text-muted-foreground">
                          {essay.review_requested_at && new Date(essay.review_requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getReviewStatusBadge(essay.review_status)}
                    </div>
                  ))}
                  {essays.filter(e => e.review_status).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No essays submitted for review yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selectedEssayData && (
              <Card>
                <CardHeader>
                  <CardTitle>Essay Preview</CardTitle>
                  <CardDescription>
                    {selectedEssayData.school} • {selectedEssayData.generated_essay.split(' ').length} words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      {selectedEssayData.generated_essay.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 text-sm leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Content Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      Detailed feedback on story structure, authenticity, and impact
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Grammar & Style</p>
                    <p className="text-xs text-muted-foreground">
                      Professional editing for clarity and readability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">College-Specific Tips</p>
                    <p className="text-xs text-muted-foreground">
                      Tailored advice for your target school's preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Revision Support</p>
                    <p className="text-xs text-muted-foreground">
                      Guidance for implementing suggested improvements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">AI Detection Guarantee</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      All our essays are designed to appear completely human and pass AI detection systems. 
                      Our human reviewers ensure this standard is maintained.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        actionType="human_review"
        remaining={usageCheck?.remaining || 0}
      />
      
      <Footer />
    </div>
  );
}