import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Copy, Download, RefreshCw, Clipboard } from "lucide-react";
import { getCurrentUser, checkUsageLimit, incrementUserUsage, trackUsage } from "@/lib/supabase";
import { humanizeText } from "@/lib/gemini";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/UpgradeModal";

export default function AIHumanizer() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [humanizedText, setHumanizedText] = useState("");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCheck, setUsageCheck] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      navigate('/auth');
    }
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      toast.success("Text pasted successfully!");
    } catch (error) {
      toast.error("Failed to paste text. Please paste manually.");
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to humanize");
      return;
    }

    if (!user) {
      toast.error("Please sign in to use the humanizer");
      return;
    }

    // Check usage limits before humanizing
    const limitCheck = await checkUsageLimit(user.id, 'essay');
    if (!limitCheck.canProceed) {
      setUsageCheck(limitCheck);
      setShowUpgradeModal(true);
      return;
    }

    setIsHumanizing(true);
    
    try {
      const result = await humanizeText(inputText);
      setHumanizedText(result);
      
      // Track usage
      await trackUsage(user.id, 'essay_generated');
      await incrementUserUsage(user.id, 'essays_generated');
      
      toast.success("Text humanized successfully!");
    } catch (error) {
      console.error('Humanization error:', error);
      toast.error("Failed to humanize text. Please try again.");
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleCopyResult = () => {
    if (humanizedText) {
      navigator.clipboard.writeText(humanizedText);
      toast.success("Humanized text copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (humanizedText) {
      const element = document.createElement("a");
      const file = new Blob([humanizedText], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "humanized-text.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Humanized text downloaded!");
    }
  };

  const wordCount = inputText.split(/\s+/).filter(word => word.length > 0).length;
  const resultWordCount = humanizedText.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="pt-20 sm:pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 touch-manipulation"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Humanize AI Text & Outsmart{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AI Detectors
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Natural Write converts your AI-generated content into fully humanized, 
                undetectable writing—ensuring it passes every AI detection tool
              </p>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-base font-semibold touch-manipulation"
                >
                  Get more words
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Input Section */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Your Text</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Paste your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px] sm:min-h-[350px] text-base leading-relaxed resize-none"
                  />
                  {!inputText && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Button
                        variant="outline"
                        size="sm"
                        className="pointer-events-auto touch-manipulation"
                        onClick={handlePasteText}
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Paste Text
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {wordCount} / 500 words
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50 touch-manipulation"
                      disabled
                    >
                      Check for AI
                    </Button>
                    <Button
                      onClick={handleHumanize}
                      disabled={isHumanizing || !inputText.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white touch-manipulation"
                      size="sm"
                    >
                      {isHumanizing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Humanizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Humanize
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Humanized Result</CardTitle>
                  {humanizedText && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyResult}
                        className="touch-manipulation"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="touch-manipulation"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {humanizedText ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg min-h-[300px] sm:min-h-[350px]">
                      <div className="prose prose-sm max-w-none">
                        {humanizedText.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-sm sm:text-base leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {resultWordCount} words
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Humanized
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[300px] sm:min-h-[350px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">
                        Your humanized text will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Detection Bypass Section */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Bypass AI content detectors
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center justify-items-center opacity-60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm font-medium">turnitin</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span className="text-sm font-medium">Copyleaks</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <span className="text-sm font-medium">ZeroGPT</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <span className="text-sm font-medium">QuillBot</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-sm font-medium">grammarly</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-sm font-medium">GPTZero</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Advanced AI Humanization</h3>
                <p className="text-sm text-muted-foreground">
                  Transform AI-generated content into natural, human-like writing that passes all detection systems
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Get your humanized text in seconds with our optimized AI processing pipeline
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Copy className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Easy Export</h3>
                <p className="text-sm text-muted-foreground">
                  Copy or download your humanized text for immediate use in your applications
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        actionType="essay"
        remaining={usageCheck?.remaining || 0}
      />
      
      <Footer />
    </div>
  );
}