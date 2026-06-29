import { CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ToastContainer() {
  const { state } = useStore();

  if (!state.toasts.length) return null;

  return (
    <div className="toast-container">
      {state.toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle size={16} color="var(--success)" />
            : <AlertCircle size={16} color="var(--error)" />
          }
          {toast.message}
        </div>
      ))}
    </div>
  );
}
