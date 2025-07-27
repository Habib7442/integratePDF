import { GoogleGenAI, Type } from "@google/genai"
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Google Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable not set")
  }
  return new GoogleGenAI({ apiKey })
}

// Initialize Supabase client with service role key for server-side operations
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Response schema for Gemini AI
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    fileName: {
      type: Type.STRING,
      description: "The name of the source file, as provided in the prompt."
    },
    extractedKeywords: {
      type: Type.ARRAY,
      description: "An array of the keywords that were used for the search. Should be an empty array if no keywords were provided.",
      items: {
        type: Type.STRING
      }
    },
    structuredData: {
      type: Type.ARRAY,
      description: "The structured data extracted from the document, as key-value pairs.",
      items: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: "The label or key for the extracted piece of information (e.g., 'Invoice Number', 'Total Amount', 'Client Name')."
          },
          value: {
            type: Type.STRING,
            description: "The corresponding value for the key."
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0 and 1 for this extraction."
          }
        },
        required: ["key", "value", "confidence"]
      }
    }
  },
  required: ["fileName", "extractedKeywords", "structuredData"]
}

export interface ExtractedData {
  fileName: string
  extractedKeywords: string[]
  structuredData: Array<{
    key: string
    value: string
    confidence: number
  }>
}

export const extractDataFromPDF = async (
  fileName: string,
  mimeType: string,
  fileData: string, // base64 encoded string
  keywords: string = ''
): Promise<ExtractedData> => {
  const ai = getGeminiClient()
  
  const prompt = `
    You are an advanced data extraction engine for a SaaS tool called 'PDF Workflow Rocket'.
    Your primary task is to meticulously analyze the provided document and extract structured information from it.

    The document to analyze is provided as a file part in this request.

    The user has specified the following keywords for targeted extraction: "${keywords || 'None'}".
    If keywords are provided, prioritize finding data points corresponding to these keywords.
    If no keywords are provided ('None'), perform a comprehensive extraction of all salient key-value pairs you can identify in the document (e.g., invoice numbers, dates, names, addresses, line items, totals, etc.).

    Your output must be a JSON object that adheres to the provided schema.
    - The "fileName" field in your JSON response must be exactly: "${fileName}".
    - The "extractedKeywords" field should be an array of strings based on the user's comma-separated input: "${keywords}". If the input string is empty, the array should be empty.
    - The "structuredData" field should contain the key-value pairs you extract from the document content.
    - For each extracted data point, provide a confidence score between 0 and 1 indicating how certain you are about the extraction.
  `

  const filePart = {
    inlineData: {
      mimeType: mimeType,
      data: fileData,
    },
  }

  const textPart = {
    text: prompt,
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, filePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    })

    const jsonString = response.text.trim()
    const parsedData = JSON.parse(jsonString) as ExtractedData
    return parsedData

  } catch (error) {
    console.error("Error extracting data with Gemini:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to process document: ${error.message}`)
    }
    throw new Error("An unknown error occurred while processing the document.")
  }
}

export const saveExtractedDataToDatabase = async (
  documentId: string,
  clerkUserId: string, // This is the Clerk user ID
  extractedData: ExtractedData
) => {
  const supabase = getSupabaseServiceClient()

  try {
    // Get the user's database ID from Clerk user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !userData) {
      throw new Error(`User not found for Clerk ID: ${clerkUserId}`)
    }

    // Prepare data for insertion
    const dataToInsert = extractedData.structuredData.map(item => ({
      document_id: documentId,
      user_id: userData.id,
      field_key: item.key,
      field_value: item.value,
      data_type: 'string', // Default to string, can be enhanced later
      confidence: item.confidence,
      extraction_method: 'gemini',
      is_corrected: false,
    }))

    // Insert extracted data
    const { error: insertError } = await supabase
      .from('extracted_data')
      .insert(dataToInsert)

    if (insertError) {
      throw new Error(`Failed to save extracted data: ${insertError.message}`)
    }

    // Update document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        processing_status: 'completed',
        processing_completed_at: new Date().toISOString(),
        confidence_score: extractedData.structuredData.reduce((avg, item) => avg + item.confidence, 0) / extractedData.structuredData.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Failed to update document status: ${updateError.message}`)
    }

    return { success: true, extractedCount: dataToInsert.length }

  } catch (error) {
    console.error('Error saving extracted data:', error)
    
    // Update document with error status
    await supabase
      .from('documents')
      .update({
        processing_status: 'failed',
        processing_completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    throw error
  }
}
