'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const generateSpeech = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: '4lOQ7A2l7HPuG7UIHiKA',
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        const errorData = await response.json();
        console.error('Failed to generate speech:', response.status, errorData);
        alert(`Error: ${errorData.error}\nDetails: ${errorData.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.text || '';
        setText(transcribedText);
        
        // If in chat mode, automatically process the voice input
        if (isChatMode && transcribedText.trim()) {
          processVoiceChat(transcribedText);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to transcribe audio:', response.status, errorData);
        alert(`音声認識エラー: ${errorData.error}\n詳細: ${errorData.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('音声認識中にエラーが発生しました。');
    } finally {
      setIsTranscribing(false);
    }
  };

  const processVoiceChat = async (userMessage: string) => {
    setIsProcessingChat(true);
    
    // Add user message to chat history
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, userChatMessage]);

    try {
      // Send to OpenAI API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        const aiResponse = chatData.response;
        
        // Add AI response to chat history
        const aiChatMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, aiChatMessage]);
        
        // Clear input text in chat mode
        setText('');
        
        // Generate speech for AI response
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: aiResponse,
            voice: '4lOQ7A2l7HPuG7UIHiKA',
          }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Auto-play the response
          const audio = new Audio(url);
          audio.play().catch(e => console.log('Auto-play failed:', e));
        }
      } else {
        const errorData = await chatResponse.json();
        console.error('Chat API error:', errorData);
      }
    } catch (error) {
      console.error('Error processing voice chat:', error);
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 sm:p-8">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">{isChatMode ? '🤖' : '🎵'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              {isChatMode ? 'VoiceChat' : 'VoiceStudio'}
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-light">
            {isChatMode ? 'AI-powered voice chatbot with OpenAI' : 'AI-powered speech synthesis & recognition'}
          </p>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mt-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-2 flex gap-2">
              <button
                onClick={() => setIsChatMode(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  !isChatMode 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎵 Studio Mode
              </button>
              <button
                onClick={() => setIsChatMode(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isChatMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🤖 Chat Mode
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat History (Chat Mode Only) */}
        {isChatMode && chatHistory.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Chat History</h3>
              <button
                onClick={() => setChatHistory([])}
                className="ml-auto px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-700/50 text-gray-100 border border-gray-600/50'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {isClient && (
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isProcessingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 text-gray-100 border border-gray-600/50 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                      <span className="text-sm ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Text Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <label className="text-xl font-semibold text-white">
                {isChatMode ? 'Chat Input' : 'Text Input'}
              </label>
            </div>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isChatMode ? "Type your message to the AI chatbot..." : "Enter your text here for AI voice synthesis..."}
              className="w-full p-6 bg-gray-900/70 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-lg resize-none transition-all duration-300 hover:bg-gray-900/90"
              rows={4}
            />
          </div>

          {/* Controls Section */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Voice Input Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`group relative overflow-hidden p-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25' 
                  : isTranscribing
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">
                  {isTranscribing ? '🔄' : isRecording ? '⏹️' : '🎤'}
                </span>
                <span>
                  {isTranscribing ? 'Processing...' : isRecording ? 'Stop Recording' : (isChatMode ? 'Voice Chat' : 'Voice Input')}
                </span>
              </div>
              {!isTranscribing && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>

            {/* Generate Speech / Send Chat Button */}
            <button
              onClick={isChatMode ? () => processVoiceChat(text) : generateSpeech}
              disabled={!text.trim() || isLoading || isProcessingChat}
              className="group relative overflow-hidden p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">
                  {(isLoading || isProcessingChat) ? '⚡' : (isChatMode ? '💬' : '🔊')}
                </span>
                <span>
                  {isLoading ? 'Generating...' : isProcessingChat ? 'Processing...' : (isChatMode ? 'Send Message' : 'Generate Speech')}
                </span>
              </div>
              {!isLoading && !isProcessingChat && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          </div>

          {/* Audio Player Section */}
          {audioUrl && (
            <div className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-gray-600/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎵</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Generated Audio</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <audio
                  controls
                  src={audioUrl}
                  className="w-full h-12 [&::-webkit-media-controls-panel]:bg-gray-800 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">Powered by ElevenLabs AI • Built with Next.js</p>
        </div>
      </div>
    </div>
  );
}
