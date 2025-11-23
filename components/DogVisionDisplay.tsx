import React, { useEffect, useRef, useState } from 'react';
import { DogSize, UploadedFile, SceneType } from '../types';
import { RefreshCw } from 'lucide-react';

interface DogVisionDisplayProps {
  file: UploadedFile;
  dogSize: DogSize;
  breedName?: string;
  scene: SceneType;
  thought?: string;
  isThinking?: boolean;
  onRegenerate?: () => void;
}

// --- Detailed Asset Definitions ---

const getAssets = (scene: SceneType) => {
  const skinTone = '#ffdbac'; // Warm beige skin tone

  switch (scene) {
    case SceneType.INDOOR:
      return {
        type: 'SLIPPERS',
        pantsColor: '#fcd34d', // Cute Yellow Pajama pants
        pantLength: 'short', // Reveals ankle
        shoePrimary: '#f9a8d4', // Pink
        shoeSecondary: '#fff', 
        soleColor: '#fce7f3',
        sockColor: '#ffffff', // White fluffy socks
        sockHeight: 'low',
        skinTone,
        texture: 'fluffy'
      };
    case SceneType.SPORT:
      return {
        type: 'RUNNERS',
        pantsColor: '#374151', // Dark Grey leggings
        pantLength: 'cropped', // Capris
        shoePrimary: '#a3e635', // Lime
        shoeSecondary: '#166534', 
        soleColor: '#ffffff',
        sockColor: '#e2e8f0', // Grey sport sock
        sockHeight: 'mid',
        skinTone,
        texture: 'mesh'
      };
    case SceneType.FANCY:
      return {
        type: 'HEELS',
        pantsColor: '#db2777', // Pink Dress/Skirt
        pantLength: 'skirt', 
        shoePrimary: '#dc2626', // Red Heels
        shoeSecondary: '#7f1d1d', 
        soleColor: '#000000',
        sockColor: 'rgba(255,255,255,0.9)', // Cute white ruffle sock
        sockHeight: 'frilly',
        skinTone,
        texture: 'shine'
      };
    case SceneType.CASUAL:
    default:
      return {
        type: 'SNEAKERS',
        pantsColor: '#60a5fa', // Light Jeans
        pantLength: 'rolled', // Rolled up jeans
        shoePrimary: '#3b82f6', // Blue
        shoeSecondary: '#1d4ed8', 
        soleColor: '#f8fafc', 
        sockColor: '#fca5a5', // Pink Patterned Sock
        sockHeight: 'mid',
        skinTone,
        texture: 'canvas'
      };
  }
};

// --- SVG Sub-components ---

