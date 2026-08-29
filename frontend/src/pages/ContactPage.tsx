import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — wire to backend when ready
    setSent(true);
  };

  const inputCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-4 md:px-8 py-8 flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Contact Us</h1>
        <p className="text-sm text-text-secondary mt-1">Get in touch with our team for calibration enquiries or support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-text-primary">Contact Information</h2>
            {[
              { icon: MapPin, label: "Address", value: "A/P Male, Tal. Panhala, Dist. Kolhapur – 416122, Maharashtra" },
              { icon: Phone, label: "Phone", value: "+91 9503601616" },
              { icon: Mail,  label: "Email", value: "kiranpatil24586@gmail.com" },
              { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 6:00 PM" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange-light flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-brand-orange" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-secondary">{label}</div>
                  <div className="text-sm text-text-primary mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm p-5 md:p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Mail size={22} className="text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Message Sent</h3>
              <p className="text-sm text-text-secondary text-center max-w-xs">
                Thank you for reaching out. We'll get back to you within 1–2 business days.
              </p>
              <button
                onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                className="mt-2 text-xs font-medium text-brand-orange hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text-primary mb-1">Send a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Your Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Full name" required />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} placeholder="Calibration enquiry, repair request, etc." required />
              </div>
              <div>
                <label className={labelCls}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className={`${inputCls} resize-none`} placeholder="Describe your requirement..." required />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-brand-orange text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors">
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
