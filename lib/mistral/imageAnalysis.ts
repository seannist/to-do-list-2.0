import { Mistral } from '@mistralai/mistralai'

// Debug API key loading
const apiKey = "DPFHktbT8jYG2hNu0t3sn0s1xzuMJezz"
console.log('API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No')

if (!apiKey) {
  console.error('Mistral API key is not set')
}

const client = new Mistral({ apiKey })

export async function analyzeBase64Image(imagePath: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key is not configured')
    }

    // Convert image to base64
    const response = await fetch(imagePath)
    const blob = await response.blob()
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })

    console.log('Sending request to Mistral API...')
    // Send to Mistral API
    const result = await client.chat.complete({
      model: 'pixtral-12b',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What\'s in this image?'
            },
            {
              type: 'image_url',
              imageUrl: base64
            }
          ]
        }
      ]
    })

    const content = result.choices[0]?.message?.content
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response content')
    }
    return content
  } catch (error) {
    console.error('Error analyzing image:', error)
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        throw new Error('Invalid or missing Mistral API key. Please check your environment variables.')
      }
      throw error
    }
    throw new Error('Failed to analyze image')
  }
}

export async function analyzeImageUrl(imageUrl: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key is not configured')
    }

    console.log('Sending request to Mistral API...')
    // Send to Mistral API
    const result = await client.chat.complete({
      model: 'pixtral-12b',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What\'s in this image?'
            },
            {
              type: 'image_url',
              imageUrl: imageUrl
            }
          ]
        }
      ]
    })

    const content = result.choices[0]?.message?.content
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response content')
    }
    return content
  } catch (error) {
    console.error('Error analyzing image:', error)
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        throw new Error('Invalid or missing Mistral API key. Please check your environment variables.')
      }
      throw error
    }
    throw new Error('Failed to analyze image')
  }
} 