const steps = [
  "Placed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

export default function OrderTimeline({ status }) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="timeline mt-3">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`timeline-step ${
            i <= currentIndex ? "active" : ""
          }`}
        >
          <div className="dot" />
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}
