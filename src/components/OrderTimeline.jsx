import { motion } from "framer-motion";

const STEPS = ["Placed", "Packed", "Out for Delivery", "Delivered"];

export default function OrderTimeline({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <div className="order-timeline">
      {STEPS.map((step, i) => {
        const completed = i <= current;

        return (
          <div key={step} className="timeline-row">
            {/* Indicator */}
            <motion.div
              className={`timeline-dot ${completed ? "active" : ""}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25 }}
            />

            {/* Line */}
            {i < STEPS.length - 1 && (
              <div
                className={`timeline-line ${
                  i < current ? "active" : ""
                }`}
              />
            )}

            {/* Label */}
            <span
              className={`timeline-label ${
                completed ? "active" : ""
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
