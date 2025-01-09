const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const promptSection = document.getElementById('promptSection');
const sendButton = document.getElementById('sendButton');
const retryButton = document.getElementById('retryButton');
const promptInput = document.getElementById('promptInput');
const resultDiv = document.getElementById('result');
const aiModelSelect = document.getElementById('aiModelSelect');

const constraints = {
  video: {
    facingMode: { ideal: 'environment' }
  }
};

// カメラの起動
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (error) {
    console.error('カメラの起動に失敗しました:', error);
  }
}

// 写真の撮影
captureButton.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  video.style.display = 'none';
  captureButton.style.display = 'none';
  canvas.style.display = 'block';
  promptSection.style.display = 'flex';
});

// 再撮影
retryButton.addEventListener('click', () => {
  canvas.style.display = 'none';
  promptSection.style.display = 'none';
  resultDiv.innerHTML = "";
  // promptInput.value = "";

  video.style.display = 'block';
  captureButton.style.display = 'block';
});

// 送信ボタンの処理
sendButton.addEventListener('click', async () => {
  const imageData = canvas.toDataURL('image/png');
  const prompt = promptInput.value;
  const model = aiModelSelect.value;

  if (!prompt) {
    alert('プロンプトを入力してください。');
    return;
  }

  if (!model) {
    alert('AIモデルを選択してください。');
    return;
  }

  promptInput.disabled = true;
  sendButton.disabled = true;
  retryButton.disabled = true;
  resultDiv.innerHTML = "解析中...";

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData, prompt, model })
    });

    const result = await response.json();
    if (result && result.description) {
      resultDiv.innerHTML = `<strong>解析結果:</strong> ${result.description}`;
    } else {
      resultDiv.innerHTML = `<strong>解析結果:</strong> データが取得できませんでした。`;
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
    resultDiv.innerHTML = `<strong>解析結果:</strong> エラーが発生しました。`;
  } finally {
    promptInput.disabled = false;
    sendButton.disabled = false;
    retryButton.disabled = false;
  }
});

window.addEventListener('load', initCamera);
