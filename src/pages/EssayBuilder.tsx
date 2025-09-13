import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateEssay as generateEssayFromOpenAI } from "@/lib/openai";
import { saveEssay, getCurrentUser } from "@/lib/supabase";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Mic, MicOff, School, FileText, Users, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { v4 as uuidv4 } from 'uuid';

interface SchoolOption {
  id: string;
  name: string;
  prompts: string[];
}

const SCHOOLS: SchoolOption[] = [
  {
    id: "harvard",
    name: "Harvard University",
    prompts: [
      "Harvard has long recognized the importance of student body diversity of all kinds. We welcome you to write about distinctive aspects of your background, personal development or the intellectual interests you might bring to your Harvard classmates.",
      "Describe a time when you made a meaningful contribution to others in which the greater good was your focus. Discuss the challenges and rewards of making your contribution.",
      "Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes, or contributed to group efforts over time."
    ]
  },
  {
    id: "yale",
    name: "Yale University", 
    prompts: [
      "Students at Yale have time to explore their academic interests before committing to one or more major fields of study. Many students either modify their original academic direction or change their minds entirely. As of this moment, what academic areas seem to fit your interests or goals most comfortably?",
      "What is it about Yale that has led you to apply?",
      "What inspires you?"
    ]
  },
  {
    id: "stanford",
    name: "Stanford University",
    prompts: [
      "The Stanford community is deeply curious and driven to learn in and out of the classroom. Reflect on an idea or experience that makes you genuinely excited about learning.",
      "Virtually all of Stanford's undergraduates live on campus. Write a note to your future roommate that reveals something about you or that will help your roommate—and us—get to know you better.",
      "Tell us about something that is meaningful to you and why."
    ]
  },
  {
    id: "custom",
    name: "Custom Essay Topic",
    prompts: []
  }
];

const QUESTIONS = [
  {
    id: "background",
    question: "Tell us about your background, family, and what shaped who you are today.",
    placeholder: "Share your story - where you come from, your family dynamics, cultural background, or formative experiences..."
  },
  {
    id: "achievements",
    question: "What are you most proud of? Describe your key achievements or moments of growth.",
    placeholder: "Think about academic accomplishments, personal victories, overcoming challenges, or times you made a difference..."
  },
  {
    id: "interests",
    question: "What are you passionate about? What drives your curiosity and excitement?",
    placeholder: "Describe your academic interests, hobbies, causes you care about, or subjects that fascinate you..."
  },
  {
    id: "goals",
    question: "What are your future goals and how does this school fit into your vision?",
    placeholder: "Share your aspirations, career goals, or how you want to make an impact in the world..."
  },
  {
    id: "challenges",
    question: "Describe a challenge you've faced and how you overcame it or what you learned.",
    placeholder: "Think about obstacles, setbacks, difficult decisions, or times when you had to persevere..."
  }
];

