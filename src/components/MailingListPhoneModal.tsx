import React, { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';

export type MailingListPhoneModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  /** Returned from POST /api/clover-signup/email when present */
  cloverCustomerId?: string | null;
  /** Lets Clover attach the phone if the tab was refreshed after email signup */
  linkEmail?: string | null;
};

function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return null;
}

const MailingListPhoneModal: React.FC<MailingListPhoneModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  cloverCustomerId = null,
  linkEmail = null,
}) => {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setConsent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUsPhone(phone);
    if (!normalized) {
      alert('Please enter a valid 10-digit U.S. mobile number.');
      return;
    }
    if (!consent) {
      alert('Please confirm you agree to receive texts from us.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/clover-signup/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalized,
          smsConsent: true,
          customerId: cloverCustomerId || undefined,
          linkEmail: linkEmail?.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        alert(data.error || 'Could not save your number. Please try again or call the shop.');
        return;
      }
      alert("You're on the list! Thank you — we'll text you with updates and treats.");
      onClose();
    } catch {
      alert('Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease-out]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mailing-phone-title"
        className="relative w-full max-w-md rounded-3xl border-4 border-black bg-gradient-to-br from-pink-50 via-yellow-50 to-amber-50 p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-800" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full border-2 border-black bg-white p-4 shadow-md">
            <Smartphone className="h-10 w-10 text-pink-500" />
          </div>
        </div>

        <h2 id="mailing-phone-title" className="mb-2 text-center text-2xl font-bold text-gray-900">
          {title}
        </h2>
        <p className="mb-6 text-center text-gray-700">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mailing-phone" className="mb-1 block text-sm font-semibold text-gray-800">
              Mobile number
            </label>
            <input
              id="mailing-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(832) 555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-pink-600 focus:ring-pink-500"
            />
            <span>
              I agree to receive recurring automated marketing texts from Freezy Frenzy at this number.
              Message & data rates may apply. Reply STOP to opt out.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border-2 border-black bg-gradient-to-r from-yellow-400 to-pink-500 py-3.5 text-lg font-bold text-black shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Join text list'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MailingListPhoneModal;
