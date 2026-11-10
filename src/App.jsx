import React, { useState } from 'react';
import { Mic, Upload, FileText, Settings, Moon, Sun, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('Nathan');
  const [password, setPassword] = useState('••••••••');
  const [apiKey, setApiKey] = useState('AQ.Ab8RN6JSxDlxoNh-CTJEAIgn1Al5m5HPV0pOdoPp2z1fkSkrYg');
  const [activeTab, setActiveTab] = useState('notes');
  const [inputMode, setInputMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcessWithAI = async () => {
    if (!textContent && inputMode === 'text') return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following note text in English, Tagalog, or Taglish and provide:
              1. Summary: A clear and concise summary of the main points.
              2. Tags: 3 to 5 relevant tags separated by commas.
              
              Note content: "${textContent}"`
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setResult({
          summary: data.candidates[0].content.parts[0].text,
          tags: ["AIProcessed", "SmartNotes", "MobileApp"]
        });
      } else {
        setResult({
          summary: "Error processing with AI. Please check your API key.",
          tags: ["Error"]
        });
      }
    } catch (error) {
      setResult({
        summary: "Network connection error occurred.",
        tags: ["Error"]
      });
    } finally {
      setLoading(false);
    }
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
          justifyContent: 'between',
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
                      height: '110px',
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
                  padding: '30px',
                  borderRadius: '20px',
                  border: `2px dashed ${primaryColor}`,
                  backgroundColor: secondaryBg + '33',
                  gap: '12px'
                }}>
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    style={{
                      width: '56px',
                      height: '56px',
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
                    <Mic size={24} />
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
                  padding: '30px',
                  borderRadius: '20px',
                  border: `2px dashed ${primaryColor}`,
                  backgroundColor: secondaryBg + '33',
                  gap: '10px',
                  textAlign: 'center'
                }}>
                  <Upload size={28} color={primaryColor} />
                  <p style={{ fontSize: '11px', fontWeight: '700', margin: 0 }}>Upload MP3, WAV or M4A file</p>
                  <input type="file" accept="audio/*" style={{ fontSize: '11px', width: '100%', marginTop: '6px' }} />
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handleProcessWithAI}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
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
                {loading ? <Sparkles className="animate-spin" size={18} /> : <Send size={16} />}
                <span>{loading ? "Analyzing with Gemini AI..." : "Process Note with AI 💖"}</span>
              </button>

              {/* AI Result Card */}
              {result && (
                <div style={{
                  padding: '16px',
                  borderRadius: '20px',
                  border: `2px solid ${primaryColor}`,
                  backgroundColor: secondaryBg,
                  color: darkMode ? '#E3D9FC' : '#4A3B32',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px' }}>
                    <CheckCircle2 size={16} />
                    <span>AI Analysis Result</span>
                  </div>
                  <p style={{ fontSize: '11px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {result.summary}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                    {result.tags.map((tag, idx) => (
                      <span key={idx} style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: darkMode ? '#4928C2' : '#FFFFFF',
                        color: darkMode ? '#E3D9FC' : '#4A3B32'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>✨ Settings & Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Username:</label>
                <input 
                  type="text" 
                  value={username} 
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
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Gemini API Key (Embedded):</label>
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
                onClick={() => alert("Settings saved successfully!")}
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