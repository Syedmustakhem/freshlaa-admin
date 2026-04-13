import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { MessageSquare, Clock, Filter, CheckCircle, AlertCircle } from "lucide-react";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const url = filter 
        ? `https://api.freshlaa.com/api/tickets/admin/all?status=${filter}`
        : "https://api.freshlaa.com/api/tickets/admin/all";
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open": return <span className="status-badge open">Open</span>;
      case "active": return <span className="status-badge active">Active</span>;
      case "resolved": return <span className="status-badge resolved">Resolved</span>;
      case "closed": return <span className="status-badge closed">Closed</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="header-info">
          <h1>Support Center</h1>
          <p>Manage and respond to user issues</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Tickets</option>
              <option value="open">New / Open</option>
              <option value="active">Active Conversations</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tickets-stats-grid">
        <div className="stat-card">
          <div className="stat-icon open"><AlertCircle /></div>
          <div className="stat-details">
            <span className="count">{tickets.filter(t => t.status === 'open').length}</span>
            <span className="label">New Tickets</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><MessageSquare /></div>
          <div className="stat-details">
            <span className="count">{tickets.filter(t => t.status === 'active').length}</span>
            <span className="label">Active Chat</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved"><CheckCircle /></div>
          <div className="stat-details">
            <span className="count">{tickets.filter(t => t.status === 'resolved').length}</span>
            <span className="label">Resolved Today</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-state">Loading tickets...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Category / Issue</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Response Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>
                    <div className="user-cell">
                      <span className="name">{ticket.userName}</span>
                      <span className="phone">{ticket.userPhone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="issue-cell">
                      <span className="category">{ticket.category}</span>
                      <span className="issue-text">{ticket.issue}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>
                    <div className="time-cell">
                      <Clock size={12} />
                      <span>{new Date(ticket.lastMessageAt || ticket.updatedAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="sla-badge">Within 2hr</span>
                  </td>
                  <td>
                    <Link to={`/support/ticket/${ticket._id}`} className="btn-respond">
                      Respond
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                    No support tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .tickets-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; borderRadius: 12px; display: flex; align-items: center; gap: 15px; boxSizing: border-box; boxShadow: 0 2px 10px rgba(0,0,0,0.05); }
        .stat-icon { width: 45px; height: 45px; borderRadius: 10px; display: flex; alignItems: center; justifyContent: center; }
        .stat-icon.open { background: #FEF2F2; color: #EF4444; }
        .stat-icon.active { background: #EFF6FF; color: #3B82F6; }
        .stat-icon.resolved { background: #F0FDF4; color: #22C55E; }
        .stat-details .count { display: block; fontSize: 24px; fontWeight: 800; color: #1E293B; }
        .stat-details .label { fontSize: 13px; color: #64748B; fontWeight: 500; }

        .status-badge { padding: 4px 10px; borderRadius: 20px; fontSize: 11px; fontWeight: 700; textTransform: uppercase; }
        .status-badge.open { background: #FEE2E2; color: #991B1B; }
        .status-badge.active { background: #DBEAFE; color: #1E40AF; }
        .status-badge.resolved { background: #DCFCE7; color: #166534; }
        .status-badge.closed { background: #F1F5F9; color: #475569; }

        .user-cell .name { display: block; fontWeight: 700; color: #1E293B; fontSize: 14px; }
        .user-cell .phone { fontSize: 12px; color: #64748B; }
        .issue-cell .category { display: block; fontWeight: 800; color: #3B82F6; fontSize: 11px; textTransform: uppercase; }
        .issue-cell .issue-text { font-size: 13px; color: #334155; }
        .time-cell { display: flex; align-items: center; gap: 5px; color: #64748B; fontSize: 12px; }
        .sla-badge { background: #F5F3FF; color: #7C3AED; padding: 2px 8px; borderRadius: 4px; fontSize: 10px; fontWeight: 800; }
        
        .btn-respond { background: #16A34A; color: white; padding: 6px 14px; borderRadius: 6px; fontSize: 13px; fontWeight: 600; textDecoration: none; }
        .btn-respond:hover { background: #15803D; }
        
        .filter-group { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; borderRadius: 8px; border: 1px solid #E2E8F0; }
        .filter-group select { border: none; outline: none; font-size: 14px; font-weight: 600; color: #334155; }
      `}</style>
    </AdminLayout>
  );
}
