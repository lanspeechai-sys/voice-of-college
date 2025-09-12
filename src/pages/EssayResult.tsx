import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, Edit3, Users, CheckCircle, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function EssayResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { school, prompt, responses } = location.state || {};
  
  const [essay, setEssay] = useState(`The moment I stepped into my grandmother's kitchen, the aroma of cardamom and cinnamon transported me to a world where tradition and innovation danced together. As I watched her weathered hands expertly fold samosas, I realized that this wasn't just cooking—it was storytelling, cultural preservation, and the embodiment of resilience that has shaped my identity.

Growing up in a bicultural household, I often felt caught between two worlds. My Pakistani heritage, rich with traditions and values, sometimes seemed at odds with my American upbringing. However, it was through my grandmother's stories and my mother's adaptations of our family recipes that I began to understand how these two cultures could complement rather than compete with each other.

This realization sparked my passion for cultural anthropology and food studies. I began documenting family recipes, not just as instructions for cooking, but as narratives of migration, adaptation, and identity. Each dish told a story: the way my mother substituted ingredients based on what was available in American grocery stores, how my father's business acumen influenced our family's approach to hospitality, and how my younger siblings and I created fusion dishes that reflected our unique American-Pakistani experience.

My interest in preserving and sharing these stories led me to start a blog called "Flavors of Heritage," where I interview immigrant families about their food traditions and the ways they've adapted to life in America. What began as a personal project has grown into a platform that has reached thousands of readers and connected families across different cultures who share similar experiences of navigating multiple identities.

Through this work, I've learned that authenticity doesn't mean remaining unchanged—it means staying true to your core values while allowing yourself to grow and adapt. This lesson has influenced every aspect of my life, from my academic pursuits to my leadership roles in student organizations.

As I look toward my future at Harvard, I'm excited to bring this perspective to campus. I want to continue exploring how cultural identity shapes individual and community experiences, and I'm particularly interested in Harvard's Food and Society program. I believe that food serves as a universal language that can bridge differences and create understanding between diverse communities.

My grandmother's kitchen taught me that the most meaningful traditions are those that evolve while maintaining their essence. I hope to bring this same spirit of thoughtful adaptation and cultural bridge-building to the Harvard community, contributing to conversations about identity, belonging, and the beautiful complexity of the American experience.`);

  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!school || !prompt || !responses) {
    navigate("/essay-builder");
    return null;
  }

  const handleCopyEssay = () => {
    navigator.clipboard.writeText(essay);
    toast.success("Essay copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([essay], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "college-essay.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Essay downloaded successfully!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My College Essay",
        text: essay,
      });
    } else {
      handleCopyEssay();
    }
  };

  const wordCount = essay.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/essay-builder")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Your Essay is Ready!</h1>
            <p className="text-muted-foreground">
              Here's your personalized college application essay
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Generated Essay
                    </CardTitle>
                    <CardDescription>
                      {school} • {wordCount} words
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyEssay}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Essay Prompt:</p>
                  <p className="text-sm italic">"{prompt}"</p>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      className="min-h-[500px] font-serif text-base leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-lg max-w-none">
                      {essay.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-base leading-relaxed font-serif">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="mt-4"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Essay
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Get Human Feedback
                </CardTitle>
                <CardDescription>
                  Share your essay with teachers, counselors, or mentors for additional insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes or feedback from reviewers here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    Share with Counselor
                  </Button>
                  <Button variant="outline" size="sm">
                    Request Peer Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Essay Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Word Count</span>
                  <Badge variant="secondary">{wordCount} words</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reading Level</span>
                  <Badge variant="secondary">College Level</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tone</span>
                  <Badge variant="secondary">Personal & Reflective</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authenticity</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    High
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Responses</CardTitle>
                <CardDescription>
                  The story elements we used to craft your essay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="background" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="interests">Interests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="background" className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Background:</p>
                      <p className="text-muted-foreground text-xs">
                        {responses.background?.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Achievements:</p>
                      <p className="text-muted-foreground text-xs">
                        {responses.achievements?.substring(0, 100)}...
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="interests" className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Interests:</p>
                      <p className="text-muted-foreground text-xs">
                        {responses.interests?.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Goals:</p>
                      <p className="text-muted-foreground text-xs">
                        {responses.goals?.substring(0, 100)}...
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Get Feedback from Counselor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Create Another Essay
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Common App
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}