import React, { useState, useRef, useEffect } from 'react';
import { Dog, Upload, PawPrint, ArrowRight, Info, Trash2, Home, Dumbbell, Coffee, Sparkles, Heart } from 'lucide-react';
import { analyzeBreedSize, generateDogThought } from './services/geminiService';
import { DogVisionDisplay } from './components/DogVisionDisplay';
import { DogSize, UploadedFile, BreedAnalysis, SceneType } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [breedInput, setBreedInput] = useState('');
  const [breedAnalysis, setBreedAnalysis] = useState<BreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [scene, setScene] = useState<SceneType>(SceneType.CASUAL);
  const [dogThought, setDogThought] = useState<string>("");
  const [isThoughtLoading, setIsThoughtLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const type = selectedFile.type.startsWith('video') ? 'video' : 'image';
      // Store originalFile for API usage
      setFile({ url, type, name: selectedFile.name, originalFile: selectedFile });
    }
  };

  const handleAnalyzeBreed = async () => {
    if (!breedInput.trim()) return;
    
    setIsLoading(true);
    try {
      const analysis = await analyzeBreedSize(breedInput);
      setBreedAnalysis(analysis);
      // Trigger thought update when breed is confirmed
      updateDogThought(analysis.size.toString(), breedInput, scene); 
    } finally {
      setIsLoading(false);
    }
  };

  // Unified function to update thoughts
  const updateDogThought = async (currentSize?: string, currentBreed?: string, currentScene?: SceneType) => {
    if (!file) return;
    
    setIsThoughtLoading(true);
    setDogThought(""); // Clear previous thought while loading to show "Sniffing..."
    try {
      const thought = await generateDogThought(
        currentBreed || breedInput || 'Dog', 
        currentScene || scene, 
        file.originalFile
      );
      setDogThought(thought);
    } finally {
      setIsThoughtLoading(false);
    }
  };

  // Allow manual regeneration of the thought
  const handleRegenerateThought = () => {
    updateDogThought(undefined, breedInput, scene);
  };

  // Update thought when file or scene changes
  useEffect(() => {
    if (file) {
      updateDogThought(undefined, breedInput, scene);
    }
  }, [file, scene]);

  const handleReset = () => {
    setFile(null);
    setBreedInput('');
    setBreedAnalysis(null);
    setDogThought("");
    setScene(SceneType.CASUAL);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Custom Theme Classes
  const getSceneButtonClass = (type: SceneType) => `
    flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all transform hover:-translate-y-1
    ${scene === type 
      ? 'bg-[#FFECB3] border-[#FFD54F] text-[#5D4037] shadow-md' 
      : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#9E9E9E] hover:bg-white hover:border-[#B0BEC5]'}
  `;

  return (
    // Updated Background Color to Latte/Beige tone
    <div className="min-h-screen bg-[#C1A68D] text-[#4A3B32] font-sans flex flex-col relative overflow-hidden">
      
      {/* Watermark Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
         {/* Abstract Blobs (Blue corners) */}
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#A3E3E6] rounded-full blur-3xl"></div>
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#A3E3E6] rounded-full blur-3xl"></div>
         
         {/* Scattered Text Watermarks - Updated to "Woof" theme */}
         <div className="absolute top-1/4 left-10 transform -rotate-12 text-9xl font-black text-[#3E2723]">WOOF</div>
         <div className="absolute bottom-1/3 right-10 transform rotate-12 text-8xl font-black text-[#3E2723] text-right leading-tight">
           Woof<br/>woof
         </div>
         
         {/* Cartoon Dog Pattern Patterns */}
         <div className="absolute top-20 right-20 transform rotate-45">
            <PawPrint className="w-32 h-32 text-[#3E2723]" />
         </div>
         <div className="absolute bottom-20 left-20 transform -rotate-12">
            <PawPrint className="w-24 h-24 text-[#3E2723]" />
         </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b-4 border-[#E0F7FA] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#A3E3E6] p-2 rounded-xl shadow-inner">
              <Dog className="w-7 h-7 text-[#4A3B32]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#4A3B32]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Dog<span className="text-[#FF8A65]">View</span>
            </h1>
          </div>
          <div className="text-sm font-bold text-[#8D6E63] bg-[#EFEBE9] px-3 py-1 rounded-full">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8 relative z-10">
        
        {/* Intro / Hero */}
        {!file && (
          <div className="text-center py-16 md:py-24 space-y-8 animate-fade-in flex flex-col items-center">
             <div className="relative">
                <h2 className="text-5xl md:text-7xl font-black text-[#3E2723] relative z-10" style={{ lineHeight: 1.2 }}>
                  The world <br/>
                  <span className="text-[#F5F5F5] text-stroke-brown drop-shadow-lg">seen from your eyes</span>
                </h2>
                <div className="absolute -top-10 -right-10 text-[#FFB74D] animate-bounce">
                  <Sparkles className="w-12 h-12" />
                </div>
             </div>

            <p className="text-xl text-[#5D4037] font-semibold max-w-2xl mx-auto bg-[#FFF8E1]/60 p-4 rounded-2xl backdrop-blur-sm">
              Upload a photo or video to simulate your dog's unique perspective and color vision!
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-[#3E2723] transition-all duration-200 bg-[#A3E3E6] rounded-full border-4 border-white shadow-[0_8px_0_#64B5F6] hover:shadow-[0_4px_0_#64B5F6] hover:translate-y-1 active:shadow-none active:translate-y-2"
            >
              <Upload className="w-6 h-6 mr-2" />
              UPLOAD MEDIA
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        {/* Main Interface */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
            
            {/* Left Sidebar: Controls */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              
              {/* Config Card */}
              <div className="bg-[#FDFBF7] rounded-3xl p-6 border-4 border-[#FFFFFF] shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#EFEBE9] pb-4">
                  <h3 className="text-xl font-black text-[#5D4037] flex items-center gap-2">
                    <PawPrint className="w-6 h-6 text-[#FFB74D]" />
                    DOGGY DETAILS
                  </h3>
                  <button 
                    onClick={handleReset}
                    className="bg-[#FFEBEE] text-[#D32F2F] hover:bg-[#FFCDD2] transition-colors p-2 rounded-xl"
                    title="Reset"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Breed Input */}
                <div>
                  <label className="block text-sm font-bold text-[#8D6E63] mb-2">
                    WHAT BREED IS IT?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={breedInput}
                      onChange={(e) => setBreedInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeBreed()}
                      placeholder="e.g. Golden Retriever"
                      className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#4A3B32] focus:border-[#A3E3E6] focus:ring-4 focus:ring-[#A3E3E6]/30 outline-none transition-all font-semibold placeholder-[#BDBDBD]"
                    />
                    <button
                      onClick={handleAnalyzeBreed}
                      disabled={isLoading || !breedInput}
                      className="bg-[#FFB74D] hover:bg-[#FFA726] disabled:bg-[#E0E0E0] text-white rounded-xl px-4 py-2 border-b-4 border-[#F57C00] hover:border-[#EF6C00] active:border-0 active:translate-y-1 transition-all"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Analysis Result */}
                {breedAnalysis ? (
                  <div className="bg-[#FFF8E1] rounded-2xl p-4 border-2 border-[#FFE082] animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#E65100] font-black text-lg uppercase">{breedAnalysis.size} SIZE</span>
                      <span className="text-xs font-bold bg-[#FFE0B2] text-[#E65100] px-2 py-1 rounded-lg">~{breedAnalysis.typicalHeightCm}cm</span>
                    </div>
                    <p className="text-[#5D4037] text-sm font-medium leading-relaxed">
                      {breedAnalysis.reasoning}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#E1F5FE] border-2 border-[#B3E5FC] p-4 rounded-2xl flex gap-3 items-start">
                    <Info className="w-6 h-6 text-[#0288D1] shrink-0" />
                    <p className="text-sm text-[#0277BD] font-bold">
                      Enter a breed to detect size!
                    </p>
                  </div>
                )}

                <div className="border-t-2 border-[#EFEBE9] pt-6">
                  <h3 className="text-sm font-black text-[#8D6E63] mb-4 uppercase tracking-wider">Pick a Scene</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setScene(SceneType.INDOOR)} className={getSceneButtonClass(SceneType.INDOOR)}>
                      <Home className="w-6 h-6" />
                      <span className="text-xs font-extrabold">COZY</span>
                    </button>
                    <button onClick={() => setScene(SceneType.CASUAL)} className={getSceneButtonClass(SceneType.CASUAL)}>
                      <Coffee className="w-6 h-6" />
                      <span className="text-xs font-extrabold">CASUAL</span>
                    </button>
                    <button onClick={() => setScene(SceneType.SPORT)} className={getSceneButtonClass(SceneType.SPORT)}>
                      <Dumbbell className="w-6 h-6" />
                      <span className="text-xs font-extrabold">ACTIVE</span>
                    </button>
                    <button onClick={() => setScene(SceneType.FANCY)} className={getSceneButtonClass(SceneType.FANCY)}>
                      <Sparkles className="w-6 h-6" />
                      <span className="text-xs font-extrabold">FANCY</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="bg-[#FDFBF7] rounded-3xl p-4 border-4 border-white shadow-lg">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="font-bold text-[#5D4037] group-hover:text-[#3E2723] transition-colors">Compare with Human View</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={showOriginal}
                      onChange={() => setShowOriginal(!showOriginal)}
                    />
                    <div className="w-14 h-8 bg-[#E0E0E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#A3E3E6]"></div>
                  </div>
                </label>
              </div>

            </div>

            {/* Right/Center: Visual Display */}
            <div className="lg:col-span-2 h-full flex flex-col gap-4 order-1 lg:order-2">
              <div className="bg-white/30 rounded-3xl p-3 border-2 border-white/50 backdrop-blur-md shadow-2xl flex-1 flex flex-col items-center justify-center min-h-[400px]">
                
                {showOriginal ? (
                  <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border-4 border-[#BDBDBD]">
                    <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-bold border border-white/20">
                      👤 Human View
                    </div>
                    {file.type === 'video' ? (
                        <video src={file.url} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={file.url} alt="Original" className="w-full h-full object-contain" />
                      )}
                  </div>
                ) : (
                  <DogVisionDisplay 
                    file={file} 
                    dogSize={breedAnalysis?.size || DogSize.LARGE} // Default to large/human-ish if unknown
                    breedName={breedInput}
                    scene={scene}
                    thought={dogThought}
                    isThinking={isThoughtLoading}
                    onRegenerate={handleRegenerateThought}
                  />
                )}
                
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#8D6E63]/20 py-6 mt-auto bg-[#3E2723] text-[#D7CCC8]">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm font-semibold flex items-center justify-center gap-2">
          <span>Made with</span> <Heart className="w-4 h-4 text-red-400 fill-red-400" /> <span>for dog lovers everywhere.</span>
        </div>
      </footer>

      {/* Global Styles for Animations & Theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        
        body {
           font-family: 'Nunito', sans-serif;
        }

        .text-stroke-brown {
          -webkit-text-stroke: 2px #3E2723;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .bg-radial-gradient-vignette {
            background: radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(62,39,35,0.4) 100%);
        }
      `}</style>
    </div>
  );
};

export default App;