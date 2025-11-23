import { GoogleGenAI, Type } from "@google/genai";
import { DogSize, BreedAnalysis } from '../types';

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBreedSize = async (breedName: string): Promise<BreedAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Determine the typical size category for a "${breedName}" dog. 
      Classify as SMALL (e.g., Chihuahua, Pug), MEDIUM (e.g., Beagle, Border Collie), or LARGE (e.g., German Shepherd, Great Dane).
      Also estimate typical shoulder height in cm.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            size: {
              type: Type.STRING,
              enum: [DogSize.SMALL, DogSize.MEDIUM, DogSize.LARGE],
              description: "The size category of the dog breed."
            },
            reasoning: {
              type: Type.STRING,
              description: "A short, fun explanation of why it fits this category."
            },
            typicalHeightCm: {
              type: Type.NUMBER,
              description: "Average shoulder height in centimeters."
            }
          },
          required: ["size", "reasoning", "typicalHeightCm"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as BreedAnalysis;
  } catch (error) {
    console.error("Error analyzing breed:", error);
    // Fallback if API fails or rate limits
    return {
      size: DogSize.MEDIUM,
      reasoning: "We couldn't reach our dog database, so we're assuming a happy medium!",
      typicalHeightCm: 40
    };
  }
};

// Helper to convert file to base64 for Gemini
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to extract a frame from a video file for AI analysis
const extractFrameFromVideo = async (videoFile: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    
    // Wait for metadata to load to ensure we can seek
    video.onloadedmetadata = () => {
       // Seek to 0.5s or 10% of duration, whichever is smaller, to get a representative frame
       video.currentTime = Math.min(0.5, video.duration * 0.1); 
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        // Resize to reasonable dimensions for API (max 640px on longest side)
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        URL.revokeObjectURL(url);
        resolve(dataUrl.split(',')[1]); // Remove "data:image/jpeg;base64," header
      } catch (e) {
        console.error("Error extracting video frame:", e);
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
    };
  });
};

const FALLBACK_THOUGHTS = [
  "Woof! I think I see a squirrel... wait, no, just a speck of dust.",
  "I have no idea what this is, but I probably want to eat it.",
  "Can we stop looking at this and go for a walk?",
  "Everything looks very yellow and very interesting today!",
  "Thinking about sausages... please hold."
];

export const generateDogThought = async (breed: string, scene: string, file?: File): Promise<string> => {
  try {
    const parts: any[] = [];
    let visualPromptContext = "";
    
    // Handle Image or Video content for multimodal input
    if (file) {
      if (file.type.startsWith('image/')) {
        const imagePart = await fileToGenerativePart(file);
        parts.push(imagePart);
        visualPromptContext = "Analyze the contents of this image.";
      } else if (file.type.startsWith('video/')) {
        // Extract a frame so the AI can see the video content
        const videoFrame = await extractFrameFromVideo(file);
        if (videoFrame) {
          parts.push({
             inlineData: { data: videoFrame, mimeType: 'image/jpeg' }
          });
          visualPromptContext = "Analyze this frame from the uploaded video.";
        }
      }
    }

    // Improved prompt for richer, "dog-logic" interpretation
    const prompt = `
      You are a ${breed || 'dog'} currently in a ${scene.toLowerCase()} setting.
      ${visualPromptContext}
      
      YOUR TASK:
      Look at the image and translate the Human World into Dog World concepts.
      Write a SINGLE-SENTENCE internal monologue reacting to the scene.
      
      TRANSLATION GUIDE (Use these metaphors):
      - Mountain -> "The Giant Rock I Must Conquer" or "The Sky Pile"
      - City/Street -> "The Loud Canyon" or "The Place With Many Smells"
      - Car -> "The Vroom-Vroom Beast" or "The Window-Head-Stick-Out Machine"
      - Ocean/Lake -> "The Infinite Water Bowl"
      - Sofa -> "The Soft Forbidden Zone"
      - Human -> "The Can Opener" or "My Two-Legged Pillow"
      - Cat -> "The Sharp Alien"
      - Vacuum -> "THE LOUD MONSTER"

      RULES:
      1. Be specific to what is in the image. If you see a mountain, talk about the mountain.
      2. Use humorous, simple, food/play-motivated dog logic.
      3. NO generic "I love my owner" unless the owner is visible in the photo.
      4. Keep it under 25 words.
      5. Do not use quotes in the output.

      EXAMPLES:
      - (Mountain view) "That Giant Sky Rock looks like the perfect place to pee on everything."
      - (City street) "So many metal beasts roaring, but I just want to sniff that lamp post."
      - (Living room) "The Soft Forbidden Zone is calling my name while the Human isn't looking."
    `;
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        temperature: 1.2, // Higher temperature for more variety and humor
        maxOutputTokens: 60,
      }
    });

    return response.text?.trim() || FALLBACK_THOUGHTS[Math.floor(Math.random() * FALLBACK_THOUGHTS.length)];
  } catch (error) {
    console.error("Error generating dog thought:", error);
    return FALLBACK_THOUGHTS[Math.floor(Math.random() * FALLBACK_THOUGHTS.length)];
  }
};