import React, { createContext, useContext, useMemo, useState } from 'react';

const DialogContext = createContext(null);
let dialogApi = null;

export function notify({ title = '알림', message = '', type = 'info', confirmText = '확인' } = {}) {
  if (!dialogApi) {
    return Promise.resolve(true);
  }
  return dialogApi.open({ title, message, type, confirmText, mode: 'alert' });
}

export function confirmDialog({
  title = '확인이 필요합니다',
  message = '',
  type = 'warning',
  confirmText = '확인',
  cancelText = '취소'
} = {}) {
  if (!dialogApi) {
    return Promise.resolve(false);
  }
  return dialogApi.open({ title, message, type, confirmText, cancelText, mode: 'confirm' });
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used inside DialogProvider.');
  }
  return context;
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const api = useMemo(() => ({
    open(config) {
      return new Promise((resolve) => {
        setDialog({ ...config, resolve });
      });
    },
    toast(config) {
      setToast(config);
      window.setTimeout(() => setToast(null), config.duration || 2200);
    }
  }), []);

  dialogApi = api;

  const close = (result) => {
    if (dialog?.resolve) {
      dialog.resolve(result);
    }
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      {toast ? (
        <div className={`app-toast app-toast--${toast.type || 'info'}`} role="status">
          <strong>{toast.title}</strong>
          {toast.message ? <span>{toast.message}</span> : null}
        </div>
      ) : null}
      {dialog ? (
        <div className="app-dialog" role="presentation">
          <div className="app-dialog__backdrop" onClick={() => close(false)} />
          <section className={`app-dialog__panel app-dialog__panel--${dialog.type || 'info'}`} role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
            <div className="app-dialog__icon" aria-hidden="true" />
            <div className="app-dialog__body">
              <h2 id="app-dialog-title">{dialog.title}</h2>
              {dialog.message ? <p>{dialog.message}</p> : null}
            </div>
            <div className="app-dialog__actions">
              {dialog.mode === 'confirm' ? (
                <button className="app-dialog__button app-dialog__button--ghost" type="button" onClick={() => close(false)}>
                  {dialog.cancelText || '취소'}
                </button>
              ) : null}
              <button className="app-dialog__button app-dialog__button--primary" type="button" onClick={() => close(true)} autoFocus>
                {dialog.confirmText || '확인'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </DialogContext.Provider>
  );
}
