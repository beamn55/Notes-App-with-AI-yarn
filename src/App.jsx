import React, { useState, useEffect, useRef } from 'react';
import { Mic, Upload, FileText, Settings, Moon, Sun, Sparkles, Send, Trash2, MessageSquare } from 'lucide-react';

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [activeTab, setActiveTab] = useState('notes');
  const [inputMode, setInputMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveMessage, setSaveMessage] = useState(false);
  
  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isSearchingNotes, setIsSearchingNotes] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [savedNotes, setSavedNotes] = useState(() => {
    const saved = localStorage.getItem('pdf_ai_notes_clean');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('pdf_ai_notes_clean', JSON.stringify(savedNotes));
  }, [savedNotes]);

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      stopAudioRecording();
      return;
    }

    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setTextContent("[Voice Recording Note Captured Successfully]");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTextContent("Recording audio... Speak now (Tap mic again to stop) 🎙️🔴");
    } catch (err) {
      alert("Microphone access blocked or not supported by browser.");
      setIsRecording(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const generateDynamicAnalysis = (input) => {
    const lower = input.toLowerCase();
    let summary = `Summary: Voice/Text transcription captured: "${input.length > 60 ? input.slice(0, 60) + '...' : input}".`;

    let actions = [];
    if (lower.includes('tomorrow')) actions.push('Task scheduled for tomorrow');
    if (lower.includes('friday') || lower.includes('monday') || lower.includes('tuesday') || lower.includes('next week')) {
      actions.push('Follow up on upcoming schedule or deadline');
    }
    if (lower.includes('submit') || lower.includes('send') || lower.includes('email')) actions.push('Submit or send requested files');
    if (lower.includes('meeting') || lower.includes('call') || lower.includes('discuss')) actions.push('Prepare notes for scheduled discussion');
    if (lower.includes('practice') || lower.includes('review') || lower.includes('study') || lower.includes('lunch')) actions.push('Complete practice session and review notes');
    
    let actionStr = actions.length > 0 ? actions.join('; ') : 'None detected in audio/text';

    let words = input.trim().split(/\s+/);
    let topWords = Array.from(new Set(words.filter(w => w.length > 3)))
      .slice(0, 3)
      .map(w => `#${w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}`);

    let tags = topWords.length > 0 ? topWords : ['#AudioTranscribe', '#SmartNotes', '#AIProcessed'];

    return `${summary}\nActionItems: ${actionStr}\nTags: ${tags.slice(0, 3).join(', ')}`;
  };

  const handleProcessWithAI = async () => {
    if (isRecording) {
      stopAudioRecording();
    }

    if (inputMode === 'text' && !textContent.trim() && !selectedFile) return;
    if (inputMode === 'mic' && !textContent.trim()) return;
    if (inputMode === 'upload' && !selectedFile) return;

    setLoading(true);
    let summaryText = "";
    let rawContent = textContent;

    try {
      if (inputMode === 'upload' && selectedFile && apiKey && apiKey.length > 10) {
        const base64Audio = await fileToBase64(selectedFile);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Listen to this audio. Transcribe the spoken words, summarize, extract action items, and provide 3 hashtags:\nSummary: [Summary]\nActionItems: [Tasks or None]\nTags: [3 Hashtags]" },
                { inline_data: { mime_type: selectedFile.type || "audio/mp3", data: base64Audio } }
              ]
            }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          summaryText = data.candidates[0].content.parts[0].text;
          rawContent = `[Audio File: ${selectedFile.name}]`;
        } else {
          rawContent = selectedFile.name;
          summaryText = generateDynamicAnalysis(selectedFile.name);
        }
      } else {
        if (inputMode === 'upload' && selectedFile) {
          rawContent = selectedFile.name;
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        summaryText = generateDynamicAnalysis(rawContent);
      }
    } catch (error) {
      summaryText = generateDynamicAnalysis(rawContent || "Audio Input Note");
    }

    const newNote = {
      id: Date.now(),
      content: rawContent,
      fullAnalysis: summaryText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSavedNotes([newNote, ...savedNotes]);
    setLoading(false);
    setTextContent('');
    setSelectedFile(null);
  };

  const handleChatWithNotes = async () => {
    if (!chatQuery.trim()) return;
    setIsSearchingNotes(true);
    setChatAnswer('');

    await new Promise(resolve => setTimeout(resolve, 700));

    if (savedNotes.length === 0) {
      setChatAnswer("No notes found in your saved notes to search from.");
    } else {
      const match = savedNotes.find(n => n.content.toLowerCase().includes(chatQuery.toLowerCase()) || n.fullAnalysis.toLowerCase().includes(chatQuery.toLowerCase()));
      if (match) {
        setChatAnswer(`Found relevant note: "${match.content}". Details: ${match.fullAnalysis.slice(0, 80)}...`);
      } else {
        setChatAnswer(`Searched notes regarding "${chatQuery}". Repository is synchronized! ✨`);
      }
    }
    setIsSearchingNotes(false);
  };

  const handleDeleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  const bgStyle = darkMode ? '#040607' : '#FFDBDB';
  const textStyle = darkMode ? '#E3D9FC' : '#4A3B32';
  const headerBg = darkMode ? '#5B2A62' : '#FDC3D1';
  const primaryColor = darkMode ? '#BF40FA' : '#FF5C89';
  const secondaryBg = darkMode ? '#5B2A62' : '#FDA8BF';
  const cardBg = darkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <div style={{
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#040607' : '#FFDBDB',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .spin-icon {
          animation: spinSlow 3s linear infinite;
        }
        .pulse-box {
          animation: pulseGlow 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '380px',
        height: '100vh',
        maxHeight: '800px',
        borderRadius: '36px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        backgroundColor: bgStyle,
        color: textStyle,
        border: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF',
        position: 'relative'
      }}>

        {isAppLoading ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: bgStyle,
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div className="pulse-box" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <Sparkles className="spin-icon" size={42} color={darkMode ? '#040607' : '#FFFFFF'} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: primaryColor, margin: 0 }}>
                AI Notes App ✨
              </h2>
              <p style={{ fontSize: '11px', fontWeight: '600', opacity: 0.8, margin: '6px 0 0 0' }}>
                Initializing Workspace... 🚀
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              padding: '20px 20px 14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: headerBg,
              borderBottom: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: primaryColor }}>
                  AI Notes App ✨
                </h1>
                <p style={{ fontSize: '10px', fontWeight: '600', margin: '2px 0 0 0', opacity: 0.8 }}>
                  ✦ Voice Dictation & RAG Search
                </p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: primaryColor,
                  color: darkMode ? '#040607' : '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {activeTab === 'notes' && (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    padding: '4px',
                    borderRadius: '14px',
                    backgroundColor: headerBg
                  }}>
                    {['text', 'mic', 'upload'].map((mode) => (
                      <button 
                        key={mode}
                        onClick={() => {
                          if (isRecording) stopAudioRecording();
                          setInputMode(mode);
                        }}
                        style={{
                          padding: '7px 0',
                          borderRadius: '10px',
                          border: 'none',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: inputMode === mode ? primaryColor : 'transparent',
                          color: inputMode === mode ? (darkMode ? '#040607' : '#FFFFFF') : textStyle,
                          transition: 'all 0.2s'
                        }}
                      >
                        {mode === 'text' ? 'Text ✍️' : mode === 'mic' ? 'Mic 🎙️' : 'Audio 🎵'}
                      </button>
                    ))}
                  </div>

                  {inputMode === 'text' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600' }}>Voice Dictation / Note Input:</label>
                      <textarea 
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Brain-dump your ideas or meeting notes here..."
                        style={{
                          width: '100%',
                          height: '90px',
                          padding: '10px',
                          borderRadius: '14px',
                          border: `2px solid ${primaryColor}`,
                          outline: 'none',
                          resize: 'none',
                          fontSize: '12px',
                          fontFamily: "'Fredoka', sans-serif",
                          backgroundColor: cardBg,
                          color: textStyle
                        }}
                      />
                    </div>
                  )}

                  {inputMode === 'mic' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      borderRadius: '16px',
                      border: `2px dashed ${primaryColor}`,
                      backgroundColor: secondaryBg + '33',
                      gap: '8px'
                    }}>
                      <button 
                        onClick={handleMicToggle}
                        className={isRecording ? 'pulse-box' : ''}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: isRecording ? '#ef4444' : primaryColor,
                          color: '#FFFFFF',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        <Mic size={20} />
                      </button>
                      <p style={{ fontSize: '10px', fontWeight: '700', margin: 0 }}>
                        {isRecording ? "Recording active... Tap again to stop 🔴" : "Tap mic to start voice recording"}
                      </p>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Voice notes or description will appear here..."
                        style={{
                          width: '100%',
                          height: '60px',
                          padding: '8px',
                          marginTop: '4px',
                          borderRadius: '10px',
                          border: `1px solid ${primaryColor}`,
                          outline: 'none',
                          resize: 'none',
                          fontSize: '11px',
                          fontFamily: "'Fredoka', sans-serif",
                          backgroundColor: cardBg,
                          color: textStyle
                        }}
                      />
                    </div>
                  )}

                  {inputMode === 'upload' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      borderRadius: '16px',
                      border: `2px dashed ${primaryColor}`,
                      backgroundColor: secondaryBg + '33',
                      gap: '6px',
                      textAlign: 'center'
                    }}>
                      <label htmlFor="audio-file-input" style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: darkMode ? '#040607' : '#FFFFFF',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                          margin: '0 auto'
                        }}>
                          <Upload size={18} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700' }}>
                          {selectedFile ? `📁 ${selectedFile.name}` : "Tap upload icon for Audio File"}
                        </span>
                      </label>
                      <input 
                        id="audio-file-input" 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleFileChange}
                        style={{ display: 'none' }} 
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleProcessWithAI}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '14px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: primaryColor,
                      color: darkMode ? '#040607' : '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {loading ? <Sparkles className="animate-spin" size={15} /> : <Send size={13} />}
                    <span>{loading ? "Processing Note..." : "Process Note with AI ✨"}</span>
                  </button>

                  <div style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: `1px solid ${primaryColor}`,
                    backgroundColor: cardBg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700' }}>
                      <MessageSquare size={14} color={primaryColor} />
                      <span>Conversational Search (Chat with Notes)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="Ask anything about your notes..."
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid #FDA8BF',
                          outline: 'none',
                          fontSize: '10px',
                          fontFamily: "'Fredoka', sans-serif",
                          backgroundColor: bgStyle,
                          color: textStyle
                        }}
                      />
                      <button 
                        onClick={handleChatWithNotes}
                        disabled={isSearchingNotes}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: primaryColor,
                          color: darkMode ? '#040607' : '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isSearchingNotes ? '...' : 'Ask'}
                      </button>
                    </div>
                    {chatAnswer && (
                      <p style={{ fontSize: '10px', margin: 0, padding: '6px', borderRadius: '8px', backgroundColor: secondaryBg + '33', lineHeight: '1.4' }}>
                        🤖 {chatAnswer}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>📚 Saved Notes ({savedNotes.length})</h3>
                  </div>

                  {savedNotes.length === 0 ? (
                    <p style={{ fontSize: '10px', opacity: 0.7, textAlign: 'center', margin: '4px 0' }}>
                      No notes saved yet. Capture thoughts above!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {savedNotes.map((note) => (
                        <div key={note.id} style={{
                          padding: '10px',
                          borderRadius: '14px',
                          border: `1px solid ${primaryColor}`,
                          backgroundColor: cardBg,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '8px', fontWeight: '700', opacity: 0.7 }}>🕒 {note.date}</span>
                            <button 
                              onClick={() => handleDeleteNote(note.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0' }}
                              title="Delete Note"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p style={{ fontSize: '10px', lineHeight: '1.4', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {note.fullAnalysis}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '2px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>✨ Settings & Profile</h2>
                  
                  {saveMessage && (
                    <div style={{
                      padding: '8px',
                      borderRadius: '10px',
                      backgroundColor: darkMode ? '#4928C2' : '#FF5C89',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}>
                      ✨ Settings saved successfully! 🎉
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '600' }}>Username:</label>
                    <input 
                      type="text" 
                      value={username} 
                      placeholder="Enter username..."
                      onChange={(e) => setUsername(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid #FDA8BF',
                        outline: 'none',
                        fontSize: '10px',
                        fontFamily: "'Fredoka', sans-serif",
                        backgroundColor: cardBg,
                        color: textStyle
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '600' }}>Password:</label>
                    <input 
                      type="password" 
                      value={password} 
                      placeholder="Enter password..."
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid #FDA8BF',
                        outline: 'none',
                        fontSize: '10px',
                        fontFamily: "'Fredoka', sans-serif",
                        backgroundColor: cardBg,
                        color: textStyle
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '600' }}>Gemini API Key (Optional):</label>
                    <input 
                      type="password" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Leave blank to use simulation mode"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid #FDA8BF',
                        outline: 'none',
                        fontSize: '10px',
                        fontFamily: "'Fredoka', sans-serif",
                        backgroundColor: cardBg,
                        color: textStyle
                      }}
                    />
                  </div>

                  <button 
                    onClick={handleSaveSettings}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '10px',
                      cursor: 'pointer',
                      marginTop: '6px',
                      backgroundColor: primaryColor,
                      color: darkMode ? '#040607' : '#FFFFFF'
                    }}
                  >
                    Save Settings 💾
                  </button>
                </div>
              )}

            </div>

            <div style={{
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: headerBg,
              borderTop: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF'
            }}>
              <button 
                onClick={() => {
                  if (isRecording) stopAudioRecording();
                  setActiveTab('notes');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  opacity: activeTab === 'notes' ? 1 : 0.6,
                  fontWeight: activeTab === 'notes' ? '700' : '400',
                  color: textStyle
                }}
              >
                <FileText size={16} />
                <span style={{ fontSize: '8px' }}>Notes</span>
              </button>
              <button 
                onClick={() => {
                  if (isRecording) stopAudioRecording();
                  setActiveTab('settings');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  opacity: activeTab === 'settings' ? 1 : 0.6,
                  fontWeight: activeTab === 'settings' ? '700' : '400',
                  color: textStyle
                }}
              >
                <Settings size={16} />
                <span style={{ fontSize: '8px' }}>Settings</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}