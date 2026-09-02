// localStorage 安全存取層：封鎖第三方儲存（LMS iframe、Safari 全面封鎖 Cookie）、
// 隱私模式或 QuotaExceeded 時，讀寫都不得讓 React render 崩潰。
// 讀取端原本各自包 try/catch；寫入端先前全裸，這裡統一收斂。

export function readLocalStorage(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
