# EditFlow — AI Video Editing Agent

Prompt yaz → AI agent planlasın → timeline + preview + grade + export.

## Örnek prompt

> Rajab şarkısını kullanarak sık bir Mercedes CLS 63 AMG editi yap

## Çalıştırma

```bash
npm install
npm run dev
```

Açılan adreste prompt’unu yaz veya hazır örneklerden birine tıkla. Agent sırayla:

1. Prompt’u okur  
2. Niyeti analiz eder (araba, müzik, tempo, stil)  
3. Beat haritası çıkarır  
4. Görüntü seçer  
5. Timeline’ı kurar  
6. Color grade uygular  

Sonra önizlemeyi oynatıp MP4 export simülasyonunu çalıştırabilirsin.

## Stack

- React 19 + TypeScript + Vite  
- Yerel rule-based AI agent (API anahtarı gerekmez)  
- TR / EN arayüz  

## Not

Bu demo, gerçek video encode etmez; agent’ın planlama + beat-sync timeline + cinematic preview akışını gösterir. Gerçek render için FFmpeg / Remotion katmanı eklenebilir.
