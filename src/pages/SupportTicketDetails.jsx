import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import AdminLayout from "../components/AdminLayout";
import { ChevronLeft, Send, CheckCircle, Clock, User, Phone, Package, ExternalLink } from "lucide-react";

const SOCKET_URL = "https://api.freshlaa.com";

export default function SupportTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchTicketDetails();
    connectSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token }
    });

    socket.on("connect", () => {
      socket.emit("join-ticket", id);
    });

    socket.on("ticket-message", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("ticket-status", ({ status }) => {
      setTicket(prev => ({ ...prev, status }));
    });

    socketRef.current = socket;
  };

  const fetchTicketDetails = async () => {
    try {
      const res = await axios.get(`https://api.freshlaa.com/api/tickets/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTicket(res.data.ticket);
        setMessages(res.data.ticket.messages || []);
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post(`https://api.freshlaa.com/api/tickets/admin/${id}/message`, {
        text: inputText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setInputText("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`https://api.freshlaa.com/api/tickets/admin/${id}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <AdminLayout><div className="loading">Loading conversation...</div></AdminLayout>;
  if (!ticket) return <AdminLayout><div className="error">Ticket not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="chat-page-container">
        {/* ── Left Sidebar: Ticket Info ── */}
        <div className="ticket-sidebar">
          <button className="back-btn" onClick={() => navigate("/support")}>
            <ChevronLeft size={18} /> Back to Tickets
          </button>
          
          <div className="info-card">
            <h3>User Information</h3>
            <div className="info-row"><User size={14}/> <span>{ticket.userName}</span></div>
            <div className="info-row"><Phone size={14}/> <span>{ticket.userPhone}</span></div>
          </div>

          <div className="info-card">
            <h3>Context</h3>
            <div className="info-row"><Package size={14}/> <span>Category: {ticket.category}</span></div>
            <div className="issue-label">{ticket.issue}</div>
            {ticket.orderId && (
              <a href={`/admin/order/${ticket.orderId}`} target="_blank" className="order-link">
                View Linked Order <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="status-control">
            <h3>Manage Status</h3>
            <div className="status-buttons">
              <button className={`status-btn active ${ticket.status === 'active' ? 'selected' : ''}`} onClick={() => updateStatus('active')}>Ongoing</button>
              <button className={`status-btn resolved ${ticket.status === 'resolved' ? 'selected' : ''}`} onClick={() => updateStatus('resolved')}>Resolved</button>
              <button className={`status-btn closed ${ticket.status === 'closed' ? 'selected' : ''}`} onClick={() => updateStatus('closed')}>Close</button>
            </div>
          </div>
        </div>

        {/* ── Right: Chat Interface ── */}
        <div className="chat-main">
          <div className="chat-header">
            <div className="header-meta">
              <h2>Chat with {ticket.userName}</h2>
              <div className="sla-timer"><Clock size={12}/> Goal: Respond within 2 hours</div>
            </div>
            <div className={`status-pill ${ticket.status}`}>{ticket.status.toUpperCase()}</div>
          </div>

          <div className="messages-container">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-wrapper ${msg.sender === 'user' ? 'left' : 'right'}`}>
                <div className="msg-bubble">
                  {msg.attachments?.length > 0 && (
                    <div className="msg-attachments">
                      {msg.attachments.map((url, idx) => (
                        <img key={idx} src={url} alt="Attachment" onClick={() => window.open(url)} />
                      ))}
                    </div>
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type your response as an agent..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={ticket.status === 'closed'}
            />
            <button type="submit" disabled={!inputText.trim() || sending || ticket.status === 'closed'}>
              {sending ? "..." : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .chat-page-container { display: flex; height: calc(100vh - 120px); background: #F8FAFC; borderRadius: 16px; overflow: hidden; boxShadow: 0 4px 20px rgba(0,0,0,0.08); }
        
        .ticket-sidebar { width: 300px; background: white; border-right: 1px solid #E2E8F0; padding: 20px; display: flex; flex-direction: column; gap: 24px; }
        .back-btn { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #64748B; border: none; background: none; cursor: pointer; padding: 0; }
        .back-btn:hover { color: #1E293B; }
        
        .info-card h3 { font-size: 11px; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.05em; margin-bottom: 12px; }
        .info-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #334155; margin-bottom: 8px; font-weight: 500; }
        .issue-label { background: #EFF6FF; color: #2563EB; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 8px; }
        .order-link { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #16A34A; text-decoration: none; margin-top: 10px; }
        
        .status-control h3 { font-size: 11px; text-transform: uppercase; color: #94A3B8; margin-bottom: 12px; }
        .status-buttons { display: flex; flex-direction: column; gap: 8px; }
        .status-btn { padding: 10px; border-radius: 8px; border: 2px solid #F1F5F9; background: white; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; color: #64748B; }
        .status-btn.selected { color: white; border-color: transparent; }
        .status-btn.active.selected { background: #3B82F6; }
        .status-btn.resolved.selected { background: #16A34A; }
        .status-btn.closed.selected { background: #64748B; }

        .chat-main { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
        .chat-header { padding: 20px 25px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
        .header-meta h2 { font-size: 18px; font-weight: 800; color: #1E293B; margin: 0; }
        .sla-timer { font-size: 11px; color: #7C3AED; font-weight: 800; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; }
        .status-pill.open { background: #FEF2F2; color: #EF4444; }
        .status-pill.active { background: #EFF6FF; color: #3B82F6; }
        .status-pill.resolved { background: #F0FDF4; color: #22C55E; }

        .messages-container { flex: 1; padding: 25px; overflow-y: auto; background: #F8FAFC; display: flex; flex-direction: column; gap: 15px; }
        .msg-wrapper { display: flex; width: 100%; }
        .msg-wrapper.left { justify-content: flex-start; }
        .msg-wrapper.right { justify-content: flex-end; }
        
        .msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 16px; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .msg-wrapper.left .msg-bubble { background: white; color: #334155; border-bottom-left-radius: 4px; }
        .msg-wrapper.right .msg-bubble { background: #16A34A; color: white; border-bottom-right-radius: 4px; }
        .msg-time { font-size: 10px; opacity: 0.7; margin-top: 5px; display: block; text-align: right; }
        .msg-attachments img { width: 100%; max-width: 250px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; }

        .chat-input-area { padding: 20px; border-top: 1px solid #F1F5F9; display: flex; gap: 12px; }
        .chat-input-area input { flex: 1; padding: 14px 20px; border-radius: 12px; border: 1px solid #E2E8F0; background: #F8FAFC; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .chat-input-area input:focus { border-color: #16A34A; outline: none; background: white; }
        .chat-input-area button { width: 48px; background: #16A34A; border: none; border-radius: 12px; color: white; display: flex; align-items: center; justifyContent: center; cursor: pointer; transition: transform 0.2s; }
        .chat-input-area button:hover { transform: translateY(-2px); background: #15803D; }
        .chat-input-area button:disabled { background: #CBD5E1; transform: none; cursor: not-allowed; }
      `}</style>
    </AdminLayout>
  );
}
