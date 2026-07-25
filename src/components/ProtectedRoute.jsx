// ProtectedRoute is no longer needed — Auth0Gate in App.jsx handles all authentication.
// This component now simply renders its children for backward compatibility.
export default function ProtectedRoute({ children }) {
  return children;
}
