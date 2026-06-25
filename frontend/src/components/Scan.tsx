import { useState, useRef, useMemo } from 'react';
import { SlidersHorizontal, X, Globe, Search as MiniSearch, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ALL_INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Punjabi', 
  'Malayalam', 'Assamese', 'Sanskrit', 'Maithili', 'Santali', 'Kashmiri', 'Konkani', 'Dogri', 'Nepali', 'Sindhi',
  'Manipuri', 'Bodo', 'Tulu', 'Kodava', 'Magahi', 'Bhojpuri', 'Marwari', 'Chhattisgarhi', 'Haryanvi', 'Garhwali',
  'Kumaoni', 'Angika', 'Mundari', 'Khasi', 'Garo', 'Mizo', 'Kokborok', 'Lepcha', 'Sikkimese', 'Bhutia',
  'Mina', 'Bhil', 'Gondi', 'Korku', 'Varli', 'Dravidian', 'Badaga', 'Irula', 'Paniya', 'Kurumba'
];

// UI Component for disabled "Coming Soon" features
const ComingSoonOption = ({ title }: { title: string }) => (
  <div className="relative group w-full">
    <div className="absolute top-0 right-4 -translate-y-1/2 bg-slate-800 text-[9px] font-black px-2 py-1 rounded border border-slate-700 text-emerald-500/80 tracking-tighter z-10">
      COMING SOON
    </div>
    <button className="w-full p-6 bg-slate-900/40 border border-slate-800/60 rounded-4xl text-gray-500 font-bold text-left cursor-default pointer-events-none">
      {title}
    </button>
  </div>
);

interface ScanProps {
  onNavigateToSearch?: () => void;
}

