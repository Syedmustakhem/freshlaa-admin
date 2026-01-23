const STEPS = ["Placed", "Packed", "Out for Delivery", "Delivered"];

export default function OrderTimeline({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <div>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i <= current ? "#16a34a" : "#ccc",
              marginRight: 10,
            }}
          />
          <span style={{ fontWeight: i <= current ? 700 : 400 }}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
