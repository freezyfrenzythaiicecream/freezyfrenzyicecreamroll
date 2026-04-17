import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import MailingListPhoneModal from './MailingListPhoneModal';

const SESSION_KEY = 'mailingListPhonePopupShown';

const MailingListPopup: React.FC = () => {
  const { config } = useSiteConfig();
  const location = useLocation();
  const enabled = config.showMailingListPopup;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || location.pathname !== '/') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
    }, 6000);
    return () => window.clearTimeout(t);
  }, [enabled, location.pathname]);

  return (
    <MailingListPhoneModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Want the inside scoop?"
      subtitle="Add your mobile number to truly join our mailing list — we’ll text occasional deals, new flavors, and event news."
    />
  );
};

export default MailingListPopup;
