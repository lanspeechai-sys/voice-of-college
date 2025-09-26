import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { generateEssay as generateEssayFromGemini } from "@/lib/gemini";
import { saveEssay, getCurrentUser, checkUsageLimit, incrementUserUsage, trackUsage } from "@/lib/supabase";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Mic, MicOff, School, FileText, Users, Sparkles, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/UpgradeModal";

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
    id: "mit",
    name: "Massachusetts Institute of Technology (MIT)",
    prompts: [
      "We know you lead a busy life, full of activities, many of which are required of you. Tell us about something you do simply for the pleasure of it.",
      "Although you may not yet know what you want to major in, which department or program at MIT appeals to you and why?",
      "At MIT, we bring people together to better the lives of others. MIT students work to improve their communities in different ways, from tackling the world's biggest challenges to being a good friend to someone in need. Describe one way you have collaborated with others to help improve your community."
    ]
  },
  {
    id: "princeton",
    name: "Princeton University",
    prompts: [
      "Princeton values community and encourages students, faculty, staff and leadership to engage in respectful conversations that can expand their perspectives and challenge their ideas and beliefs. As a prospective member of this community, reflect on how your lived experiences will impact the conversations you will have in the classroom, the dining hall or other campus spaces.",
      "Princeton has a longstanding commitment to understanding our responsibility to society through service and civic engagement. How does your own story intersect with these ideals?",
      "Please respond to each of the following short answer questions: What is a new skill you would like to learn in college? What brings you joy? What would you want your roommate to know about you?"
    ]
  },
  {
    id: "columbia",
    name: "Columbia University",
    prompts: [
      "Why are you interested in attending Columbia University? We encourage you to consider the aspect(s) that you find unique and compelling about Columbia.",
      "What attracts you to your preferred areas of study at Columbia College or Columbia Engineering?",
      "List the titles of the books, essays, poetry, short stories or plays you read outside of academic courses that you enjoyed most during secondary school."
    ]
  },
  {
    id: "upenn",
    name: "University of Pennsylvania",
    prompts: [
      "Write a short thank-you note to someone who has helped shape who you are today and what you hope to accomplish in the future.",
      "How will you explore community at Penn? Consider how Penn will help shape your perspective and identity, and how your identity and perspective will help shape Penn.",
      "Considering the undergraduate school you have selected, describe how you intend to explore your academic and intellectual interests at the University of Pennsylvania."
    ]
  },
  {
    id: "caltech",
    name: "California Institute of Technology (Caltech)",
    prompts: [
      "Caltech's mission is to expand human knowledge and benefit society through research integrated with education. Please describe how your interests and aspirations align with Caltech's mission.",
      "Caltech students have long been known for their quirky sense of humor, whether it be through planning creative pranks, building elaborate party themes, or even the year-end tradition of dropping a pumpkin from the top of Millikan Library. Please describe your sense of humor.",
      "In an increasingly global and interdependent world, there is a need for diversity in thought, background, and experience in science, technology, engineering and mathematics. How do you see yourself contributing to the diversity of Caltech's community?"
    ]
  },
  {
    id: "chicago",
    name: "University of Chicago",
    prompts: [
      "How does the University of Chicago, as you know it now, satisfy your desire for a particular kind of learning, community, and future? Please address with some specificity your own wishes and how they relate to UChicago.",
      "Share with us a few of your favorite books, poems, authors, films, plays, pieces of music, musicians, performers, paintings, artists, blogs, magazines, or newspapers. Feel free to touch on one, some, or all of the categories listed, or add a category of your own.",
      "Choose one of our extended essay prompts: 'What's so odd about odd numbers?' or 'What advice would a wisdom tooth have?' or 'Map the world around you.'"
    ]
  },
  {
    id: "northwestern",
    name: "Northwestern University",
    prompts: [
      "We want to be sure we're considering your application in the context of your choices and opportunities. Please briefly elaborate on one of your extracurricular activities, a job you hold, or responsibilities you have for your family.",
      "Why Northwestern? We want to understand why you want to attend Northwestern University. We also want to be clear about your expectations. What aspects of the University appeal to you, and how do you hope to contribute to our campus community?",
      "Describe yourself in three words and explain why you chose them."
    ]
  },
  {
    id: "duke",
    name: "Duke University",
    prompts: [
      "What is your sense of Duke as a university and a community, and why do you consider it a good match for you? If there's something in particular about our offerings that attracts you, feel free to share that as well.",
      "We believe a wide range of personal perspectives, beliefs, and lived experiences are essential to making Duke a vibrant and meaningful living and learning community. What do you hope to share, learn, or experience with the Duke community?",
      "Duke's commitment to diversity and inclusion includes sexual orientation, gender identity, and gender expression. If you'd like to share with us how your identity in this context has meaning for you, we'd like to hear from you."
    ]
  },
  {
    id: "dartmouth",
    name: "Dartmouth College",
    prompts: [
      "Required: Why are you drawn to the area(s) of study you indicated in our application? If you are undecided or applying to the liberal arts in general, feel free to address this generally. If you are applying for an engineering degree, what draws you to engineering?",
      "Required: What excites you about Dartmouth?",
      "Optional: Dartmouth celebrates the ways in which its profound sense of place shapes its students. As you seek admission to Dartmouth's Class of 2029, what aspects of the College's academic program, community, or campus environment attract your interest?"
    ]
  },
  {
    id: "brown",
    name: "Brown University",
    prompts: [
      "Brown's Open Curriculum allows students to explore broadly while also diving deeply into their academic pursuits. Tell us about any academic interests that excite you, and how you might use the Open Curriculum to pursue them while also embracing topics with which you are unfamiliar.",
      "Students entering Brown often find that making their home on College Hill naturally invites reflection on where they came from. Share how an aspect of your growing up has contributed to who you are today and how it will contribute to who you will become.",
      "Brown students care deeply about their work and the world around them. Students find contentment, satisfaction, and meaning in daily interactions and major discoveries. Whether big or small, mundane or spectacular, tell us about something that brings you joy."
    ]
  },
  {
    id: "cornell",
    name: "Cornell University",
    prompts: [
      "We all contribute to, and are influenced by, the communities that are meaningful to us. Describe a community that has been particularly meaningful to you and explain how you have contributed to this community and/or how it has contributed to your growth.",
      "Describe your intellectual interests and how you plan to pursue them at Cornell. Why do these areas of study excite you? How do you envision using what you learn to make a positive impact?",
      "Tell us about a time when you had to be courageous. What happened, and how did you handle it?"
    ]
  },
  {
    id: "vanderbilt",
    name: "Vanderbilt University",
    prompts: [
      "Please briefly elaborate on one of your extracurricular activities, a job you hold, or responsibilities you have for your family.",
      "Vanderbilt offers a community where students find balance between their academic and social experiences. Please briefly elaborate on how you would contribute to this balance.",
      "Vanderbilt University's motto, Crescere aude, is Latin for 'dare to grow.' In your response, reflect on how you have dared to grow in your academic, personal, or social life."
    ]
  },
  {
    id: "rice",
    name: "Rice University",
    prompts: [
      "Please explain why you wish to study in the academic areas you selected.",
      "Based upon your exploration of Rice University, what elements of the Rice experience appeal to you?",
      "Rice is lauded for creating a collaborative atmosphere that enhances the quality of life for all members of our campus community. The Residential College System and undergraduate life is heavily influenced by the unique life experiences and cultural traditions each student brings. What life perspectives would you contribute to the Rice community?"
    ]
  },
  {
    id: "emory",
    name: "Emory University",
    prompts: [
      "Which book, character, song, monologue, or piece of work (fiction or non-fiction) seems made for you? Why?",
      "Reflect on a personal experience where you intentionally expanded your cultural awareness.",
      "What is something about you that is essential to understanding who you are?"
    ]
  },
  {
    id: "georgetown",
    name: "Georgetown University",
    prompts: [
      "Briefly discuss the significance to you of the school or summer activity in which you have been most involved.",
      "As Georgetown is a diverse community, the Admissions Committee would like to know more about you in your own words. Please submit a brief essay, either personal or creative, which you feel best describes you.",
      "What does it mean to you to be educated? How might Georgetown College help you achieve this aim?"
    ]
  },
  {
    id: "carnegie-mellon",
    name: "Carnegie Mellon University",
    prompts: [
      "Most students choose their intended major or area of study based on a passion or inspiration that's developed over time – what passion or inspiration led you to choose this area of study?",
      "Many students pursue college for a specific degree, career opportunity or personal goal. Whichever it may be, learning will be critical to achieve your ultimate goal. As you think ahead to the process of learning during your college years, how will you define a successful college experience?",
      "Consider your application as a whole. What do you personally want to emphasize about your application for the admission committee's consideration? Highlight something that's important to you or something you haven't had a chance to share."
    ]
  },
  {
    id: "notre-dame",
    name: "University of Notre Dame",
    prompts: [
      "What excites you about the University of Notre Dame that makes you want to be a part of this community?",
      "Notre Dame's mission statement is 'to educate the hearts and minds of students.' How would you describe the education of your heart? What experiences or influences have shaped your emotional and spiritual development?",
      "Tell us about a time when you advocated for something you believed in. What did you learn from this experience?"
    ]
  },
  {
    id: "washington-university",
    name: "Washington University in St. Louis",
    prompts: [
      "Tell us about something that really sparks your intellectual interest and curiosity and compels you to explore more in the program/area of study that you indicated. It could be an idea, book, project, cultural activity, work of art, start-up, music, movie, research, innovation, question, or other pursuit.",
      "WashU's undergraduate community is a diverse mix of students from all over the world. Tell us about a community or group to which you belong or have belonged. Why is it important to you, and how has it shaped you?",
      "Describe a time when you were challenged by a perspective that differed from your own. How did you respond?"
    ]
  },
  {
    id: "ucla",
    name: "University of California, Los Angeles (UCLA)",
    prompts: [
      "Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes or contributed to group efforts over time.",
      "Every person has a creative side, and it can be expressed in many ways: problem solving, original and innovative thinking, and artistically, to name a few. Describe how you express your creative side.",
      "What would you say is your greatest talent or skill? How have you developed and demonstrated that talent over time?",
      "Describe how you have taken advantage of a significant educational opportunity or worked to overcome an educational barrier you have faced."
    ]
  },
  {
    id: "uc-berkeley",
    name: "University of California, Berkeley",
    prompts: [
      "Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes or contributed to group efforts over time.",
      "Every person has a creative side, and it can be expressed in many ways: problem solving, original and innovative thinking, and artistically, to name a few. Describe how you express your creative side.",
      "What would you say is your greatest talent or skill? How have you developed and demonstrated that talent over time?",
      "Describe how you have taken advantage of a significant educational opportunity or worked to overcome an educational barrier you have faced."
    ]
  },
  {
    id: "nyu",
    name: "New York University (NYU)",
    prompts: [
      "We would like to know more about your interest in NYU. What motivated you to apply to NYU? Why have you applied or expressed interest in a particular campus, school, college, program, and or area of study? If you have applied to more than one, please also tell us why you are interested in these additional areas of study or campuses.",
      "What is your favorite word and why?",
      "At the end of each academic year, NYU asks students to reflect on their experiences. Please share a brief reflection on your academic year and how you have grown."
    ]
  },
  {
    id: "johns-hopkins",
    name: "Johns Hopkins University",
    prompts: [
      "Founded in 1876, Johns Hopkins University was America's first research university. This legacy of academic excellence and discovery is woven into all that we do. What aspects of the Johns Hopkins undergraduate experience excite you and how would you contribute to our community?",
      "Johns Hopkins was founded in 1876 on a spirit of exploration and discovery. As a result, students can pursue a multi-dimensional undergraduate experience both in and outside of the classroom. Given the opportunities at Hopkins, please discuss your current interests—academic, extracurricular, personal passions, summer experiences, etc.—and how you will build upon them here.",
      "Successful students at Johns Hopkins make the biggest impact by collaborating with others, including peers, mentors, and professors. Talk about a time, in or outside the classroom, when you worked with others and what you learned from the experience."
    ]
  },
  {
    id: "williams",
    name: "Williams College",
    prompts: [
      "At Williams we believe that bringing together students and professors in small groups produces extraordinary academic outcomes. Our distinctive Oxford-style tutorial classes—in which two students are guided by a professor in deep exploration of a single topic—are a prime example. Each week the students take turns developing independent work and critiquing their partner's work. Imagine yourself in a tutorial at Williams. Of anyone in the world, whom would you choose to be the other student in the class, and why?",
      "Each year on Mountain Day, the president cancels classes, rings the chapel bell, and the entire community heads to the mountains. We know how you'll spend your Mountain Day, but let's imagine: if you could design a special tradition for Williams, what would it be?",
      "Williams students often speak of the 'Purple Bubble'—the idea that Williams provides a place and time to focus on learning without the distractions of the 'real world.' But of course, Williams students are already in the real world. How has your experience prepared you to engage with people, ideas, or problems that you might not have encountered in your home community?"
    ]
  },
  {
    id: "swarthmore",
    name: "Swarthmore College",
    prompts: [
      "How do you believe Swarthmore will help you grow as a person and as a student?",
      "What do you believe you would contribute to the Swarthmore community?",
      "Please write about why you are interested in applying to and attending Swarthmore. In other words, why Swarthmore?"
    ]
  },
  {
    id: "pomona",
    name: "Pomona College",
    prompts: [
      "At Pomona, we celebrate and identify with the number 47. Share with us one of your quirky personal, family, or community traditions and why you hold on to it.",
      "What do you love about the subject you want to study and why do you want to pursue it at Pomona?",
      "In our ever-changing world, what do you think is something that has remained constant? Why?"
    ]
  },
  {
    id: "amherst",
    name: "Amherst College",
    prompts: [
      "Amherst College is committed to learning through close colloquy and to expanding the realm of knowledge through scholarly research and artistic creation at the highest level. Its graduates link learning with leadership—in service to the College, to their communities, and to the world beyond. Please respond to one of the following quotations in an essay of no more than 300 words: 'Difficulty need not foreshadow despair or defeat. Rather achievement can be all the more satisfying because of obstacles surmounted.' - Attributed to William Hastie, Amherst Class of 1925, the first African-American to serve as a judge on the U.S. Court of Appeals",
      "'Stereotype threat' describes the risk of confirming negative stereotypes about an individual's racial, ethnic, gender, or cultural group, which can create high cognitive load and reduce academic focus and performance. Please describe a time when you felt you were not seen or understood by others, and how that experience shaped you.",
      "The Amherst motto is 'Terras Irradient' or 'Let them illuminate the lands.' From scientific discovery to policy change, from artistic creation to community organizing, Amherst graduates are using their liberal arts education to solve problems and make a difference in the world. In what ways do you envision yourself contributing to your community and the broader world?"
    ]
  },
  {
    id: "middlebury",
    name: "Middlebury College",
    prompts: [
      "At Middlebury, we believe that asking questions is as important as having answers. Students, faculty, and staff pose questions that don't have easy answers, and they dive into the nuanced conversations that follow. What is a question that matters to you, and how do you hope to explore it at Middlebury?",
      "Middlebury students are encouraged to think critically and creatively, and to engage with ideas, texts, and problems from multiple perspectives. Describe a time when you changed your mind about something important to you. What prompted this change?",
      "At Middlebury, we believe in the transformative power of engaging with ideas and perspectives different from our own. We believe that diversity of thought, identity, and experience is vital to our mission of preparing students for lives of consequence. Tell us about a time when you were exposed to a new idea or way of thinking that challenged or changed your perspective."
    ]
  },
  {
    id: "bowdoin",
    name: "Bowdoin College",
    prompts: [
      "Bowdoin students and alumni often cite world-class faculty and opportunities for intellectual engagement, the College's commitment to the Common Good, and the special quality of life on the coast of Maine as important aspects of the Bowdoin experience. Reflecting on your own interests and experiences, please comment on one of these aspects of Bowdoin that appeals to you.",
      "At Bowdoin, academic and co-curricular pursuits are seamlessly woven together to create a four-year experience that is both academically rigorous and personally fulfilling. Reflecting on your own interests and experiences, please comment on one of the following: Intellectual engagement, The Common Good, Connection to place.",
      "Bowdoin is a place where intellectual rigor and playful creativity coexist, where tradition and innovation intersect, and where academic excellence and civic responsibility meet. Which of these intersections excites you most, and why?"
    ]
  },
  {
    id: "tufts",
    name: "Tufts University",
    prompts: [
      "Which aspects of Tufts' curriculum or undergraduate experience prompt your application? In short, 'Why Tufts?'",
      "Now we'd like to know a little more about you. Please respond to one of the following six questions: A) What do you hope to accomplish as an undergraduate at Tufts? B) How have the environments or experiences of your upbringing – your family, home, neighborhood, or community – shaped the person you are today? C) Using a specific example or two, tell us about a way that you contributed to building a collaborative and/or inclusive community.",
      "We are looking for passionate students to join our diverse community of scholars, researchers, and artists. Answer the question that corresponds to the school/program to which you are applying."
    ]
  },
  {
    id: "wake-forest",
    name: "Wake Forest University",
    prompts: [
      "What piques your intellectual curiosity, and why?",
      "As part of our 'Voices of Our Time' series – which allows students, faculty, and staff to hear from some of the world's leading thinkers – Wake Forest has hosted Ta-Nehisi Coates, Michelle Alexander, Eboo Patel, and Thomas Friedman. If you could choose the next series speaker, whom would you pick, and why?",
      "Give us your top ten list."
    ]
  },
  {
    id: "colby",
    name: "Colby College",
    prompts: [
      "Colby is a community that values intellectual rigor, global engagement, and local impact. Tell us about a time when you made a meaningful contribution to a community that was important to you. What did you accomplish, and how did it feel to be part of the solution?",
      "Describe a time when you went outside your comfort zone or took a risk. What was challenging about that experience and what did you learn about yourself?",
      "Colby students, faculty, and staff are devoted to making a meaningful impact in the world around them. What issue or problem do you care about, and how might you use your Colby experience to address it?"
    ]
  },
  {
    id: "hamilton",
    name: "Hamilton College",
    prompts: [
      "Why do you want to attend Hamilton?",
      "Hamilton students have access to a world-class liberal arts education and are known for their intellectual curiosity. Describe a topic, activity, or idea that excites your intellectual curiosity. Why do you find it compelling? How do you want to explore it further?",
      "Hamilton's open curriculum gives students the freedom to shape their own course of study. What would you want to study at Hamilton, and why?"
    ]
  },
  {
    id: "wesleyan",
    name: "Wesleyan University",
    prompts: [
      "Why are you interested in attending Wesleyan University? We want to understand why Wesleyan appeals to you as an institution, given your goals, interests, and aspirations. We also want to understand why you would choose to enroll if admitted (your 'Why Wesleyan?').",
      "Tell us about a time when you challenged yourself intellectually. What did you learn about yourself in the process?",
      "At Wesleyan, we believe that the diversity of our students' backgrounds, experiences, and perspectives enriches everyone's education. How do you think your background or experiences will contribute to this mission?"
    ]
  },
  {
    id: "bates",
    name: "Bates College",
    prompts: [
      "Bates students and alumni are known for their intellectual curiosity, independent spirit, and commitment to meaningful work. What draws you to Bates?",
      "How do you think attending Bates would serve your interests both in and outside the classroom?",
      "The Bates mission speaks to educating students to 'think and act with humanity, integrity, and creative independence.' How would you apply one or more of these values to contribute to the Bates community?"
    ]
  },
  {
    id: "colgate",
    name: "Colgate University",
    prompts: [
      "What do you love about the subject you want to study and why do you want to pursue it at Colgate?",
      "Colgate students immerse themselves in social and intellectual pursuits that inspire them. Tell us about an activity, interest, or experience that has been meaningful to you. How might you pursue this at Colgate?",
      "Colgate students are known for their intellectual curiosity and collaborative spirit. Describe a time when you worked with others to solve a problem or achieve a goal. What did you learn from this experience?"
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCheck, setUsageCheck] = useState<any>(null);
  const [schoolSearch, setSchoolSearch] = useState<string>("");

  // Check authentication on component mount
  useState(() => {
    getCurrentUser().then(setUser);
  });

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (schoolSearch.trim() === "") {
      return SCHOOLS;
    } else {
      return SCHOOLS.filter(school =>
        school.name.toLowerCase().includes(schoolSearch.toLowerCase())
      );
    }
  }, [schoolSearch]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSchoolSelect = useCallback((schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedPrompt("");
    setCustomPrompt("");
    setSchoolSearch(""); // Clear search when school is selected
  }, []);

  const handlePromptSelect = useCallback((prompt: string) => {
    setSelectedPrompt(prompt);
  }, []);

  const handleResponseChange = useCallback((questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  }, []);

  const toggleVoiceInput = useCallback((questionId: string) => {
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
  }, [activeVoiceInput, speechRecognition, responses, handleResponseChange]);

  const nextStep = useCallback(() => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  }, [step, totalSteps]);

  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const canProceedFromStep1 = useMemo(() => 
    selectedSchool && (selectedPrompt || (selectedSchool === "custom" && customPrompt)),
    [selectedSchool, selectedPrompt, customPrompt]
  );
  
  const canProceedFromStep2 = useMemo(() => 
    responses[QUESTIONS[currentQuestionIndex]?.id]?.trim().length > 0,
    [responses, currentQuestionIndex]
  );
  
  const allQuestionsAnswered = useMemo(() => 
    QUESTIONS.every(q => responses[q.id]?.trim().length > 0),
    [responses]
  );

  const handleGenerateEssay = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to generate essays");
      return;
    }

    // Check usage limits before generating
    const limitCheck = await checkUsageLimit(user.id, 'essay');
    if (!limitCheck.canProceed) {
      setUsageCheck(limitCheck);
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      const essayContent = await generateEssayFromGemini({
        school: SCHOOLS.find(s => s.id === selectedSchool)?.name || selectedSchool,
        prompt: selectedPrompt || customPrompt,
        responses,
        wordLimit: 650,
        userId: user.id
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
        } else {
          // Track usage and increment counter
          const { data: savedEssay } = await saveEssay(essayData);
          await trackUsage(user.id, 'essay_generated', savedEssay?.id);
          await incrementUserUsage(user.id, 'essays_generated');
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
  }, [user, selectedSchool, selectedPrompt, customPrompt, responses, navigate]);

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <School className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-xl sm:text-2xl">Choose Your School & Prompt</CardTitle>
        </div>
        <CardDescription>
          Select your target university and the essay prompt you'd like to work on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="school-select" className="text-sm sm:text-base font-medium">Target School</Label>
          <div className="mt-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for your school..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {schoolSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSchoolSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="max-h-64 sm:max-h-48 overflow-y-auto border rounded-lg">
              {filteredSchools.length > 0 ? (
                <div className="p-1">
                  {filteredSchools.map(school => (
                    <div
                      key={school.id}
                      className={`p-4 sm:p-3 rounded-md cursor-pointer transition-all text-sm sm:text-sm touch-manipulation ${
                        selectedSchool === school.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleSchoolSelect(school.id)}
                    >
                      {school.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-4 text-center text-muted-foreground text-sm">
                  No schools found. Try a different search term.
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSchool && selectedSchool !== "custom" && (
          <div>
            <Label className="text-sm sm:text-base font-medium">Essay Prompt</Label>
            <div className="mt-2 space-y-3">
              {SCHOOLS.find(s => s.id === selectedSchool)?.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className={`p-4 sm:p-4 border rounded-lg cursor-pointer transition-all touch-manipulation ${
                    selectedPrompt === prompt
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <p className="text-sm sm:text-sm leading-relaxed">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSchool === "custom" && (
          <div>
            <Label htmlFor="custom-prompt" className="text-sm sm:text-base font-medium">Custom Essay Prompt</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Enter your essay prompt or topic..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mt-2 min-h-[120px] sm:min-h-[100px] text-base"
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
            <CardTitle className="text-xl sm:text-2xl">Share Your Story</CardTitle>
          </div>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-medium mb-4 leading-relaxed px-2">{currentQuestion.question}</h3>
          </div>

          <div className="relative">
            <Textarea
              placeholder={currentQuestion.placeholder}
              value={
                (responses[currentQuestion.id] || "") + 
                (activeVoiceInput === currentQuestion.id ? " " + speechRecognition.transcript : "")
              }
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              className="min-h-[180px] sm:min-h-[150px] pr-16 text-base leading-relaxed"
            />
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 h-12 w-12 sm:h-10 sm:w-10 rounded-full touch-manipulation ${
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
                <MicOff className="h-5 w-5 sm:h-5 sm:w-5" />
              ) : (
                <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
          
          {activeVoiceInput === currentQuestion.id && (
            <div className="flex items-center gap-2 p-4 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-sm text-red-700 font-medium">
                Recording... Speak clearly and your words will be added to your response.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous Question
            </Button>
            <span className="text-sm text-muted-foreground order-1 sm:order-2">
              {currentQuestionIndex + 1} / {QUESTIONS.length}
            </span>
            <Button
              className="w-full sm:w-auto order-3"
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
          <CardTitle className="text-xl sm:text-2xl">Review Your Responses</CardTitle>
        </div>
        <CardDescription>
          Make sure everything looks good before we generate your essay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 sm:p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 text-sm sm:text-base">Selected School & Prompt:</h4>
          <p className="text-sm sm:text-sm text-muted-foreground mb-2">
            {SCHOOLS.find(s => s.id === selectedSchool)?.name}
          </p>
          <p className="text-sm sm:text-sm italic leading-relaxed">"{selectedPrompt || customPrompt}"</p>
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((question, index) => (
            <div key={question.id} className="p-4 sm:p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">{question.question}</h4>
              <p className="text-sm sm:text-sm text-muted-foreground leading-relaxed">
                {responses[question.id] || "No response provided"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 sm:mt-2 touch-manipulation"
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
          <CardTitle className="text-xl sm:text-2xl">Generate Your Essay</CardTitle>
        </div>
        <CardDescription>
          Our AI will craft a compelling essay based on your responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {!isGenerating ? (
          <>
            <div className="p-6 sm:p-6 bg-gradient-primary/10 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium mb-2">Ready to Create Your Essay!</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We'll use your responses to generate an authentic, compelling essay that captures your unique voice and story.
              </p>
            </div>
            <Button onClick={handleGenerateEssay} size="lg" className="w-full py-4 text-base touch-manipulation">
              Generate My Essay
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h3 className="text-base sm:text-lg font-medium">Generating Your Essay...</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
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
      <div className="pt-20 sm:pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 touch-manipulation"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="max-w-2xl mx-auto px-2">
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

          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 max-w-2xl mx-auto mt-8 px-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto touch-manipulation"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              className="w-full sm:w-auto touch-manipulation"
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