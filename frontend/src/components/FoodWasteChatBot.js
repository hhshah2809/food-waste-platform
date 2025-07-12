import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import BackgroundWrapper from "./BackgroundWrapper";
import { Mic, MicOff, Send, Leaf } from "lucide-react";

const FoodWasteChatBot = () => {
  const API_KEY = "AIzaSyBIGS5PNUCNi6l8Fcy-0SXX01ZSvhuNVtM"; // 🔐 Direct use for local testing only

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en-US");

  const chatEndRef = useRef(null);
  const typingInterval = 30;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error("SpeechRecognition API not supported in this browser.");
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en-US" ? "hi-IN" : "en-US"));
  };

  const handleStart = () => {
    if (recognition && !isListening) {
      try {
        recognition.lang = language;
        recognition.start();
        setIsListening(true);

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            setMediaStream(stream);
          })
          .catch((err) => {
            console.error("Failed to access microphone:", err);
          });
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  const handleStop = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      handleSendMessage(input);

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }
  };

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const handleSendMessage = async (message) => {
    if (message.trim() === "") return;

    setChatLog((prevLog) => [...prevLog, { sender: "You", message }]);
    setInput("");
    setIsLoading(true);

    try {
      const prompt =
        language === "hi-IN"
          ? `कृपया भोजन अपशिष्ट प्रबंधन, पुन: उपयोग, दान या पर्यावरण पर इसके प्रभाव के बारे में संरचित उत्तर दें: ${message}`
          : `Please give a structured response related to food waste, reuse, donation, or its environmental impact: ${message}`;

      const result = await model.generateContent(prompt);
      let ans = await result.response.text();
      ans = ans.replace(/[#*]/g, "");
      setIsLoading(false);

      setChatLog((prevLog) => [...prevLog, { sender: "AgroAI", message: "" }]);

      let index = 0;
      const intervalId = setInterval(() => {
        setChatLog((prevLog) => {
          const newLog = [...prevLog];
          newLog[newLog.length - 1].message += ans.charAt(index);
          return newLog;
        });

        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        index++;
        if (index >= ans.length) clearInterval(intervalId);
      }, typingInterval);
    } catch (err) {
      console.error("Error generating response:", err);
      setIsLoading(false);
      setChatLog((prevLog) => [
        ...prevLog,
        { sender: "AgroAI", message: "Sorry, I couldn't process that. Try again!" },
      ]);
    }
  };

  return (
    <BackgroundWrapper>
      <div className="flex flex-col w-full h-full max-w-4xl mx-auto px-4 py-6">
        {/* Decorative Leafs */}
        <div className="absolute top-0 left-0 opacity-30">
          <Leaf className="w-24 h-24 text-green-300" />
        </div>
        <div className="absolute bottom-0 right-0 opacity-30">
          <Leaf className="w-24 h-24 text-green-300 rotate-180" />
        </div>

        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Chat with AgroAI 🌱</h2>
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-green-200 text-sm">
              {language === "en-US" ? "English" : "हिंदी"}
            </span>
            <button
              onClick={toggleLanguage}
              className="h-6 w-11 bg-green-900 rounded-full flex items-center p-1"
            >
              <span
                className={`h-4 w-4 bg-white rounded-full transition-transform ${
                  language === "hi-IN" ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto bg-green-50/10 border border-green-400
                     rounded-lg p-4 backdrop-blur-sm mb-4"
        >
          {chatLog.length === 0 ? (
            <div className="text-green-300 text-center">
              Ask me anything about food waste donation, plant care, or how to reduce food waste.
            </div>
          ) : (
            chatLog.map((entry, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${entry.sender === "You" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[75%] ${
                    entry.sender === "You"
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-green-100 text-green-900 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{entry.sender}</p>
                  <p className="whitespace-pre-wrap">{entry.message}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="text-green-400 text-sm">AgroAI is typing...</div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input + Mic */}
        <div className="flex items-center space-x-2">
          <button
            onClick={isListening ? handleStop : handleStart}
            className={`p-3 rounded-full ${
              isListening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-green-200 text-green-800 hover:bg-green-300"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            placeholder="Ask about food donation, reuse, composting..."
            className="flex-1 px-4 py-3 bg-green-800/10 text-white placeholder-green-300 border border-green-400 rounded-full outline-none"
          />

          <button
            onClick={() => handleSendMessage(input)}
            disabled={input.trim() === ""}
            className={`p-3 rounded-full ${
              input.trim() === ""
                ? "bg-green-700 text-green-300"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default FoodWasteChatBot;
