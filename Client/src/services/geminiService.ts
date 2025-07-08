const GEMINI_API_KEY = 'AIzaSyBhkX5KyrYhzs8dtcTVLDH8YHxGzyDGOfg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface CodeAnalysis {
  output: string;
  explanation: string;
}

export const analyzeCode = async (code: string, language: string): Promise<CodeAnalysis> => {
  if (!code.trim()) {
    return {
      output: 'No code provided',
      explanation: 'Please enter some code to analyze.',
    };
  }

  try {
    const prompt = `
Analyze this ${language} code and provide:

1. EXPECTED OUTPUT: What this code would output when executed (if it's executable code). If it's not executable (like HTML/CSS), describe what it would create or display. If there are errors, mention them.

2. EXPLANATION: A brief, clear explanation of how the code works, what each main part does, and any important concepts used.

Please format your response as:
OUTPUT:
[the expected output or result description]

EXPLANATION:
[clear explanation of how the code works]

Here's the code:
\`\`\`${language}
${code}
\`\`\`
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from AI service');
    }

    const text = data.candidates[0]?.content?.parts[0]?.text || '';

    if (!text) {
      throw new Error('Empty response from AI service');
    }

    // Parse the response to extract output and explanation
    const outputMatch = text.match(/OUTPUT:\s*([\s\S]*?)(?=EXPLANATION:|$)/i);
    const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*?)$/i);

    return {
      output: outputMatch ? outputMatch[1].trim() : text.substring(0, 200) + '...',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'AI provided analysis but in unexpected format.',
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        output: 'Network Error: Unable to connect to AI service.',
        explanation: 'Please check your internet connection and try again.',
      };
    }
    
    if (error instanceof Error && error.message.includes('404')) {
      return {
        output: 'API Error: Service endpoint not found.',
        explanation: 'The AI analysis service is currently unavailable. Please try again later.',
      };
    }

    if (error instanceof Error && error.message.includes('401')) {
      return {
        output: 'Authentication Error: Invalid API key.',
        explanation: 'The API key configuration needs to be updated.',
      };
    }

    return {
      output: 'Error: Unable to analyze code.',
      explanation: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    };
  }
};
