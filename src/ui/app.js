// PersianClean Studio - Modern Frontend Client

const sampleText = `اين يک متن آزمايشي است كه به صورت خيلي سريع تايپ شده است!!! 
در اينجا كشور هاي اسلامي و خانه ها ي زيبا ديده مي شود. من مي توانم به سرعت بروم چون كتاب هاي ارزشمند تر و زيبا ترين ها در سال 2026 توليد مي شوند. 
"برنامه نويسي به زبان فارسي" بايد استاندارد باشد،چرا كه اين مهم ترين اصل در زبان هاي رايانه اي است .
آيا تا بحال فكر كرده ايد كه چگونه مي توان متون فارسي را پاكيزه نمود؟`;

const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const chkZwnj = document.getElementById('chkZwnj');
const chkChars = document.getElementById('chkChars');
const chkDigits = document.getElementById('chkDigits');
const chkPunct = document.getElementById('chkPunct');

const metricWords = document.getElementById('metricWords');
const metricChars = document.getElementById('metricChars');
const metricZwnj = document.getElementById('metricZwnj');
const metricArabic = document.getElementById('metricArabic');

const loadSampleBtn = document.getElementById('loadSampleBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');
const downloadOutputBtn = document.getElementById('downloadOutputBtn');
const toast = document.getElementById('toast');

let debounceTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function toPersianDigits(num) {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
}

async function cleanText() {
  const text = inputText.value;
  if (!text) {
    outputText.value = '';
    metricWords.textContent = '۰';
    metricChars.textContent = '۰';
    metricZwnj.textContent = '۰';
    metricArabic.textContent = '۰';
    return;
  }

  const payload = {
    text,
    options: {
      fixZwnj: chkZwnj.checked,
      normalizeChars: chkChars.checked,
      convertDigits: chkDigits.checked,
      fixPunctuation: chkPunct.checked
    }
  };

  try {
    const res = await fetch('/api/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('API Error');
    const data = await res.json();

    outputText.value = data.cleaned || '';
    if (data.stats) {
      metricWords.textContent = toPersianDigits(data.stats.words || 0);
      metricChars.textContent = toPersianDigits(data.stats.characters || 0);
      metricZwnj.textContent = toPersianDigits(data.stats.zwnjCount || 0);
      metricArabic.textContent = toPersianDigits(data.stats.arabicCharsFixed || 0);
    }
  } catch (err) {
    console.error('Failed to clean via API, falling back to local clean:', err);
  }
}

function scheduleClean() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(cleanText, 150);
}

// Event Listeners
inputText.addEventListener('input', scheduleClean);
[chkZwnj, chkChars, chkDigits, chkPunct].forEach((el) => {
  el.addEventListener('change', scheduleClean);
});

loadSampleBtn.addEventListener('click', () => {
  inputText.value = sampleText;
  cleanText();
  showToast('متن نمونه بارگذاری شد');
});

clearInputBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  metricWords.textContent = '۰';
  metricChars.textContent = '۰';
  metricZwnj.textContent = '۰';
  metricArabic.textContent = '۰';
  inputText.focus();
});

copyOutputBtn.addEventListener('click', async () => {
  if (!outputText.value) return;
  try {
    await navigator.clipboard.writeText(outputText.value);
    showToast('متن پاک‌سازی‌شده در حافظه کپی شد!');
  } catch {
    outputText.select();
    document.execCommand('copy');
    showToast('متن پاک‌سازی‌شده کپی شد!');
  }
});

downloadOutputBtn.addEventListener('click', () => {
  if (!outputText.value) return;
  const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cleaned-persian-text.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('فایل متنی دانلود شد');
});

// Initial sample
inputText.value = sampleText;
cleanText();
