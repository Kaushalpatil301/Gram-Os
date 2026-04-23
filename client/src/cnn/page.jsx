import React, { useState } from "react"
import { Camera, Zap, AlertCircle } from "lucide-react"

export default function CropDetector() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0]
    setFile(selectedFile)
    setResult(null)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile))
      
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setResult({
        disease: "Apple Scab",
        confidence: 92.5
      })
      
      setLoading(false)
    } else {
      setPreviewUrl(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Upload Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8 text-center mb-8 hover:shadow-xl transition-shadow">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Crop Disease Detection</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Upload an image of your crop to get instant disease analysis
          </p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg inline-flex items-center justify-center">
              <Camera className="mr-3 h-6 w-6" />
              Choose Image
            </div>
          </label>
        </div>

        {/* Results Section */}
        {previewUrl && (
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Image Display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Camera className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Uploaded Image</h3>
              </div>
              
              <div className="rounded-xl overflow-hidden bg-gray-50 border border-emerald-50">
                <img
                  src={previewUrl}
                  alt="Crop"
                  className="w-full h-80 object-contain"
                />
              </div>
            </div>

            {/* Detection Results */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Detection Results</h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your crop image...</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Disease Card */}
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Disease Detected</h4>
                        <p className="text-2xl font-bold text-red-600">{result.disease}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Confidence Card */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Confidence Level</h4>
                        <p className="text-sm text-gray-600">Analysis accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-600">{result.confidence}%</p>
                        <p className="text-sm text-emerald-700 font-medium">High Confidence</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-xl text-base font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
                  >
                    Analyze Another Image
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                  <p className="text-gray-600">Results will appear here after analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
