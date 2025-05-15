import { ExternalLink, Mic, GitBranch, Sparkles, Languages, Zap } from "lucide-react";
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Headerunloged";
import DocsButton from "@/components/DocsButton";

const About: React.FC = () => {
  const { user } = useAuth();
  return (

    <div className="min-h-screen flex flex-col">

    {/* Sticky Header */}
      <Header user={user} />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About SpeechPro</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
              Powered by state-of-the-art AI models including 
              <span className="font-semibold"> Shona ASR Model</span>, 
              providing unmatched speech processing capabilities.
            </p>
            <div className="inline-flex items-center justify-center p-1 rounded-full bg-primary/10 mb-8">
              <span className="px-4 py-1 text-sm font-medium">Cutting-edge speech technology</span>
            </div>
          </div>
        </section>

        {/* Model Information */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="md:w-1/2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-medium text-sm mb-4">
                  <Sparkles className="h-4 w-4" /> AI Model Information
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Shona ASR Model</h2>
                <p className="text-gray-700 mb-6">
                  The Shona ASR Model model represents a significant advancement in speech recognition technology, 
                  especially for the Shona language. This model is adapted from OpenAI's Whisper Large-v2 model and fine-tuned 
                  specifically for Shona language recognition with additional training data and optimizations.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Capabilities</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium block">High Accuracy for Shona</span>
                      <span className="text-gray-600 text-sm">Specialized recognition for Shona language speech patterns and accents</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600">
                      <Languages className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium block">Cross-Lingual Transfer</span>
                      <span className="text-gray-600 text-sm">Maintains strong performance across multiple languages while excelling at Shona</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium block">Contextual Understanding</span>
                      <span className="text-gray-600 text-sm">Enhanced comprehension of linguistic context and cultural nuances</span>
                    </div>
                  </li>
                </ul>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Technical Specifications</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Base Architecture</span>
                      <span className="font-medium">Whisper Large-v2</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Model Size</span>
                      <span className="font-medium">1.5 billion parameters</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Fine-tuning Dataset</span>
                      <span className="font-medium">500+ hours of Shona speech</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Word Error Rate (Shona)</span>
                      <span className="font-medium">~12%</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gray-800 px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="flex-1 text-center">Model Demonstration</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Input Audio (Shona)</h3>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mic className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded-full w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Transcription Output</h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700 mb-2">
                          "Ndinotenda nechirongwa chekuturikidzira nzvimbo yemagetsi. Tinogona kuona kuti zvinoshanda sei."
                        </p>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> 
                          <span>98% confidence</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Translation to English</h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700 mb-2">
                          "Thank you for the program to expand the electricity coverage. We can see how it works."
                        </p>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> 
                          <span>95% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Integration in SpeechPro</h3>
                  <p className="text-gray-700">
                    The Shona ASR Model model powers many of our platform's key features, particularly 
                    enhancing our capabilities for African language processing while maintaining excellent 
                    performance across other languages.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="gap-2">
                      Try It Now <ExternalLink className="h-4 w-4" />
                    </Button>
                    <div className="p-4">
                      <DocsButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Technology Stack */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Powered By Advanced Technologies</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM4.8 12.5l4 4c.1.1.2.1.4.1s.3 0 .4-.1l7.6-7.6c.2-.2.2-.5 0-.7s-.5-.2-.7 0L9 15.6l-3.8-3.8c-.2-.2-.5-.2-.7 0s-.2.5 0 .7z" fill="#4F46E5"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Finetuned Speech Service</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 2h-13A3.5 3.5 0 002 5.5v13A3.5 3.5 0 005.5 22h13a3.5 3.5 0 003.5-3.5v-13A3.5 3.5 0 0018.5 2zm-10 15h-3v-9h3v9zm5 0h-3v-9h3v9zm5 0h-3v-9h3v9z" fill="#4F46E5"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Firebase</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.6 1.5v21l20.8-10.5L1.6 1.5z" fill="#4F46E5"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Finetune Whisper ASR Model</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm-1.4 16.9V5.7l7.4 6.4-7.4 6.3z" fill="#4F46E5"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Ngrok With Flask</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Mic className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">SpeechPro</span>
          </div>
          <p className="mb-4 text-sm">
            Advanced AI speech processing powered by cutting-edge models
          </p>
          <div className="border-t border-gray-800 mt-6 pt-6 text-sm">
            <p>© {new Date().getFullYear()} SpeechPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;