export default function EssayBuilder() {
  const navigate = useNavigate();
  const speechRecognition = useSpeechRecognition();
  const [step, setStep] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeVoiceInput, setActiveVoiceInput] = useState<string | null>(null);

  // Check authentication on component mount
  useState(() => {
    getCurrentUser().then(setUser);
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedPrompt("");
    setCustomPrompt("");
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const toggleVoiceInput = (questionId: string) => {
    if (activeVoiceInput === questionId) {
      // Stop recording
      speechRecognition.stopListening();
      
      // Add transcript to existing response
      if (speechRecognition.transcript) {
        const existingResponse = responses[questionId] || '';
        const newResponse = existingResponse + (existingResponse ? ' ' : '') + speechRecognition.transcript;
        handleResponseChange(questionId, newResponse);
      }
      
      // Reset and clear
      speechRecognition.resetTranscript();
      setActiveVoiceInput(null);
    } else {
      // Start recording
      speechRecognition.resetTranscript();
      speechRecognition.startListening({ continuous: true });
      setActiveVoiceInput(questionId);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceedFromStep1 = selectedSchool && (selectedPrompt || (selectedSchool === "custom" && customPrompt));
  const canProceedFromStep2 = responses[QUESTIONS[currentQuestionIndex]?.id]?.trim().length > 0;
  const allQuestionsAnswered = QUESTIONS.every(q => responses[q.id]?.trim().length > 0);

  const handleGenerateEssay = async () => {
    setIsGenerating(true);
    
    try {
      const essayContent = await generateEssayFromOpenAI({
        school: SCHOOLS.find(s => s.id === selectedSchool)?.name || selectedSchool,
        prompt: selectedPrompt || customPrompt,
        responses,
        wordLimit: 650
      });

      // Save essay if user is authenticated
      if (user) {
        const essayData = {
          user_id: user.id,
          school: SCHOOLS.find(s => s.id === selectedSchool)?.name || selectedSchool,
          prompt: selectedPrompt || customPrompt,
          responses,
          generated_essay: essayContent,
          is_shared: false
        };

        const { error } = await saveEssay(essayData);
        if (error) {
          console.error('Error saving essay:', error);
          toast.error("Essay generated but couldn't be saved. Please try again.");
        }
      }

      setIsGenerating(false);
      navigate("/essay-result", { 
        state: { 
          school: selectedSchool,
          prompt: selectedPrompt || customPrompt,
          responses,
          generatedEssay: essayContent
        }
      });
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to generate essay. Please check your API key and try again.");
      console.error('Essay generation error:', error);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <School className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl">Choose Your School & Prompt</CardTitle>
        </div>
        <CardDescription>
          Select your target university and the essay prompt you'd like to work on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="school-select" className="text-base font-medium">Target School</Label>
          <Select value={selectedSchool} onValueChange={handleSchoolSelect}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a university..." />
            </SelectTrigger>
            <SelectContent>
              {SCHOOLS.map(school => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSchool && selectedSchool !== "custom" && (
          <div>
            <Label className="text-base font-medium">Essay Prompt</Label>
            <div className="mt-2 space-y-3">
              {SCHOOLS.find(s => s.id === selectedSchool)?.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPrompt === prompt
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <p className="text-sm">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSchool === "custom" && (
          <div>
            <Label htmlFor="custom-prompt" className="text-base font-medium">Custom Essay Prompt</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Enter your essay prompt or topic..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Share Your Story</CardTitle>
          </div>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          </div>

          <div className="relative">
            <Textarea
              placeholder={currentQuestion.placeholder}
              value={
                (responses[currentQuestion.id] || "") + 
                (activeVoiceInput === currentQuestion.id ? " " + speechRecognition.transcript : "")
              }
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              className="min-h-[150px] pr-16"
            />
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 h-10 w-10 rounded-full ${
                activeVoiceInput === currentQuestion.id ? "text-red-500" : "text-muted-foreground"
              } ${
                activeVoiceInput === currentQuestion.id ? "bg-red-50 hover:bg-red-100" : "bg-gray-50 hover:bg-gray-100"
              } border-2 ${
                activeVoiceInput === currentQuestion.id ? "border-red-200" : "border-gray-200"
              }`}
              onClick={() => toggleVoiceInput(currentQuestion.id)}
              disabled={!speechRecognition.browserSupportsSpeechRecognition}
              title={
                !speechRecognition.browserSupportsSpeechRecognition 
                  ? "Voice input not supported in this browser" 
                  : activeVoiceInput === currentQuestion.id 
                    ? "Stop recording" 
                    : "Start voice input"
              }
            >
              {activeVoiceInput === currentQuestion.id ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {activeVoiceInput === currentQuestion.id && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 font-medium">
                Recording... Speak clearly and your words will be added to your response.
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous Question
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {QUESTIONS.length}
            </span>
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(QUESTIONS.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === QUESTIONS.length - 1}
            >
              Next Question
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl">Review Your Responses</CardTitle>
        </div>
        <CardDescription>
          Make sure everything looks good before we generate your essay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected School & Prompt:</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {SCHOOLS.find(s => s.id === selectedSchool)?.name}
          </p>
          <p className="text-sm italic">"{selectedPrompt || customPrompt}"</p>
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{question.question}</h4>
              <p className="text-sm text-muted-foreground">
                {responses[question.id] || "No response provided"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setStep(2);
                }}
              >
                Edit Response
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl">Generate Your Essay</CardTitle>
        </div>
        <CardDescription>
          Our AI will craft a compelling essay based on your responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {!isGenerating ? (
          <>
            <div className="p-6 bg-gradient-primary/10 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Ready to Create Your Essay!</h3>
              <p className="text-muted-foreground">
                We'll use your responses to generate an authentic, compelling essay that captures your unique voice and story.
              </p>
            </div>
            <Button onClick={handleGenerateEssay} size="lg" className="w-full">
              Generate My Essay
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h3 className="text-lg font-medium">Generating Your Essay...</h3>
            <p className="text-muted-foreground">
              Our AI is carefully crafting your essay based on your unique story and experiences.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="max-w-2xl mx-auto">
              <Progress value={progress} className="mb-4" />
              <p className="text-center text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <div className="flex justify-between max-w-2xl mx-auto mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={
                step === totalSteps ||
                (step === 1 && !canProceedFromStep1) ||
                (step === 2 && !allQuestionsAnswered)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}