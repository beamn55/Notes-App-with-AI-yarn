import React, { useState, useEffect } from 'react';
import { Mic, Upload, FileText, Settings, Moon, Sun, Sparkles, Send, CheckCircle2, Trash2 } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Kunin ang API key mula sa localStorage kung meron na, o gamitin ang default
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6JSxDlxoNh-CTJEAIgn1Al5m5HPV0pOdoPp2z1fkSkrYg';
  });

  const [activeTab, setActiveTab] = useState('notes');
  const [inputMode, setInputMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [saveMessage, setSaveMessage] = useState(false);
  
  const [savedNotes, setSavedNotes] = useState(() => {
    const saved = localStorage.getItem('my_ai_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // I-save ang notes sa localStorage tuwing may magbabago
  useEffect(() => {
    localStorage.setItem('my_ai_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  const handleProcessWithAI = async () => {
    const currentInput = textContent || selectedFileName;
    if (!currentInput) return;
    setLoading(true);
    setResult(null);

    let summaryText = "";
    let tagsList = ["AIProcessed", "SmartNotes"];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following note text in English, Tagalog, or Taglish and provide:
              1. Summary: A clear and concise summary of the main points.
              2. Tags: 2 to 3 relevant tags separated by commas.
              
              Note content: "${currentInput}"`
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        summaryText = data.candidates[0].content.parts[0].text;
      } else {
        summaryText = "Error processing with AI. Please check your API key in Settings.";
        tagsList = ["Error"];
      }
    } catch (error) {
      summaryText = "Network connection error occurred.";
      tagsList = ["Error"];
    }

    const newNote = {
      id: Date.now(),
      content: currentInput,
      summary: summaryText,
      tags: tagsList,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSavedNotes([newNote, ...savedNotes]);
    setResult(newNote);
    setLoading(false);
    setTextContent('');
    setSelectedFileName('');
  };

  const handleDeleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleSaveSettings = () => {
    // I-save ang API key sa localStorage ng browser
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
      `}</style>
      
      {/* Mobile Frame Container */}
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
        border: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF'
      }}>
        
        {/* Top Header */}
        <div style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: headerBg,
          borderBottom: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: primaryColor }}>
              AI Notes App ✨
            </h1>
            <p style={{ fontSize: '11px', fontWeight: '600', margin: '4px 0 0 0', opacity: 0.8 }}>
              ✦ Mobile Workspace
            </p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: primaryColor,
              color: darkMode ? '#040607' : '#FFFFFF',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {activeTab === 'notes' && (
            <>
              {/* Input Mode Selector */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                padding: '6px',
                borderRadius: '16px',
                backgroundColor: headerBg
              }}>
                {['text', 'mic', 'upload'].map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    style={{
                      padding: '8px 0',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '11px',
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

              {/* Dynamic Input Component */}
              {inputMode === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600' }}>Type your note below:</label>
                  <textarea 
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Example: Meeting notes about project deployment..."
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '12px',
                      borderRadius: '16px',
                      border: `2px solid ${primaryColor}`,
                      outline: 'none',
                      resize: 'none',
                      fontSize: '13px',
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
                  padding: '24px',
                  borderRadius: '20px',
                  border: `2px dashed ${primaryColor}`,
                  backgroundColor: secondaryBg + '33',
                  gap: '10px'
                }}>
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: isRecording ? '#ef4444' : primaryColor,
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Mic size={22} />
                  </button>
                  <p style={{ fontSize: '11px', fontWeight: '700', margin: 0 }}>
                    {isRecording ? "Recording voice note... 🔴" : "Tap to record audio note"}
                  </p>
                </div>
              )}

              {inputMode === 'upload' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  borderRadius: '20px',
                  border: `2px dashed ${primaryColor}`,
                  backgroundColor: secondaryBg + '33',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <label htmlFor="audio-file-input" style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: darkMode ? '#040607' : '#FFFFFF',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      margin: '0 auto'
                    }}>
                      <Upload size={22} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>
                      {selectedFileName ? `📁 ${selectedFileName}` : "Tap upload icon to select audio"}
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

              {/* Action Button */}
              <button 
                onClick={handleProcessWithAI}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: primaryColor,
                  color: darkMode ? '#040607' : '#FFFFFF',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                }}
              >
                {loading ? <Sparkles className="animate-spin" size={16} /> : <Send size={14} />}
                <span>{loading ? "Analyzing with Gemini AI..." : "Process & Save Note 💖"}</span>
              </button>

              {/* Saved Notes Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>📚 Saved Notes ({savedNotes.length})</h3>
              </div>

              {/* List of Saved Notes */}
              {savedNotes.length === 0 ? (
                <p style={{ fontSize: '11px', opacity: 0.7, textAlign: 'center', margin: '8px 0' }}>
                  No saved notes yet. Create one above! ✨
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedNotes.map((note) => (
                    <div key={note.id} style={{
                      padding: '12px',
                      borderRadius: '16px',
                      border: `1px solid ${primaryColor}`,
                      backgroundColor: cardBg,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.7 }}>🕒 {note.date}</span>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', lineHeight: '1.4', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {note.summary}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                        {note.tags.map((tag, idx) => (
                          <span key={idx} style={{
                            fontSize: '8px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: secondaryBg,
                            color: darkMode ? '#E3D9FC' : '#4A3B32'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>✨ Settings & Profile</h2>
              
              {saveMessage && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: darkMode ? '#4928C2' : '#FF5C89',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                  ✨ Settings saved successfully, Bestie! 🎉
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Username:</label>
                <input 
                  type="text" 
                  value={username} 
                  placeholder="Enter your username..."
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid #FDA8BF',
                    outline: 'none',
                    fontSize: '11px',
                    fontFamily: "'Fredoka', sans-serif",
                    backgroundColor: cardBg,
                    color: textStyle
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Password:</label>
                <input 
                  type="password" 
                  value={password} 
                  placeholder="Enter your password..."
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid #FDA8BF',
                    outline: 'none',
                    fontSize: '11px',
                    fontFamily: "'Fredoka', sans-serif",
                    backgroundColor: cardBg,
                    color: textStyle
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Gemini API Key (Editable):</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid #FDA8BF',
                    outline: 'none',
                    fontSize: '11px',
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
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  backgroundColor: primaryColor,
                  color: darkMode ? '#040607' : '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                Save Settings 💾
              </button>
            </div>
          )}

        </div>

        {/* Bottom Mobile Navigation */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: headerBg,
          borderTop: darkMode ? '2px solid #4928C2' : '2px solid #FDA8BF'
        }}>
          <button 
            onClick={() => setActiveTab('notes')}
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
            <FileText size={18} />
            <span style={{ fontSize: '9px' }}>Notes</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
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
            <Settings size={18} />
            <span style={{ fontSize: '9px' }}>Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
}