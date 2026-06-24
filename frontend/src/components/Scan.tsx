import { useState, useRef } from 'react';

export default function Scan() {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Refs for the video element and the hidden canvas used to capture the image frame
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

    setLoading(true);
    setScanError(null);
    setAnalysisResult(null);
    
    try {
      const response = await fetch("http://localhost:8000/api/scan", {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-manrope text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-outfit font-bold mb-2">Scan a label or dish.</h2>
        <p className="text-gray-400 text-sm">
          Drop a packaging label photo or snap a picture to instantly analyze ingredients.
        </p>
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
        <div className="mt-8 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 font-manrope">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-outfit font-bold">{analysisResult.name || "Scanned Product"}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              analysisResult.safety_score >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}>
              Score: {analysisResult.safety_score}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Key Ingredients</p>
              <div className="space-y-2">
                {analysisResult.ingredients?.map((ing: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                    <p className="text-sm font-bold text-gray-200">{ing.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ing.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {analysisResult.warnings?.length > 0 && (
              <div>
                <p className="text-xs text-rose-400 uppercase tracking-wider font-semibold mb-2">Warnings</p>
                <div className="space-y-2">
                  {analysisResult.warnings.map((warn: string, idx: number) => (
                    <div key={idx} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs font-semibold">
                      ⚠ {warn}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}