export default function Scan({ onNavigateToSearch }: ScanProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'main' | 'translator' | null>(null);
  const [isSearchingLang, setIsSearchingLang] = useState(false);
  const [langSearchTerm, setLangSearchTerm] = useState('');
  const [showMoreClicks, setShowMoreClicks] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [translatedList, setTranslatedList] = useState<string[] | null>(null);
  
  // Refs for the video element and the hidden canvas used to capture the image frame
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { currentUser, setShowLoginModal } = useAuth();

  // 1. Start the actual webcam stream
  const startCamera = async () => {
    setImage(null);
    setAnalysisResult(null); // Clear previous results when starting new capture
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  // 2. Capture a frame from the live video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match the video stream
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Draw current video frame onto canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas image to base64 string
        const imageDataUrl = canvas.toDataURL('image/png');
        setImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  // 3. Turn off the camera stream when done
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // 4. Handle standard file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null); // Clear previous results when uploading a new file
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 5. Send the base64 image string to your FastAPI backend
  const analyzeImage = async () => {
    if (!image) return;

    if (!currentUser) {
      const scanCount = parseInt(localStorage.getItem('unauthenticatedScanCount') || '0', 10);
      if (scanCount >= 2) {
        setShowLoginModal(true);
        return;
      }
      localStorage.setItem('unauthenticatedScanCount', (scanCount + 1).toString());
    }

    setLoading(true);
    setScanError(null);
    setAnalysisResult(null);
    setTranslatedList(null);
    setActiveModal(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: image }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();

      // Check if Gemini found valid ingredients
      if (data.has_ingredients === false) {
        setScanError(data.error_message || "No ingredients list detected. Please retake the image showing the label clearly.");
      } else {
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error("Error during analysis:", err);
      setScanError("Something went wrong while communicating with the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  // Language filtering logic
  const visibleLanguages = useMemo(() => {
    const filtered = ALL_INDIAN_LANGUAGES.filter(l => 
      l.toLowerCase().includes(langSearchTerm.toLowerCase())
    );
    
    if (isSearchingLang && langSearchTerm !== '') return filtered;
    
    const countToShow = 6 + (showMoreClicks * 10);
    return filtered.slice(0, countToShow);
  }, [showMoreClicks, langSearchTerm, isSearchingLang]);

  const handleTranslate = async (language: string) => {
    if (!analysisResult) return;
    setTranslating(true);
    
    // Flatten names and descriptions into a single array for batch processing
    const textsToTranslate = analysisResult.ingredients.flatMap((i: any) => [i.name, i.description]);
    
    try {
      const response = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_items: textsToTranslate, target_language: language })
      });
      const data = await response.json();
      
      if (data.translations) {
        setTranslatedList(data.translations);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setTranslating(false); 
      setActiveModal(null); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-manrope text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-outfit font-bold mb-2">Scan a label or dish.</h2>
        <p className="text-gray-400 text-sm mb-4">
          Drop a packaging label photo or snap a picture to instantly analyze ingredients.
        </p>
        {onNavigateToSearch && (
          <button 
            onClick={onNavigateToSearch}
            className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-500/30 inline-flex items-center gap-2"
          >
            <MiniSearch className="w-4 h-4" />
            Manual Search for Food Items
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-\[400px\] relative overflow-hidden">
        
        {/* Hidden inputs and canvases */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Condition 1: Live Camera Stream view */}
        {isCameraActive ? (
          <div className="w-full max-w-md flex flex-col items-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-2xl border border-slate-700 bg-black aspect-video object-cover mb-4"
            />
            <div className="flex gap-4">
              <button 
                onClick={capturePhoto} 
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm transition"
              >
                📸 Capture Photo
              </button>
              <button 
                onClick={stopCamera} 
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : image ? (
          /* Condition 2: Captured/Uploaded Image Preview */
          <div className="w-full max-w-md flex flex-col items-center">
            <img 
              src={image} 
              alt="Preview" 
              className="w-full rounded-2xl border border-slate-700 max-h-64 object-contain mb-4"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setImage(null);
                  setAnalysisResult(null);
                  setTranslatedList(null);
                  setActiveModal(null);
                  setIsSearchingLang(false);
                  setLangSearchTerm('');
                  setShowMoreClicks(0);
                }} 
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Clear Photo
              </button>

              {/* (1.) EXACT PASTE LOCATION FOR YOUR ANALYZE BUTTON */}
              <button 
                disabled={loading}
                onClick={analyzeImage}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Ingredients"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Condition 3: Default Empty State */
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl">📤</span>
            </div>
            <p className="text-lg font-semibold mb-6">Upload or capture an image</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={startCamera}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold flex items-center gap-2 border border-slate-700 transition"
              >
                📷 Use Camera
              </button>
              
              <button 
                onClick={triggerFileInput}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-sm font-bold flex items-center gap-2 transition"
              >
                Browse Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* (2.) EXACT PASTE LOCATION FOR YOUR RESULTS DISPLAY CARD */}

      {/* Retake Image Error Message Banner */}
      {scanError && (
        <div className="mt-8 max-w-md mx-auto bg-rose-950/40 border border-rose-800/50 rounded-2xl p-5 text-center font-manrope">
          <div className="text-3xl mb-2">🔍❌</div>
          <h4 className="text-rose-400 font-bold text-base mb-1">Detection Failed</h4>
          <p className="text-gray-300 text-sm mb-4">{scanError}</p>
          <button
            onClick={() => {
              setImage(null);
              setScanError(null);
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
          >
            Clear and Try Again
          </button>
        </div>
      )}

      {/* Your existing {analysisResult && (...)} container goes directly below here */}

      {analysisResult && (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 font-manrope">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-2xl font-outfit font-bold text-white">{analysisResult.name || "Scanned Product"}</h3>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                analysisResult.safety_score >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                Score: {analysisResult.safety_score}
              </span>
              
              <button
                onClick={() => setActiveModal('main')}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-white shadow-md active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Key Ingredients</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.ingredients?.map((ing: any, idx: number) => {
                  const tName = translatedList?.[idx * 2];
                  const tDesc = translatedList?.[idx * 2 + 1];

                  const getSafetyBadgeColor = (safety: string) => {
                    const s = safety?.toLowerCase() || '';
                    if (s.includes('safe')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    if (s.includes('moderate')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  };

                  return (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition duration-150">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="text-sm font-bold text-gray-200">{tName || ing.name}</p>
                        {ing.safety && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${getSafetyBadgeColor(ing.safety)}`}>
                            {ing.safety}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">{tDesc || ing.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {analysisResult.warnings?.length > 0 && (
              <div className="border-t border-slate-800 pt-6">
                <p className="text-xs text-rose-400 uppercase tracking-wider font-semibold mb-3">Warnings</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.warnings.map((warn: string, idx: number) => (
                    <div key={idx} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs font-semibold flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">⚠</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL SYSTEM --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-4xl p-8 relative shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => { setActiveModal(null); setIsSearchingLang(false); }} 
              className="absolute right-8 top-8 text-gray-500 hover:text-white z-20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* MODAL VIEW 1: Main Options */}
            {activeModal === 'main' && (
              <div className="space-y-6 pt-4">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold font-outfit text-white">Options</h2>
                  <p className="text-gray-400 text-sm mt-1">Configure details for {analysisResult?.name || "Scanned Product"}</p>
                </div>
                
                <button 
                  onClick={() => setActiveModal('translator')}
                  className="w-full p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400 font-bold text-left hover:bg-emerald-500/20 transition-all flex justify-between items-center group"
                >
                  Language Translator 
                  <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform text-emerald-400" />
                </button>

                <ComingSoonOption title="Explain Briefly—" />
                <ComingSoonOption title="Manufacturer Details" />
                <ComingSoonOption title="Suggest From This Brand" />
              </div>
            )}

            {/* MODAL VIEW 2: Translator Selection */}
            {activeModal === 'translator' && (
              <div className="flex flex-col max-h-[75vh]">
                <div className="flex items-center justify-between mb-6 h-12">
                  {!isSearchingLang ? (
                    <div className="flex items-center justify-between w-full pr-12">
                      <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-bold font-outfit text-white">Language Translator</h3>
                      </div>
                      <button onClick={() => setIsSearchingLang(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <MiniSearch className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    /* Search Bar inside Modal */
                    <div className="flex items-center w-full gap-3 bg-slate-800/50 rounded-2xl px-4 py-2 border border-slate-700 animate-in fade-in slide-in-from-right-2">
                      <MiniSearch className="w-4 h-4 text-gray-500" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Type to search..."
                        value={langSearchTerm}
                        onChange={(e) => setLangSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-sm py-1 text-white placeholder-gray-500 focus:ring-0"
                      />
                      <button onClick={() => { setIsSearchingLang(false); setLangSearchTerm(''); }} className="text-[10px] text-emerald-500 font-black uppercase tracking-widest whitespace-nowrap">Hide Search</button>
                    </div>
                  )}
                </div>

                {/* English Simplifier (Special Case) */}
                <button 
                  onClick={() => {
                    setTranslatedList(null);
                    setActiveModal(null);
                  }} 
                  className="w-full p-5 mb-4 bg-emerald-500/10 border border-emerald-500/40 rounded-3xl text-emerald-400 font-black text-center hover:bg-emerald-500/20 transition-all"
                >
                  Simplify Ing. (English)
                </button>

                {/* Regional Languages Grid */}
                {translating ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-sm text-gray-400">Translating ingredients...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 gap-3 mb-6">
                    {visibleLanguages.map(lang => (
                      <button 
                        key={lang} 
                        onClick={() => handleTranslate(lang)}
                        className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium hover:border-emerald-500 hover:text-emerald-400 text-left transition-all text-white"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}

                {/* Show More Trigger */}
                {!isSearchingLang && !translating && ALL_INDIAN_LANGUAGES.length > visibleLanguages.length && (
                  <button 
                    onClick={() => setShowMoreClicks(prev => prev + 1)}
                    className="w-full py-4 text-emerald-500 text-xs font-black hover:text-emerald-400 transition-colors border-t border-slate-800 tracking-[0.2em]"
                  >
                    SHOW MORE LANGUAGES
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}