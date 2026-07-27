import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { enableAdminPush, disableAdminPush, getPushPermissionState } from '../../utils/adminPush';

export default function AdminPushToggle({ variant = 'sidebar' }) {
  const { token } = useAdminAuth();
  const { actions } = useStore();
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const perm = await getPushPermissionState();
      if (cancelled) return;
      setState(perm);
      // Re-save subscription if this phone already allowed alerts
      if (perm === 'granted' && token) {
        try {
          await enableAdminPush(token);
        } catch {
          /* ignore — user can tap Enable again */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') return null;

  if (state === 'unsupported') {
    if (variant === 'banner') {
      return (
        <div className="admin-push-banner muted">
          Phone alerts need Chrome/Edge, or iPhone Safari 16.4+ after Add to Home Screen.
        </div>
      );
    }
    return (
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, padding: '0 4px' }}>
        Phone alerts need Chrome/Edge, or Safari (iOS 16.4+) after Add to Home Screen.
      </p>
    );
  }

  const enabled = state === 'granted';

  const toggle = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      if (enabled) {
        await disableAdminPush(token);
        setState('default');
        actions.toast('Order alerts turned off');
      } else {
        setState('enabling');
        await enableAdminPush(token);
        setState('granted');
        actions.toast('Order alerts on — you will get a phone notification');
      }
    } catch (err) {
      setState(await getPushPermissionState());
      actions.toast(err.message || 'Could not update notifications', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`admin-push-banner ${enabled ? 'on' : ''}`}>
        <span>
          {enabled
            ? 'Order alerts are on for this phone'
            : state === 'denied'
              ? 'Notifications blocked — enable them in browser settings'
              : 'Get a phone alert when someone places an order'}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-amber"
          onClick={toggle}
          disabled={busy || state === 'denied'}
        >
          {busy ? '…' : enabled ? 'Turn off' : 'Enable alerts'}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="admin-nav-item"
      onClick={toggle}
      disabled={busy || state === 'denied'}
      style={{
        color: enabled ? 'var(--amber-light)' : 'rgba(255,255,255,0.7)',
        marginTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 16,
        opacity: state === 'denied' ? 0.55 : 1,
      }}
      title={state === 'denied' ? 'Enable notifications in browser settings' : undefined}
    >
      {enabled ? <Bell size={18} /> : <BellOff size={18} />}
      {busy ? 'Please wait…' : enabled ? 'Alerts on' : state === 'denied' ? 'Alerts blocked' : 'Enable order alerts'}
    </button>
  );
}