const Gradients = () => (
  <defs>
    {/* Leather Shine for Fancy Shoes */}
    <linearGradient id="leatherShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
    </linearGradient>

    {/* Skin Shader */}
    <linearGradient id="skinShade" x1="0%" y1="0%" x2="100%" y2="0%">
       <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
       <stop offset="50%" stopColor="#000" stopOpacity="0" />
       <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
    </linearGradient>

    {/* Drop Shadow */}
    <filter id="softShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dx="2" dy="3" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="offsetblur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// Represents the human leg (skin)
const Leg = ({ color, width = 36 }: { color: string; width?: number }) => (
  <g transform="translate(0, -20)">
    {/* Main Leg Cylinder */}
    <path 
      d={`M-${width/2},-120 L${width/2},-120 L${width/2 - 2},50 L-${width/2 + 2},50 Z`} 
      fill={color} 
    />
    {/* Skin shading */}
    <path 
      d={`M-${width/2},-120 L${width/2},-120 L${width/2 - 2},50 L-${width/2 + 2},50 Z`} 
      fill="url(#skinShade)" 
    />
  </g>
);

// Represents the Sock
const Sock = ({ color, heightType }: { color: string; heightType: string }) => {
  let path = "";
  let frill = null;

  if (heightType === 'low') {
    path = "M-16,40 L16,40 L18,65 L-18,65 Z";
  } else if (heightType === 'frilly') {
    path = "M-17,30 L17,30 L19,65 L-19,65 Z";
    // Ruffles at top
    frill = (
      <path 
        d="M-17,30 Q-12,25 -7,30 Q-2,25 3,30 Q8,25 13,30 Q18,25 17,30" 
        fill="none" 
        stroke={color} 
        strokeWidth="3"
      />
    );
  } else {
    // Mid/Crew
    path = "M-17,10 L17,10 L19,65 L-19,65 Z";
  }

  return (
    <g>
      <path d={path} fill={color} />
      {frill}
      {/* Ribbing texture for socks */}
      <path d={path} fill="url(#skinShade)" opacity="0.1" /> 
    </g>
  );
};

const Pant = ({ color, length }: { color: string; length: string }) => {
  let path = "";
  
  // Coordinate 0,0 is roughly the ankle pivot area in the parent group
  if (length === 'short') {
    // Shorts / Pajama shorts
    path = "M-40,-160 L40,-160 L45,-80 L-45,-80 Z";
  } else if (length === 'skirt') {
    // Skirt flair
    path = "M-35,-160 L35,-160 Q60,-80 70,-60 L-70,-60 Q-60,-80 -35,-160 Z";
  } else if (length === 'cropped') {
    // Leggings
    path = "M-35,-160 L35,-160 L30,-20 L-30,-20 Z";
  } else {
    // Rolled Jeans
    path = "M-40,-160 L40,-160 L38,-30 L-38,-30 Z";
  }

  return (
    <g>
      <path d={path} fill={color} filter="url(#softShadow)"/>
    </g>
  );
};

const RenderShoe = ({ style }: { style: any }) => {
  if (style.type === 'HEELS') {
    return (
      <g transform="translate(0, 10)">
        {/* Heel Spike */}
        <path d="M-25,70 L-20,70 L-15,95 L-22,95 Z" fill={style.shoePrimary} />
        {/* Sole Arch (Shadow) */}
        <path d="M-20,70 Q10,50 50,85 L40,85 Q10,60 -20,70 Z" fill="#000" opacity="0.3" />
        {/* Shoe Body */}
        <path 
          d="M-25,70 Q-25,50 5,50 L50,85 L55,88 L-25,85 Z" 
          fill={style.shoePrimary} 
        />
        {/* Interior/Opening */}
        <path d="M-15,55 Q10,50 30,70" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.2" />
        {/* Shine */}
        <path 
          d="M-10,60 Q10,55 35,80" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.4"
          fill="none"
        />
      </g>
    );
  }
  
  if (style.type === 'RUNNERS' || style.type === 'SNEAKERS') {
    return (
      <g transform="translate(0, 10)">
         {/* Rubber Sole */}
         <path 
           d="M-30,70 C-30,90 80,90 90,75 L90,60 L-30,60 Z" 
           fill={style.soleColor} 
         />
         <path d="M-30,72 L90,72" stroke="#cbd5e1" strokeWidth="2" fill="none" />
         
         {/* Upper Body */}
         <path 
           d="M-28,62 C-28,20 20,20 40,50 L85,62 L-28,62 Z" 
           fill={style.shoePrimary} 
         />
         {/* Toe Cap */}
         <path d="M85,62 L90,62 C95,62 95,75 85,75 L60,75 C70,65 80,62 85,62 Z" fill={style.soleColor} opacity="0.9" />
         
         {/* Details */}
         <path 
           d="M0,60 L30,40 L50,60" 
           stroke={style.shoeSecondary} 
           strokeWidth="6" 
           strokeLinecap="round" 
           fill="none" 
         />
         <path 
           d="M-10,45 L20,45 L-5,50 L25,50" 
           stroke="white" 
           strokeWidth="2" 
           fill="none" 
         />
      </g>
    );
  }

  // Slippers
  return (
    <g transform="translate(0, 15)">
      <path d="M-30,75 Q30,85 90,75 L90,65 Q30,55 -30,65 Z" fill={style.soleColor} />
      <path 
        d="M-30,65 C-30,30 40,30 90,65 L90,75 L-30,75 Z" 
        fill={style.shoePrimary} 
      />
      <ellipse cx="20" cy="55" rx="30" ry="15" fill="#000" opacity="0.2" />
    </g>
  );
};

const OwnerFeetOverlay: React.FC<{ className?: string; scene: SceneType }> = ({ className, scene }) => {
  const style = getAssets(scene);

  return (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <Gradients />
      
      {/* Left Leg Group */}
      <g transform="translate(120, 80) rotate(-5)">
        {/* Layer order: Leg -> Sock -> Shoe -> Pant (Pant covers top of leg) */}
        <Leg color={style.skinTone} />
        <Sock color={style.sockColor} heightType={style.sockHeight || 'mid'} />
        <RenderShoe style={style} />
        <Pant color={style.pantsColor} length={style.pantLength || 'rolled'} />
      </g>

      {/* Right Leg Group */}
      <g transform="translate(240, 90) rotate(8)">
        <Leg color={style.skinTone} />
        <Sock color={style.sockColor} heightType={style.sockHeight || 'mid'} />
        <RenderShoe style={style} />
        <Pant color={style.pantsColor} length={style.pantLength || 'rolled'} />
      </g>
    </svg>
  );
};

export const DogVisionDisplay: React.FC<DogVisionDisplayProps> = ({ 
  file, 
  dogSize, 
  breedName, 
  scene, 
  thought, 
  isThinking,
  onRegenerate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFeet, setShowFeet] = useState(true);

  useEffect(() => {
    if (file.type === 'video' && videoRef.current) {
      videoRef.current.load();
    }
  }, [file]);

  const getVisionConfig = (size: DogSize) => {
    switch (size) {
      case DogSize.SMALL:
        return {
          containerStyle: {
            transform: 'scale(3.5)',
            transformOrigin: 'bottom center',
          },
          feetScale: 'scale-105 origin-bottom-right',
          description: 'Ground level perspective. The world is tall!',
        };
      case DogSize.MEDIUM:
        return {
          containerStyle: {
            transform: 'scale(2.0)',
            transformOrigin: 'bottom center',
          },
          feetScale: 'scale-90 origin-bottom-right',
          description: 'Waist-height perspective.',
        };
      case DogSize.LARGE:
        return {
          containerStyle: {
            transform: 'scale(1.3)',
            transformOrigin: 'bottom center',
          },
          feetScale: 'scale-75 origin-bottom-right',
          description: 'Near human hip-height.',
        };
      default:
        return {
          containerStyle: {},
          feetScale: 'scale-100',
          description: '',
        };
    }
  };

  const config = getVisionConfig(dogSize);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* SVG Filter Definition for Dichromatic Vision */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="dog-vision-filter">
            {/* 
               Scientific Dog Vision Approximation (Dichromacy/Deuteranopia-like):
               - Dogs lack red cones. 
               - Red/Green range is seen as shades of Yellow.
               - Blue is seen as Blue.
               - Matrix Logic:
                 R_out = 0.4*R + 0.6*G  (Red & Green merge to Yellow channel)
                 G_out = 0.4*R + 0.6*G  (Red & Green merge to Yellow channel)
                 B_out = 1.0*B          (Blue is preserved)
                 
                 This preserves the luminance difference (Green is naturally brighter than Red) 
                 while eliminating the hue difference between them.
            */}
            <feColorMatrix
              type="matrix"
              values="0.40 0.60 0     0 0
                      0.40 0.60 0     0 0
                      0    0    1     0 0
                      0    0    0     1 0"
            />
             <feComponentTransfer>
                {/* Adjust brightness/contrast to prevent 'muddy' look while maintaining realism */}
                <feFuncR type="linear" slope="1.05" intercept="0"/>
                <feFuncG type="linear" slope="1.05" intercept="0"/>
             </feComponentTransfer>
             {/* Dogs have lower visual acuity (approx 20/75), so we add a slight blur */}
             <feGaussianBlur stdDeviation={dogSize === DogSize.SMALL ? "1.2" : "0.6"} />
          </filter>
        </defs>
      </svg>

      <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-4 border-[#FFF8E1] group">
        
        {/* Label Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-[#4A3B32]/80 backdrop-blur-md text-[#FFD700] px-4 py-1.5 rounded-full text-sm font-bold border border-[#FFD700]/50 shadow-lg flex items-center gap-2">
          <span className="text-lg">🐶</span> {breedName || 'Dog'} View ({dogSize})
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button 
            onClick={() => setShowFeet(!showFeet)}
            className="bg-[#4A3B32]/80 hover:bg-[#5D4037] backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-[#8D6E63] transition-all font-bold shadow-lg"
          >
            {showFeet ? 'Hide' : 'Show'} Feet
          </button>
        </div>

        <div className="w-full h-full overflow-hidden bg-black flex items-end justify-center relative">
           
           {/* Content Container */}
           <div 
            className="w-full h-full transition-all duration-1000 ease-out origin-bottom will-change-transform"
            style={config.containerStyle}
           >
              {file.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={file.url}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                  style={{ filter: 'url(#dog-vision-filter)' }}
                />
              ) : (
                <img
                  src={file.url}
                  alt="Dog Vision"
                  className="w-full h-full object-cover"
                  style={{ filter: 'url(#dog-vision-filter)' }}
                />
              )}
           </div>
           
           {/* Owner Feet Overlay */}
           {showFeet && (
             <div className={`absolute bottom-[-20px] right-0 md:right-[5%] pointer-events-none transition-transform duration-1000 ease-out z-10 ${config.feetScale}`}>
                <OwnerFeetOverlay scene={scene} className="w-[180px] h-[90px] md:w-[280px] md:h-[140px] opacity-100 drop-shadow-2xl" />
             </div>
           )}

           {/* Vignette */}
           <div className="absolute inset-0 pointer-events-none bg-radial-gradient-vignette mix-blend-multiply opacity-40 z-0"></div>
        </div>
      </div>
      
      {/* AI Thought Bubble */}
      <div className="mt-6 w-full max-w-2xl animate-fade-in">
        {(thought || isThinking) && (
           <div className="relative bg-white p-5 rounded-2xl shadow-md border-2 border-[#A1887F] mb-3 transition-all duration-500 group/bubble hover:shadow-lg">
             {/* Triangle pointer for speech bubble */}
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-[#A1887F] rotate-45 z-0"></div>
             
             <div className="relative z-10 flex gap-3 items-start">
                <div className="text-3xl animate-bounce">💭</div>
                <div className="flex-1">
                  {isThinking ? (
                    <p className="text-[#8D6E63] font-bold italic animate-pulse">
                       Sniffing around... 👃
                    </p>
                  ) : (
                    <p className="text-[#5D4037] font-black text-lg italic leading-snug">
                      "{thought}"
                    </p>
                  )}
                </div>
                {onRegenerate && !isThinking && (
                  <button 
                    onClick={onRegenerate}
                    title="Bark again (Regenerate)"
                    className="p-2 bg-[#EFEBE9] rounded-full hover:bg-[#D7CCC8] hover:rotate-180 transition-all text-[#8D6E63]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
             </div>
           </div>
        )}
        
        <p className="text-[#4A3B32]/70 text-xs font-bold text-center uppercase tracking-wider">
          <span className="text-[#D84315]">Perspective:</span> 
          {dogSize === DogSize.SMALL 
            ? " Low Angle (Macro)" 
            : config.description}
        </p>
      </div>
    </div>
  );
};