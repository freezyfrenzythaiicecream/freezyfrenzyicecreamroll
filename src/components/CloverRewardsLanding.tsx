import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import MailingListPhoneModal from './MailingListPhoneModal';

/**
 * Optional: set your Clover order-ahead or rewards URL when available.
 * Leave empty to rely on in-store signup plus the forms below.
 */
const CLOVER_REWARDS_URL = '';

const CloverRewardsLanding: React.FC = () => {
  const { config } = useSiteConfig();
  const hasAnnouncement = config.announcement.trim().length > 0;
  const topPad = hasAnnouncement ? 'pt-40 sm:pt-44' : 'pt-32';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rewardsOptIn, setRewardsOptIn] = useState(true);
  const [emailListOptIn, setEmailListOptIn] = useState(true);
  const [emailConsent, setEmailConsent] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [cloverCustomerId, setCloverCustomerId] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    if (!rewardsOptIn && !emailListOptIn) {
      alert('Please choose at least Clover rewards or our email list (or both).');
      return;
    }
    if (!emailConsent) {
      alert('Please confirm you agree to receive emails from us.');
      return;
    }
    setEmailSubmitting(true);
    try {
      const res = await fetch('/api/clover-signup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          cloverRewards: rewardsOptIn,
          emailList: emailListOptIn,
          emailConsent: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; customerId?: string };
      if (!res.ok) {
        alert(
          data.error ||
            'Could not complete signup. If Clover is not configured on the server, ask your developer to set CLOVER_MERCHANT_ID and CLOVER_API_TOKEN.'
        );
        return;
      }
      if (data.customerId) setCloverCustomerId(data.customerId);
      alert('Thanks! You’re signed up. Add your mobile next to get text updates too.');
      setPhoneModalOpen(true);
    } catch {
      alert('Network error. Check your connection and try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-amber-50 ${topPad} pb-24`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-gray-800 underline-offset-4 hover:text-pink-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border-4 border-black bg-white/90 p-8 shadow-2xl sm:p-12">
          <div className="mb-6 flex justify-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <Gift className="h-8 w-8 text-pink-500" />
            <Mail className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="mb-4 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
            Clover Rewards &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500">
              email club
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-center text-lg text-gray-700">
            Join <strong>Clover Rewards</strong> for perks at the register and stay on our{' '}
            <strong>email list</strong> for flavors, hours, and special drops. Bonus: add your mobile
            in the next step to get texts — that’s the full mailing list experience.
          </p>

          {CLOVER_REWARDS_URL ? (
            <a
              href={CLOVER_REWARDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-10 flex w-full items-center justify-center rounded-full border-2 border-black bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 text-center font-bold text-black shadow-md transition hover:scale-[1.02] hover:shadow-lg"
            >
              Open Clover rewards
            </a>
          ) : (
            <div className="mb-10 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center text-amber-950">
              <strong>Clover Rewards:</strong> ask us to enroll you on your next visit, or call{' '}
              <a href="tel:8322303830" className="font-bold underline">
                (832) 230-3830
              </a>
              . Use the form below so we have your email on file too.
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="reward-name" className="mb-1 block text-sm font-semibold text-gray-800">
                Name <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="reward-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div>
              <label htmlFor="reward-email" className="mb-1 block text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                id="reward-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div className="space-y-3 rounded-2xl border-2 border-gray-200 bg-gray-50/80 p-4">
              <p className="font-semibold text-gray-900">Sign me up for:</p>
              <label className="flex cursor-pointer items-center gap-3 text-gray-800">
                <input
                  type="checkbox"
                  checked={rewardsOptIn}
                  onChange={(e) => setRewardsOptIn(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400 text-yellow-600 focus:ring-yellow-500"
                />
                Clover rewards reminders & loyalty notes (email)
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-gray-800">
                <input
                  type="checkbox"
                  checked={emailListOptIn}
                  onChange={(e) => setEmailListOptIn(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400 text-pink-600 focus:ring-pink-500"
                />
                General mailing list — news & offers by email
              </label>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={emailConsent}
                onChange={(e) => setEmailConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-400 text-pink-600 focus:ring-pink-500"
              />
              <span>
                I agree to receive marketing emails from Freezy Frenzy Thai Ice Cream Roll at the address
                above. Unsubscribe anytime via the link in our emails.
              </span>
            </label>

            <button
              type="submit"
              disabled={emailSubmitting}
              className="w-full rounded-full border-2 border-black bg-gradient-to-r from-yellow-400 to-pink-500 py-4 text-lg font-bold text-black shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emailSubmitting ? 'Saving…' : 'Sign up — email & rewards'}
            </button>
          </form>

          <div className="mt-8 border-t-2 border-dashed border-gray-200 pt-8 text-center">
            <p className="mb-3 text-gray-700">Already done the form? Add your mobile for texts.</p>
            <button
              type="button"
              onClick={() => setPhoneModalOpen(true)}
              className="rounded-full border-2 border-black bg-white px-6 py-3 font-bold text-gray-900 shadow-md transition hover:bg-gray-50"
            >
              Bonus: join text list
            </button>
          </div>
        </div>
      </div>

      <MailingListPhoneModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        title="Almost there — add your mobile"
        subtitle="Text messages are how we complete your mailing list signup: flash deals, new rolls, and holiday hours straight to your phone."
        cloverCustomerId={cloverCustomerId}
        linkEmail={email.trim() || null}
      />
    </main>
  );
};

export default CloverRewardsLanding;
