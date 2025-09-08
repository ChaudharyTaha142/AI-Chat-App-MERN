import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    startNewChat,
    selectChat,
    setInput,
    sendingStarted,
    sendingFinished,
    setChats
} from '../store/chatSlice.js';
import { removeChat } from '../store/chatSlice.js';

const Home = () => {
    const dispatch = useDispatch();
    const chats = useSelector(state => state.chat.chats);
    const activeChatId = useSelector(state => state.chat.activeChatId);
    const input = useSelector(state => state.chat.input);
    const isSending = useSelector(state => state.chat.isSending);
    const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
    const [ socket, setSocket ] = useState(null);
    const [ messages, setMessages ] = useState([]);
    const [ editingIndex, setEditingIndex ] = useState(null);
    const composerRef = React.useRef(null);

    const handleNewChat = async () => {
        let title = window.prompt('Enter a title for the new chat:', '');
        if (title) title = title.trim();
        if (!title) return;

        const response = await axios.post("http://localhost:3000/api/chat", {
            title
        }, {
            withCredentials: true
        });
        getMessages(response.data.chat._id);
        dispatch(startNewChat(response.data.chat));
        setSidebarOpen(false);
    }

    useEffect(() => {
        axios.get("http://localhost:3000/api/chat", { withCredentials: true })
            .then(response => {
                dispatch(setChats(response.data.chats.reverse()));
            });

        const tempSocket = io("http://localhost:3000", {
            withCredentials: true,
        });

        tempSocket.on("ai-response", (messagePayload) => {
            console.log("Received AI response:", messagePayload);
            setMessages((prevMessages) => [ ...prevMessages, {
                type: 'ai',
                content: messagePayload.content
            } ]);
            dispatch(sendingFinished());
        });

        setSocket(tempSocket);
        
        return () => {
            tempSocket.disconnect();
        };

    }, [dispatch]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        console.log("Sending message:", trimmed);
        if (!trimmed || !activeChatId || isSending || !socket) return;

        // If editing an existing user message, update it locally and re-send to AI so it regenerates a response
        if (editingIndex !== null && messages[editingIndex]) {
            // Update the edited message and truncate any subsequent messages (so AI's old reply is removed)
            setMessages(prev => {
                const updated = prev.map((m,i) => i === editingIndex ? { ...m, content: trimmed } : m);
                return updated.slice(0, editingIndex + 1);
            });
            // clear the composer editing state
            setEditingIndex(null);
            dispatch(setInput(''));

            // start sending and emit edited content so the backend/AI regenerates
            dispatch(sendingStarted());
            const existingMessageId = messages[editingIndex]?._id;
            socket.emit('ai-message', {
                chat: activeChatId,
                content: trimmed,
                edited: true,
                editedIndex: editingIndex,
                messageId: existingMessageId
            });
            return;
        }

        dispatch(sendingStarted());

        const newMessages = [ ...messages, {
            type: 'user',
            content: trimmed
        } ];

        setMessages(newMessages);
        dispatch(setInput(''));

        socket.emit("ai-message", {
            chat: activeChatId,
            content: trimmed
        });
    }

    const getMessages = async (chatId) => {
        const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true });
        console.log("Fetched messages:", response.data.messages);
        setMessages(response.data.messages.map(m => ({
            _id: m._id,
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content
        })));
    }

    return (
        // --- CHANGE HERE: 'minimal' class hata di hai ---
        <div className="chat-layout">
            <ChatMobileBar
                onToggleSidebar={() => setSidebarOpen(o => !o)}
                onNewChat={handleNewChat}
            />
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={(id) => {
                    dispatch(selectChat(id));
                    setSidebarOpen(false);
                    getMessages(id);
                }}
                onNewChat={handleNewChat}
                onDeleteChat={async (id) => {
                    try {
                        await axios.delete(`http://localhost:3000/api/chat/${id}`, { withCredentials: true });
                        dispatch(removeChat(id));
                        // if the deleted chat was active, clear messages
                        if (activeChatId === id) setMessages([]);
                    } catch (err) {
                        console.error('Failed to delete chat', err);
                        alert('Unable to delete chat.');
                    }
                }}
                onEditChat={async (id) => {
                    try {
                        const chat = chats.find(c => c._id === id || c.id === id);
                        const currentTitle = chat?.title || '';
                        let title = window.prompt('Edit chat title:', currentTitle);
                        if (title === null) return; // cancelled
                        title = title.trim();
                        if (!title || title === currentTitle) return;

                        await axios.put(`http://localhost:3000/api/chat/${id}`, { title }, { withCredentials: true });
                        // update local chats from response or optimistically
                        dispatch(setChats(chats.map(c => (c._id === id || c.id === id) ? { ...c, title } : c)));
                    } catch (err) {
                        console.error('Failed to edit chat', err);
                        alert('Unable to edit chat title.');
                    }
                }}
                open={sidebarOpen}
            />
            <main className="chat-main" role="main">
                {messages.length === 0 && (
                    <div className="chat-welcome" aria-hidden="true">
                        <div className="chip">Early Preview</div>
                        <h1>ChatGPT Clone</h1>
                        <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
                    </div>
                )}
                <ChatMessages messages={messages} isSending={isSending} onEditRequest={(index) => {
                    // open message in composer for editing
                    const m = messages[index];
                    if (!m) return;
                    setEditingIndex(index);
                    dispatch(setInput(m.content));
                    // focus composer
                    setTimeout(() => composerRef.current?.focus(), 50);
                }} />
                {
                    activeChatId &&
                    <ChatComposer
                        input={input}
                        setInput={(v) => dispatch(setInput(v))}
                        onSend={sendMessage}
                        isSending={isSending}
                        editing={editingIndex !== null}
                        setEditing={(val) => { if (!val) setEditingIndex(null); }}
                        ref={composerRef}
                    />
                }
            </main>
            {sidebarOpen && (
                <button
                    className="sidebar-backdrop"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Home;