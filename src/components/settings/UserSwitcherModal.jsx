import React from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthPage } from "../auth/AuthPage.jsx";

export function UserSwitcherModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { activeUserModal, closeAuthModal, authModalMode } = useAuth();
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : activeUserModal;
  const handleClose = propOnClose || closeAuthModal;

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full min-h-screen">
        <button
          type="button"
          onClick={handleClose}
          className="fixed top-5 right-6 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95 hover:shadow-lg"
          aria-label="Close"
          title="Return to Farm Dashboard"
        >
          <X className="w-5 h-5" />
        </button>
        <AuthPage
          initialMode={authModalMode || "login"}
          onAuthSuccess={handleClose}
        />
      </div>
    </div>
  );
}

export default UserSwitcherModal;
