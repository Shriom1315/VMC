import { useState } from "react";
import { Mail, X, Send, Loader, User, Edit3 } from "lucide-react";

interface Props {
  defaultEmail:  string;          // pre-filled from party record if available
  subject:       string;
  previewName:   string;          // e.g. "Quotation VE-2026-001"
  onSend:        (email: string) => Promise<void>;
  onClose:       () => void;
}

export default function SendEmailModal({ defaultEmail, subject, previewName, onSend, onClose }: Props) {
  const [recipientOption, setRecipientOption] = useState<"default" | "custom">(
    defaultEmail.trim() ? "default" : "custom"
  );
  const [customEmail, setCustomEmail] = useState("");
  const [sending, setSending]         = useState(false);
  const [sent,    setSent]            = useState(false);
  const [error,   setError]           = useState<string | null>(null);

  const activeEmail = recipientOption === "default" ? defaultEmail.trim() : customEmail.trim();

  const handleSend = async () => {
    if (!activeEmail || !activeEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true); setError(null);
    try {
      await onSend(activeEmail);
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-brand-orange" />
            <span className="text-sm font-semibold text-text-primary">Send via Email</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Send size={22} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Email Sent Successfully!</p>
            <p className="text-xs text-text-secondary">{previewName} has been sent to <strong>{activeEmail}</strong></p>
            <button onClick={onClose} className="mt-2 bg-brand-orange text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          /* Send form */
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-surface-muted rounded-lg px-4 py-3 text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{previewName}</span> will be attached as a PDF.
            </div>

            {/* Recipient Choice Option */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Select Recipient Email <span className="text-red-500">*</span>
              </label>

              {defaultEmail.trim() ? (
                <div className="space-y-2 mb-3">
                  <label className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                    recipientOption === "default"
                      ? "border-brand-orange bg-orange-50/40 text-text-primary font-medium"
                      : "border-border hover:bg-surface-subtle text-text-secondary"
                  }`}>
                    <input
                      type="radio"
                      name="recipientOpt"
                      checked={recipientOption === "default"}
                      onChange={() => setRecipientOption("default")}
                      className="accent-brand-orange"
                    />
                    <User size={14} className="text-brand-orange shrink-0" />
                    <div className="text-xs overflow-hidden text-ellipsis">
                      <span className="font-semibold text-text-primary">Registered Client Email:</span>
                      <span className="block text-text-secondary font-mono text-[11px] truncate">{defaultEmail}</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                    recipientOption === "custom"
                      ? "border-brand-orange bg-orange-50/40 text-text-primary font-medium"
                      : "border-border hover:bg-surface-subtle text-text-secondary"
                  }`}>
                    <input
                      type="radio"
                      name="recipientOpt"
                      checked={recipientOption === "custom"}
                      onChange={() => setRecipientOption("custom")}
                      className="accent-brand-orange"
                    />
                    <Edit3 size={14} className="text-text-muted shrink-0" />
                    <span className="text-xs">Send to someone else / alternate email</span>
                  </label>
                </div>
              ) : null}

              {(recipientOption === "custom" || !defaultEmail.trim()) && (
                <div className="mt-1">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Enter recipient email (e.g. client@example.com)"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Subject</label>
              <input
                value={subject}
                readOnly
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-brand-orange text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><Loader size={13} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={13} /> Send Email</>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={sending}
                className="border border-border text-text-secondary text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
