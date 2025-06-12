'use client'

import { useState } from 'react'
import { analyzeBase64Image, analyzeImageUrl } from '@/lib/mistral/imageAnalysis'

const ImageAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImageUrl('') // Clear URL when file is selected
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value)
    setSelectedFile(null) // Clear file when URL is entered
  }

  const analyzeImage = async () => {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      if (selectedFile) {
        // Create a temporary URL for the selected file
        const filePath = URL.createObjectURL(selectedFile)
        const result = await analyzeBase64Image(filePath)
        setAnalysis(result)
      } else if (imageUrl) {
        const result = await analyzeImageUrl(imageUrl)
        setAnalysis(result)
      } else {
        setError('Please select an image file or enter an image URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  const testWithSampleImage = async () => {
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setImageUrl('https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-with-snow.jpeg')

    try {
      const result = await analyzeImageUrl('https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-with-snow.jpeg')
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Image Analysis</h2>
      
      {/* Test Button */}
      <button
        onClick={testWithSampleImage}
        disabled={loading}
        className="w-full mb-6 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Test with Sample Image
      </button>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Enter Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeImage}
        disabled={loading || (!selectedFile && !imageUrl)}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
          <p className="text-gray-700">{analysis}</p>
        </div>
      )}

      {/* Preview */}
      {(selectedFile || imageUrl) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl}
            alt="Preview"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
    </div>
  )
}

export default ImageAnalysis 