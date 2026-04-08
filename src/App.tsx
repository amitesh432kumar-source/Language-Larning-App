import { useState } from 'react';
import { Mic, MicOff, Loader2, Volume2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveAPI } from '@/hooks/useLiveAPI';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { TextTutor } from '@/components/TextTutor';

const LANGUAGES = [
  { value: 'Afrikaans', label: 'Afrikaans' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Catalan', label: 'Catalan' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'English', label: 'English' },
  { value: 'Estonian', label: 'Estonian' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Hebrew', label: 'Hebrew' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Latvian', label: 'Latvian' },
  { value: 'Lithuanian', label: 'Lithuanian' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Slovak', label: 'Slovak' },
  { value: 'Slovenian', label: 'Slovenian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Tagalog', label: 'Tagalog' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Vietnamese', label: 'Vietnamese' },
];

const PROFICIENCIES = [
  { value: 'Beginner', label: 'Beginner (A1-A2)' },
  { value: 'Intermediate', label: 'Intermediate (B1-B2)' },
  { value: 'Advanced', label: 'Advanced (C1-C2)' },
];

const VoxaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="28" fill="url(#grad)" />
    <path d="M28 40 L40 68 L50 42 L60 68 L72 40" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="24" r="6" fill="white" />
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export default function App() {
  const [language, setLanguage] = useState('Spanish');
  const [proficiency, setProficiency] = useState('Beginner');
  const [activeTab, setActiveTab] = useState('voice');

  const {
    isConnected,
    isConnecting,
    isSpeaking,
    error,
    connect,
    disconnect
  } = useLiveAPI(language, proficiency);

  return (
    <div className="dark min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden text-neutral-50">
      {/* Atmospheric background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-white/10 bg-black/40 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-6">
            <VoxaLogo className="w-16 h-16 shadow-2xl" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">
            Voxa
          </CardTitle>
          <CardDescription className="text-neutral-400 mt-2 text-sm tracking-wide uppercase font-medium">
            AI Language Partner
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected && !isConnecting && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Target Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white/5 border-white/10 focus:ring-purple-500">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Proficiency Level</label>
                <Select value={proficiency} onValueChange={setProficiency}>
                  <SelectTrigger className="bg-white/5 border-white/10 focus:ring-purple-500">
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCIES.map(prof => (
                      <SelectItem key={prof.value} value={prof.value}>
                        {prof.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="voice" disabled={isConnected || isConnecting} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Mic className="w-4 h-4 mr-2" />
                Voice Partner
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={isConnected || isConnecting} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Text Tutor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice">
              {(isConnected || isConnecting) ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-8">
                  <div className="flex flex-col items-center gap-2">
                    <Badge variant="outline" className="mb-4 border-white/20 bg-white/5 text-neutral-300 px-4 py-1">
                      {language} • {proficiency}
                    </Badge>
                    
                    {isConnecting ? (
                      <div className="flex flex-col items-center gap-4 text-neutral-400 mt-4">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        <p className="text-sm font-medium tracking-wide">Connecting to Voxa...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 w-full mt-2">
                        <div className="flex items-center justify-between w-full px-6">
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${!isSpeaking ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-neutral-500'}`}>
                              <Mic className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">You</span>
                          </div>
                          
                          <div className="flex-1 flex justify-center px-4">
                            <AudioVisualizer isActive={true} color={isSpeaking ? 'bg-purple-500' : 'bg-blue-500'} />
                          </div>

                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-neutral-500'}`}>
                              <Volume2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Voxa</span>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium text-neutral-400 text-center px-4 tracking-wide">
                          {isSpeaking ? "Voxa is speaking..." : "Listening... speak now"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-neutral-400">
                    Practice speaking in real-time with Voxa. Make sure your microphone is enabled.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <TextTutor language={language} proficiency={proficiency} />
            </TabsContent>
          </Tabs>

          {error && activeTab === 'voice' && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 text-center">
              {error}
            </div>
          )}
        </CardContent>

        {activeTab === 'voice' && (
          <CardFooter className="flex justify-center pt-2 pb-8">
            {!isConnected && !isConnecting ? (
              <Button 
                onClick={connect} 
                className="w-full sm:w-auto px-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300"
                size="lg"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <Button 
                onClick={disconnect} 
                variant="destructive"
                className="w-full sm:w-auto px-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/30 transition-all duration-300"
                size="lg"
              >
                <MicOff className="w-4 h-4 mr-2" />
                End Session
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
