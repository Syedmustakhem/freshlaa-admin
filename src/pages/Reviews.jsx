
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const Avatar = ({ name }) => {
    const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const colors = ["#6366f1", "#0ea5e9", "#f59e0b", "#22c55e", "#ec4899", "#8b5cf6", "#14b8a6"];
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{
            width: 36, height: 36, borderRadius: "50%", background: color,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};
const Stars = ({ rating, size = 14 }) => (
    <span style={{ display: "inline-flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ fontSize: size, color: i <= rating ? "#f59e0b" : "#e5e7eb" }}>★</span>
        ))}
    </span>
);
const StatusBadge = ({ status }) => {
    const cfg = {
        approved: { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", icon: "✅", label: "Approved" },
        pending: { color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "⏳", label: "Pending" },
        rejected: { color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", icon: "❌", label: "Rejected" },
    }[status] || { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: "•", label: status };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};
const TypeBadge = ({ type }) => {
    const cfg = {
        product: { color: "#6366f1", bg: "#eef2ff", label: "Product" },
        order: { color: "#22c55e", bg: "#f0fdf4", label: "Order" },
        delivery: { color: "#f59e0b", bg: "#fffbeb", label: "Delivery" },
        hotel: { color: "#ec4899", bg: "#fdf2f8", label: "Hotel" },
    }[type] || { color: "#6b7280", bg: "#f9fafb", label: type };
    return (
        <span style={{
            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            color: cfg.color, background: cfg.bg, textTransform: "uppercase", letterSpacing: 0.5,
        }}>
            {cfg.label}
        </span>
    );
};
const PAGE_SIZES = [10, 25, 50];
function PagBtn({ onClick, disabled, active, label }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            minWidth: 32, height: 32, padding: "0 6px", borderRadius: 7,
            border: active ? "1px solid #6366f1" : "1px solid #e5e7eb",
            background: active ? "#6366f1" : disabled ? "#f9fafb" : "#fff",
            color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: active ? 700 : 400, transition: "all .15s",
        }}>{label}</button>
    );
}
/* ─────────────────────────────────────────────
   REPLY MODAL
───────────────────────────────────────────── */
function ReplyModal({ review, onClose, onSend }) {
    const [message, setMessage] = useState(review?.reply?.message || "");
    const [sending, setSending] = useState(false);
    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSend(review._id, message.trim());
            onClose();
        } catch {
            // error handled in parent
        } finally {
            setSending(false);
        }
    };
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.45)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
                    boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                            Reply to Review
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                            by {review?.user?.name || "Unknown"} · <Stars rating={review?.rating || 0} size={11} />
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer", fontSize: 16, color: "#9ca3af",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>
                {/* Review preview */}
                <div style={{ padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    {review?.title && <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 4 }}>{review.title}</div>}
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                        {review?.body || "No review text"}
                    </div>
                </div>
                {/* Reply input */}
                <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
                        Your Reply
                    </div>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Write your reply to the customer..."
                        maxLength={1000}
                        rows={4}
                        style={{
                            width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d1d5db",
                            fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit",
                            boxSizing: "border-box", minHeight: 100,
                        }}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{message.length}/1000</span>
                    </div>
                </div>
                {/* Actions */}
                <div style={{
                    padding: "12px 20px", borderTop: "1px solid #e5e7eb",
                    display: "flex", justifyContent: "flex-end", gap: 8, background: "#f9fafb",
                }}>
                    <button onClick={onClose} style={{
                        padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6b7280",
                    }}>Cancel</button>
                    <button
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        style={{
                            padding: "8px 20px", borderRadius: 8, border: "none",
                            background: !message.trim() ? "#d1d5db" : "#6366f1",
                            color: "#fff", cursor: !message.trim() ? "not-allowed" : "pointer",
                            fontSize: 13, fontWeight: 600, transition: "all .15s",
                        }}
                    >
                        {sending ? "Sending…" : review?.reply ? "Update Reply" : "Send Reply"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
/* ─────────────────────────────────────────────
   REJECT MODAL
───────────────────────────────────────────── */
function RejectModal({ review, onClose, onReject }) {
    const [reason, setReason] = useState("");
    const [sending, setSending] = useState(false);
    const handleReject = async () => {
        setSending(true);
        try {
            await onReject(review._id, reason.trim());
            onClose();
        } catch {
            // error handled in parent
        } finally {
            setSending(false);
        }
    };
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.45)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
                    boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden",
                }}
            >
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#ef4444" }}>❌ Reject Review</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        by {review?.user?.name || "Unknown"}
                    </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
                        Rejection Reason (optional)
                    </div>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Why is this review being rejected?"
                        rows={3}
                        style={{
                            width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d1d5db",
                            fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                <div style={{
                    padding: "12px 20px", borderTop: "1px solid #e5e7eb",
                    display: "flex", justifyContent: "flex-end", gap: 8, background: "#f9fafb",
                }}>
                    <button onClick={onClose} style={{
                        padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6b7280",
                    }}>Cancel</button>
                    <button
                        onClick={handleReject}
                        disabled={sending}
                        style={{
                            padding: "8px 20px", borderRadius: 8, border: "none",
                            background: "#ef4444", color: "#fff", cursor: "pointer",
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        {sending ? "Rejecting…" : "Reject Review"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
/* ─────────────────────────────────────────────
   PHOTO LIGHTBOX
───────────────────────────────────────────── */
function PhotoLightbox({ photos, startIndex, onClose }) {
    const [idx, setIdx] = useState(startIndex || 0);
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.85)", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
        }} onClick={onClose}>
            <button onClick={onClose} style={{
                position: "absolute", top: 16, right: 16,
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 18,
                cursor: "pointer",
            }}>✕</button>
            <img
                src={photos[idx]}
                alt=""
                style={{ maxWidth: "90%", maxHeight: "80vh", borderRadius: 12, objectFit: "contain" }}
                onClick={e => e.stopPropagation()}
            />
            {photos.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    {photos.map((p, i) => (
                        <img
                            key={i}
                            src={p}
                            alt=""
                            onClick={e => { e.stopPropagation(); setIdx(i); }}
                            style={{
                                width: 56, height: 56, borderRadius: 8, objectFit: "cover",
                                cursor: "pointer", border: i === idx ? "2px solid #fff" : "2px solid transparent",
                                opacity: i === idx ? 1 : 0.6,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [toast, setToast] = useState(null);
    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");
    const [photoFilter, setPhotoFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // Modals
    const [replyReview, setReplyReview] = useState(null);
    const [rejectReview, setRejectReview] = useState(null);
    const [lightbox, setLightbox] = useState(null); // {photos, startIndex}
    // Action loading
    const [actionId, setActionId] = useState(null);
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };
    /* ─── FETCH ─── */
    const fetchReviews = useCallback(async (pg = 1) => {
        try {
            setLoading(true);
            const params = {
                page: pg,
                limit: pageSize,
                ...(statusFilter && { status: statusFilter }),
                ...(typeFilter && { reviewType: typeFilter }),
                ...(ratingFilter && { minRating: ratingFilter, maxRating: ratingFilter }),
                ...(photoFilter && { withPhotos: "true" }),
                ...(searchQuery && { search: searchQuery }),
            };
            const res = await api.get("/reviews/admin/all", {
                params,
            });
            if (res.data.success) {
                setReviews(res.data.reviews || []);
                setTotalPages(res.data.pagination?.pages || 1);
                setTotalCount(res.data.pagination?.total || 0);
                setPage(pg);
            }
        } catch {
            showToast("Failed to load reviews", "error");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter, ratingFilter, photoFilter, pageSize]);
    useEffect(() => { fetchReviews(1); }, [fetchReviews]);
    /* ─── ACTIONS ─── */
    const handleApprove = async (id) => {
        setActionId(id);
        try {
            await api.patch(`/reviews/admin/${id}/status`, { status: "approved" });
            setReviews(prev => prev.map(r => r._id === id ? { ...r, status: "approved" } : r));
            showToast("Review approved");
        } catch {
            showToast("Failed to approve", "error");
        } finally {
            setActionId(null);
        }
    };
    const handleReject = async (id, reason) => {
        setActionId(id);
        try {
            await api.patch(`/reviews/admin/${id}/status`, {
                status: "rejected",
                ...(reason && { rejectionReason: reason }),
            });
            setReviews(prev => prev.map(r => r._id === id
                ? { ...r, status: "rejected", rejectionReason: reason || null }
                : r
            ));
            showToast("Review rejected");
        } catch {
            showToast("Failed to reject", "error");
        } finally {
            setActionId(null);
        }
    };
    const handleReply = async (id, message) => {
        try {
            await api.post(`/reviews/${id}/reply`, { message });
            setReviews(prev => prev.map(r => r._id === id
                ? { ...r, reply: { message, repliedAt: new Date().toISOString() } }
                : r
            ));
            showToast("Reply sent successfully");
        } catch {
            showToast("Failed to send reply", "error");
            throw new Error("Failed");
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        setActionId(id);
        try {
            await api.delete(`/reviews/admin/${id}`);
            setReviews(prev => prev.filter(r => r._id !== id));
            showToast("Review deleted");
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            setActionId(null);
        }
    };
    /* ─── STATS ─── */
    const pendingCount = reviews.filter(r => r.status === "pending").length;
    const approvedCount = reviews.filter(r => r.status === "approved").length;
    const rejectedCount = reviews.filter(r => r.status === "rejected").length;
    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";
    const hasFilters = statusFilter || typeFilter || ratingFilter || photoFilter || searchQuery;
    /* ─────────── RENDER ─────────── */
    return (
        <AdminLayout>
            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: "fixed", top: 20, right: 20, zIndex: 9999,
                            padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13,
                            background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
                            color: toast.type === "error" ? "#ef4444" : "#16a34a",
                            border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
                            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                        }}
                    >
                        {toast.type === "error" ? "❌ " : "✅ "}{toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ── Header ── */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20, flexWrap: "wrap", gap: 10,
            }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Reviews</h3>
                    <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 13 }}>
                        Manage customer reviews — approve, reject, or reply
                    </p>
                </div>
                <button onClick={() => fetchReviews(page)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                    background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500,
                    color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                }}>
                    🔄 Refresh
                </button>
            </div>
            {/* ── Stat Cards ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12, marginBottom: 18,
            }}>
                {[
                    { label: "Total Reviews", value: totalCount, icon: "📝", color: "#6366f1", bg: "#eef2ff" },
                    { label: "Avg Rating", value: `★ ${avgRating}`, icon: "⭐", color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Pending", value: pendingCount, icon: "⏳", color: "#d97706", bg: "#fffbeb" },
                    { label: "Approved", value: approvedCount, icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
                    { label: "Rejected", value: rejectedCount, icon: "❌", color: "#ef4444", bg: "#fef2f2" },
                ].map((c, i) => (
                    <motion.div
                        key={c.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
                            padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                            display: "flex", alignItems: "center", gap: 12,
                            cursor: c.label === "Pending" || c.label === "Approved" || c.label === "Rejected"
                                ? "pointer" : "default",
                        }}
                        onClick={() => {
                            if (c.label === "Pending") { setStatusFilter("pending"); setPage(1); }
                            if (c.label === "Approved") { setStatusFilter("approved"); setPage(1); }
                            if (c.label === "Rejected") { setStatusFilter("rejected"); setPage(1); }
                        }}
                    >
                        <div style={{
                            width: 42, height: 42, borderRadius: 10, background: c.bg,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{
                                fontSize: 11, color: "#9ca3af", textTransform: "uppercase",
                                letterSpacing: .5, fontWeight: 600,
                            }}>{c.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>
                                {c.value}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* ── Filters ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                style={{
                    background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
                    padding: "14px 16px", marginBottom: 14,
                    display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end",
                    boxShadow: "0 1px 3px rgba(0,0,0,.06)",
                }}
            >
                {/* Search */}
                <div style={{ flex: "1 1 200px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Search</div>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Review content..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={e => e.key === "Enter" && fetchReviews(1)}
                            style={{
                                width: "100%", padding: "8px 10px 8px 32px", borderRadius: 8,
                                border: "1px solid #d1d5db", fontSize: 13, outline: "none",
                                boxSizing: "border-box", background: "#fff"
                            }}
                        />
                        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                    </div>
                </div>
                {/* Status */}
                <div style={{ flex: "0 0 150px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Status</div>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}
                    >
                        <option value="">All Status</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="approved">✅ Approved</option>
                        <option value="rejected">❌ Rejected</option>
                    </select>
                </div>
                {/* Type */}
                <div style={{ flex: "0 0 150px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Type</div>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}
                    >
                        <option value="">All Types</option>
                        <option value="product">📦 Product</option>
                        <option value="order">🛒 Order</option>
                        <option value="delivery">🛵 Delivery</option>
                        <option value="hotel">🍽️ Hotel</option>
                    </select>
                </div>
                {/* Rating */}
                <div style={{ flex: "0 0 130px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Rating</div>
                    <select
                        value={ratingFilter}
                        onChange={e => { setRatingFilter(e.target.value); setPage(1); }}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}
                    >
                        <option value="">All Ratings</option>
                        <option value="5">★★★★★ (5)</option>
                        <option value="4">★★★★☆ (4)</option>
                        <option value="3">★★★☆☆ (3)</option>
                        <option value="2">★★☆☆☆ (2)</option>
                        <option value="1">★☆☆☆☆ (1)</option>
                    </select>
                </div>
                {/* Photo filter */}
                <label style={{
                    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                    padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
                    background: photoFilter ? "#eef2ff" : "#fff", fontSize: 13, fontWeight: 500,
                    color: photoFilter ? "#6366f1" : "#374151",
                    alignSelf: "flex-end",
                }}>
                    <input
                        type="checkbox"
                        checked={photoFilter}
                        onChange={e => { setPhotoFilter(e.target.checked); setPage(1); }}
                        style={{ accentColor: "#6366f1" }}
                    />
                    📷 With Photos
                </label>
                {/* Clear */}
                {hasFilters && (
                    <button
                        onClick={() => { setStatusFilter(""); setTypeFilter(""); setRatingFilter(""); setPhotoFilter(false); setSearchQuery(""); setPage(1); }}
                        style={{
                            alignSelf: "flex-end", padding: "8px 14px", borderRadius: 8,
                            border: "1px solid #fca5a5", background: "#fef2f2",
                            color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 500,
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </motion.div>
            {/* ── Reviews List ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                style={{
                    background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
                    overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)",
                }}
            >
                {loading ? (
                    <div style={{ padding: 52, textAlign: "center", color: "#9ca3af" }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={{
                                width: 36, height: 36, borderRadius: "50%",
                                border: "3px solid #e5e7eb", borderTopColor: "#6366f1",
                                margin: "0 auto 12px",
                            }}
                        />
                        Loading reviews…
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ padding: 52, textAlign: "center", color: "#9ca3af" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
                        No reviews found
                        {hasFilters && (
                            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
                        )}
                    </div>
                ) : (
                    <>
                        {reviews.map((r, i) => {
                            const userName = r.user?.name || "Unknown";
                            const userPhone = r.user?.phone || "";
                            const productName = r.product?.name || (r.reviewType === "hotel" ? "Restaurant" : "—");
                            const productImg = r.product?.images?.[0] || null;
                            const isActioning = actionId === r._id;
                            return (
                                <motion.div
                                    key={r._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    style={{
                                        padding: "16px 20px",
                                        borderBottom: "1px solid #f3f4f6",
                                        transition: "background .15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                >
                                    {/* ── Row 1: User + Status + Date ── */}
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        marginBottom: 10, flexWrap: "wrap",
                                    }}>
                                        <Avatar name={userName} />
                                        <div style={{ flex: 1, minWidth: 120 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{userName}</div>
                                            {userPhone && <div style={{ fontSize: 11, color: "#9ca3af" }}>{userPhone}</div>}
                                        </div>
                                        <StatusBadge status={r.status} />
                                        <TypeBadge type={r.reviewType} />
                                        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                                            {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {/* ── Row 2: Product ── */}
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        background: "#f9fafb", borderRadius: 8, padding: "6px 10px",
                                        marginBottom: 8,
                                    }}>
                                        {productImg ? (
                                            <img
                                                src={productImg}
                                                alt=""
                                                style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 6, background: "#e5e7eb",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, color: "#9ca3af",
                                            }}>📦</div>
                                        )}
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{productName}</span>
                                    </div>
                                    {/* ── Row 3: Rating + Review ── */}
                                    <div style={{ marginBottom: 6 }}>
                                        <Stars rating={r.rating} size={15} />
                                    </div>
                                    {r.title && (
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 3 }}>
                                            {r.title}
                                        </div>
                                    )}
                                    {r.body && (
                                        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 6 }}>
                                            {r.body}
                                        </div>
                                    )}
                                    {/* ── Photos ── */}
                                    {r.photos?.length > 0 && (
                                        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                                            {r.photos.map((p, pi) => (
                                                <img
                                                    key={pi}
                                                    src={p}
                                                    alt=""
                                                    onClick={() => setLightbox({ photos: r.photos, startIndex: pi })}
                                                    style={{
                                                        width: 56, height: 56, borderRadius: 8, objectFit: "cover",
                                                        cursor: "pointer", border: "1px solid #e5e7eb",
                                                        transition: "transform .15s",
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {/* ── Existing reply ── */}
                                    {r.reply && (
                                        <div style={{
                                            background: "#f5f3ff", borderLeft: "3px solid #6366f1",
                                            borderRadius: 8, padding: "8px 12px", marginBottom: 8,
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", marginBottom: 3 }}>
                                                💬 TEAM REPLY
                                            </div>
                                            <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>
                                                {r.reply.message}
                                            </div>
                                        </div>
                                    )}
                                    {/* ── Rejection reason ── */}
                                    {r.status === "rejected" && r.rejectionReason && (
                                        <div style={{
                                            background: "#fef2f2", borderLeft: "3px solid #ef4444",
                                            borderRadius: 8, padding: "8px 12px", marginBottom: 8,
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", marginBottom: 3 }}>
                                                REJECTION REASON
                                            </div>
                                            <div style={{ fontSize: 12, color: "#4b5563" }}>{r.rejectionReason}</div>
                                        </div>
                                    )}
                                    {/* ── Action buttons ── */}
                                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                        {r.status !== "approved" && (
                                            <button
                                                onClick={() => handleApprove(r._id)}
                                                disabled={isActioning}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    padding: "6px 14px", borderRadius: 8,
                                                    border: "1px solid #86efac", background: "#f0fdf4",
                                                    color: "#16a34a", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                    opacity: isActioning ? 0.5 : 1,
                                                }}
                                            >
                                                ✅ Approve
                                            </button>
                                        )}
                                        {r.status !== "rejected" && (
                                            <button
                                                onClick={() => setRejectReview(r)}
                                                disabled={isActioning}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    padding: "6px 14px", borderRadius: 8,
                                                    border: "1px solid #fca5a5", background: "#fef2f2",
                                                    color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                    opacity: isActioning ? 0.5 : 1,
                                                }}
                                            >
                                                ❌ Reject
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setReplyReview(r)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                padding: "6px 14px", borderRadius: 8,
                                                border: "1px solid #c7d2fe", background: "#eef2ff",
                                                color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                            }}
                                        >
                                            💬 {r.reply ? "Edit Reply" : "Reply"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r._id)}
                                            disabled={isActioning}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                padding: "6px 14px", borderRadius: 8,
                                                border: "1px solid #fecaca", background: "#fff",
                                                color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                opacity: isActioning ? 0.5 : 1,
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {/* ── Pagination ── */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", borderTop: "1px solid #e5e7eb", flexWrap: "wrap", gap: 10,
                        }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                fontSize: 13, color: "#6b7280",
                            }}>
                                Show
                                <select
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                    style={{
                                        padding: "4px 8px", borderRadius: 6,
                                        border: "1px solid #d1d5db", fontSize: 13,
                                    }}
                                >
                                    {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                entries · <strong style={{ color: "#111827" }}>{totalCount}</strong> total
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <PagBtn onClick={() => fetchReviews(1)} disabled={page === 1} label="«" />
                                <PagBtn onClick={() => fetchReviews(page - 1)} disabled={page === 1} label="‹" />
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                                    .map((p, i) =>
                                        p === "…"
                                            ? <span key={`e${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>…</span>
                                            : <PagBtn key={p} onClick={() => fetchReviews(p)} active={page === p} label={p} />
                                    )
                                }
                                <PagBtn onClick={() => fetchReviews(page + 1)} disabled={page === totalPages} label="›" />
                                <PagBtn onClick={() => fetchReviews(totalPages)} disabled={page === totalPages} label="»" />
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
            {/* ── Modals ── */}
            <AnimatePresence>
                {replyReview && (
                    <ReplyModal
                        review={replyReview}
                        onClose={() => setReplyReview(null)}
                        onSend={handleReply}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {rejectReview && (
                    <RejectModal
                        review={rejectReview}
                        onClose={() => setRejectReview(null)}
                        onReject={handleReject}
                    />
                )}
            </AnimatePresence>
            {lightbox && (
                <PhotoLightbox
                    photos={lightbox.photos}
                    startIndex={lightbox.startIndex}
                    onClose={() => setLightbox(null)}
                />
            )}
        </AdminLayout>
    );
}
