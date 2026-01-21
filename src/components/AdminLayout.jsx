import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light min-vh-100">
        {children}
      </div>
    </div>
  );
}
