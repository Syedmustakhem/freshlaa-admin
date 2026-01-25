import { motion } from "framer-motion";

export default function Toast({ message, type }) {
  return (
    <motion.div
      className={`admin-toast ${type}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {type === "success" && "✅ "}
      {type === "error" && "⚠️ "}
      {type === "warning" && "⚠️ "}
      {message}
    </motion.div>
  );
}
