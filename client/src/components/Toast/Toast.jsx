import { useEffect } from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role='alert'
      data-testid='toast-message'
    >
      <div className={styles.content}>{message}</div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label='Close notification'
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
