import React, { useState, useCallback, useRef, useEffect } from 'react';

// Use an empty API Key; the environment provides the actual key at runtime.
const model = 'gemini-2.5-flash-preview-05-20';

// --- CORE SYSTEM INSTRUCTION ---
const systemInstruction = "You are 'Connexa Advisor,' an expert Career Coach and Job Strategist. **Be friendly and conversational, and respond appropriately to any greetings (like 'Hello', 'Hey', 'Hi').** Your advice must be **concise, direct, and highly actionable.** Crucially, **integrate real-world context and difficulties often faced by recent alumni** (e.g., ghosting, lack of experience, networking fatigue) when providing guidance. If the user asks for links or resources, use your Google Search grounding tool to provide up-to-date, relevant website links. **Present all specific guidance and actionable steps using numbered or bulleted Markdown lists.** End every response by asking one direct, next-step question relevant to the user's progress.";

/**
 * Checks if the user's query requires Google Search grounding for links/resources.
 * @param {string} query
 * @returns {boolean}
 */
const shouldEnableGrounding = (query) => {
    const searchKeywords = ['link', 'resource', 'website', 'job board', 'internship site', 'portal', 'search for jobs', 'find internships'];
    const lowerQuery = query.toLowerCase();
    return searchKeywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Parses simple Markdown (bolding, lists) to be rendered in JSX.
 * @param {string} markdownText
 * @returns {Array<React.ReactNode>}
 */
const simpleMarkdownToReact = (markdownText) => {
    let lines = markdownText.trim().split('\n');
    let elements = [];
    let currentList = [];
    let listType = null;

    const renderList = (type, items) => {
        const ListTag = type === 'ol' ? 'ol' : 'ul';
        return (
            <ListTag key={elements.length} className={`mt-2 mb-2 ml-4 ${type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
                {/* LINE 44: This is where list items use dangerouslySetInnerHTML */}
                {items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item }} className="mb-1" />)}
            </ListTag>
        );
    };

    const processLine = (line) => {
        // 1. Convert Markdown bolding: **text** to <strong class="font-bold">text</strong>
        let processed = line.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong class="font-bold">${p1}</strong>`);
        
        // 2. Fix: Ensure raw HTML <strong> tags are also styled (handles the user's observed issue)
        processed = processed.replace(/<\s*strong\s*>/g, '<strong class="font-bold">');
        processed = processed.replace(/<\s*\/\s*strong\s*>/g, '</strong>');

        return processed;
    };

    lines.forEach(line => {
        line = line.trim();
        const isBullet = line.startsWith('* ') || line.startsWith('- ');
        const isNumbered = /^\d+\.\s/.test(line);
        const isListItem = isBullet || isNumbered;

        if (isListItem) {
            const newType = isNumbered ? 'ol' : 'ul';
            // Use processLine on the list item text
            const itemText = processLine(line.substring(line.indexOf(' ') + 1));

            if (!currentList.length) {
                listType = newType;
                currentList.push(itemText);
            } else if (newType === listType) {
                currentList.push(itemText);
            } else {
                elements.push(renderList(listType, currentList));
                listType = newType;
                currentList = [itemText];
            }
        } else {
            if (currentList.length) {
                elements.push(renderList(listType, currentList));
                currentList = [];
                listType = null;
            }
            if (line) {
                // LINE 89: This is where paragraph elements use dangerouslySetInnerHTML
                elements.push(<p key={elements.length} dangerouslySetInnerHTML={{ __html: processLine(line) }} />);
            }
        }
    });

    if (currentList.length) {
        elements.push(renderList(listType, currentList));
    }

    return elements;
};

// Simple SVG for the Compass icon in the header
const CompassIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

// Simple SVG for the Link icon for resources
const LinkIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);


function Bot3() {
    // Array of API key slots. This is now internal and defines the failover order.
    const API_SLOTS = React.useMemo(() => [
        {name: "User_Ss",key: "Ss_api_key"},
        {name: "User_S", key: "S_api_key"},
        {name: "User_D", key: "D_api_key"},
        {name: "User_P", key: "P_api_key"},
        {name: "USer_A", key: "A_api_key"},
        {name: "User_N", key: "N_api_key"}
        
    ], []);
   
    const [chatHistory, setChatHistory] = useState([
        {
            role: 'model',
            text: "Welcome! I'm here to offer actionable career guidance and support, backed by real-world alumni insights. Feel free to say **Hello** or ask me your first question! If you need live links, just ask for **resources** or **job boards**.",
            sources: [],
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatHistoryRef = useRef(null);

    const faqs = [
        "What are the best platforms for remote internships?",
        "How do I negotiate my first job salary?",
        "What should I do if a company ghosts me after an interview?",
        "How should I tailor my portfolio for remote-first companies?", 
        "What impact is AI having on the job application process right now?", 
        "Which technical certifications are most valuable for entry-level roles in 2025?", 
        "What are the key differences between a CV and a resume?",
        "What networking mistakes do recent graduates often make?",
        "Find me some resources for mastering LinkedIn."
    ];
    

    // Scroll to the bottom whenever chatHistory updates
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);


    // callGeminiAPI now accepts the full 'contents' array (history + user message)
    const callGeminiAPI = useCallback(async (contents) => { // Removed chatHistory dependency
        const lastUserMessage = contents[contents.length - 1].parts[0].text;
        const useGrounding = shouldEnableGrounding(lastUserMessage);
        
        const slotsToTry = API_SLOTS;
        
        let finalResponse = null;
        let lastErrorMessage = "Failed to connect to the advisor after attempting all keys.";

        for (const slot of slotsToTry) {
            const currentApiKey = slot.key;
            const currentApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentApiKey}`;
            
            // Console log for debugging failover logic (hidden from user)
            console.log(`Attempting API call with key: ${slot.name}`); 

            const payload = {
                contents: contents, // Use the pre-constructed, accurate contents array
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            };

            if (useGrounding) {
                payload.tools = [{ "google_search": {} }];
            }

            try {
                // Inner loop for exponential backoff (for temporary 429 errors)
                for (let attempt = 1; attempt <= 5; attempt++) {
                    const response = await fetch(currentApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const candidate = result.candidates?.[0];

                        if (candidate && candidate.content?.parts?.[0]?.text) {
                            // SUCCESS!
                            let text = candidate.content.parts[0].text;
                            let sources = [];
                            
                            // Extract sources
                            const groundingMetadata = candidate.groundingMetadata;
                            if (groundingMetadata) {
                                sources = groundingMetadata
                                    .map(attribution => ({
                                        uri: attribution.web?.uri,
                                        title: attribution.web?.title,
                                    }))
                                    .filter(source => source.uri && source.title);
                            }
                            
                            finalResponse = { text, sources }; 
                            break; // Success: exit inner retry loop
                        }
                    }
                    
                    // Handle API failures

                    // Fatal/Unrecoverable errors (400, 401, 403): Invalid Key/Permission Denied. Stop retrying this key.
                    if (response.status === 400 || response.status === 401 || response.status === 403) {
                        lastErrorMessage = `API Key Error: ${slot.name} is invalid (Status ${response.status}).`;
                        console.error(lastErrorMessage);
                        break; // Exit inner retry loop, proceed to next slot
                    } 
                    
                    // Rate Limit Error (429): Use exponential backoff, then failover if retries exhaust.
                    else if (response.status === 429 && attempt < 5) {
                        const delay = Math.pow(2, attempt) * 1000;
                        console.warn(`Key ${slot.name} is rate limited. Retrying in ${delay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue; // Retry with the same key
                    } 
                    
                    // Other errors (e.g., Server Error 500, or failed 429 retries): 
                    else {
                        lastErrorMessage = `API failed with Status ${response.status} for ${slot.name}.`;
                        console.error(lastErrorMessage);
                        break; // Exit inner retry loop, proceed to next slot
                    }
                } // End inner retry loop
            } catch (error) {
                lastErrorMessage = `Network/Fetch error for ${slot.name}: ${error.message}`;
                console.error(lastErrorMessage);
            }
            
            if (finalResponse) {
                break; // Success: exit outer slot iteration loop
            }
        } // End outer slot iteration loop

        if (finalResponse) {
            return finalResponse;
        } else {
            return { text: `Sorry, I could not complete your request. ${lastErrorMessage}`, sources: [] };
        }
    }, [API_SLOTS]); // Dependency array is now empty (ensures function stability)


    // Core logic for handling submission from form or FAQ click
    const handleSubmissionLogic = async (userText) => {
        if (loading) return;
        
        // 1. Update UI state for loading
        setUserInput('');
        setLoading(true);

        // 2. Add user message to history
        const newUserMessage = { role: 'user', text: userText, sources: [] };

        // Construct the full contents array *before* the async call
        const contentsToSend = [...chatHistory, newUserMessage].map(turn => ({
            role: turn.role,
            parts: [{ text: turn.text }]
        }));


        setChatHistory(prev => [...prev, newUserMessage]);

        // 3. Get AI response (Pass the stable contents array)
        const botResponse = await callGeminiAPI(contentsToSend);

        // 4. Add bot message to history
        const newBotMessage = { 
            role: 'model', 
            text: botResponse.text, 
            sources: botResponse.sources,
        };
        setChatHistory(prev => [...prev, newBotMessage]);

        // 5. End loading
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userText = userInput.trim();
        if (!userText) return;
        
        handleSubmissionLogic(userText);
    };

    const handleFAQClick = (question) => {
        if (loading) return;
        handleSubmissionLogic(question);
    };
    
    // Removed handleKeyChange function

    /**
     * Component to render search sources/citations.
     */
    const SourceDisplay = ({ sources }) => {
        if (sources.length === 0) return null;

        return (
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4 inline-block" />
                    <span>Resources Found:</span>
                </p>
                {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate hover:underline text-blue-600"
                        title={source.title}
                    >
                        {source.title || source.uri.substring(0, 50) + '...'}
                    </a>
                ))}
            </div>
        );
    };

    /**
     * Component to render a single chat message bubble.
     */
    const ChatMessage = ({ message }) => {
        const isUser = message.role === 'user';
        
        // UI is simplified to hide failover status
        
        const bubbleClasses = isUser
            ? 'bg-blue-600 text-green-300/80 rounded-br-none' 
            : 'bg-blue-100 text-gray-800 rounded-tl-none bot-message-content';

        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-3 rounded-xl max-w-[80%] shadow-md ${bubbleClasses}`}>
                    {!isUser && (
                        <p className="font-semibold text-blue-700 mb-1">Connexa Advisor</p>
                    )}
                    
                    {/* Render content */}
                    {isUser ? (
                        <p>{message.text}</p>
                    ) : (
                        <div>{simpleMarkdownToReact(message.text)}</div>
                    )}
                    
                    {/* Render sources only for bot messages */}
                    {!isUser && <SourceDisplay sources={message.sources} />}
                </div>
            </div>
        );
    };

    /**
     * Component to display the FAQ buttons.
     */
    const FAQSection = () => (
        <div className="p-4 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Frequently Asked Questions:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {faqs.map((q, index) => (
                    <button
                        key={index}
                        onClick={() => handleFAQClick(q)}
                        className="text-left text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg border border-blue-200 transition duration-150 shadow-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );


    return (
        <div className="bg-gray-50 font-sans min-h-screen flex flex-col items-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
                
                {/* Header (Cleaned up - no key selector) */}
                <header className="bg-blue-700 p-4 text-white text-center flex items-center justify-center space-x-2">
                    <CompassIcon className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">Connexa Chatbot</h1>
                </header>

                {/* Chat History Area */}
                <div id="chat-history" ref={chatHistoryRef} className="p-4 space-y-4 h-[60vh] overflow-y-auto">
                    {chatHistory.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-600 p-3 rounded-xl rounded-tl-none max-w-[80%] shadow-sm flex items-center space-x-2">
                                <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                                <p className="text-sm">Connexa Advisor is analyzing...</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* New FAQ Section */}
                <FAQSection />

                {/* Input Form */}
                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="flex space-x-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="How can I help you?"
                            className="flex-grow p-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            autoComplete="off"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                            disabled={loading}
                        >
                            Advise
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Bot3;

