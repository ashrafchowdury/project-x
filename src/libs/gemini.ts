import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { POST_PROPMT } from "@/utils/constant";
import { Prompt } from "@prisma/client";

// constant variables
export const MODEL_NAME = "gemini-1.5-pro-latest";
export const API_KEY = process.env.GEMINI_API_KEY as string;

// configurations
export const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};

export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function gemini(prompt: string, userPrompt: Prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const customUserPrompt = `${userPrompt.prompt}, voice tone have to be ${userPrompt.voice}, ${
    userPrompt.isEmoji && "add emojies end of a sentence if needed"
  }, ${userPrompt.isHashtag && "add 2 hashtag which is most relivent to the post"}, ${
    userPrompt.isFormatPost &&
    "format the post by adding (enter-space) word at the end of the sentence on the content property only and if emojies are avaiable then add it after the emoji"
  }`;

  const parts = [{ text: `input: ${prompt}. ${customUserPrompt}` }, { text: `output: ${POST_PROPMT}` }];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;

  return response.text();
}
