import jsPDF from 'jspdf';

export function generateReport(results, file, logs, liveStats) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper to center text
  const centerText = (text, y, size = 12, isBold = false) => {
    doc.setFontSize(size);
    if (isBold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // We calculate the time spent and event counts in each state
  let leftMissingSec = 0;
  let rightMissingSec = 0;
  let bothGoodSec = 0;
  let leftMissingEvents = 0;
  let rightMissingEvents = 0;
  let bothGoodEvents = 0;
  
  const videoObj = document.querySelector('video');
  const duration = (videoObj && videoObj.duration) ? videoObj.duration : 
                   (results?.timeline?.length > 1 ? results.timeline[results.timeline.length-1].time + 2 : 10);

  if (results && results.timeline) {
    results.timeline.forEach((f, i) => {
      const startTime = f.time;
      const endTime = results.timeline[i+1] ? results.timeline[i+1].time : duration;
      const timeSpent = endTime - startTime;
      
      const lMiss = !f.left;
      const rMiss = !f.right;
      if (lMiss) { leftMissingSec += timeSpent; leftMissingEvents++; }
      if (rMiss) { rightMissingSec += timeSpent; rightMissingEvents++; }
      if (!lMiss && !rMiss) { bothGoodSec += timeSpent; bothGoodEvents++; }
    });
  }

  // A side is considered truly missing if it's missing for more than 20% of the video
  const isLeftMissing = leftMissingSec > (duration * 0.2);
  const isRightMissing = rightMissingSec > (duration * 0.2);
  const isGood = !isLeftMissing && !isRightMissing;
  const finalStatus = isGood ? 'Good' : 'Missing';

  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  centerText('INDUSTRIAL AI INSPECTION REPORT', 22, 18, true);
  centerText('Automated QA Hinge Detection System', 32, 10, false);

  // Metadata
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.text(`Date & Time: ${new Date().toLocaleString()}`, 20, 55);
  doc.text(`Video File: ${file?.name || 'Unknown'}`, 20, 65);
  doc.text(`Model Version: Vision-V3`, 20, 75);

  // Results Box
  const boxColor = isGood ? [16, 185, 129] : [225, 29, 72]; // Emerald vs Rose
  
  doc.setDrawColor(...boxColor);
  doc.setFillColor(isGood ? 236 : 255, isGood ? 253 : 241, isGood ? 245 : 242);
  doc.roundedRect(20, 85, pageWidth - 40, 40, 3, 3, 'FD');
  
  doc.setTextColor(...boxColor);
  doc.setFont('helvetica', 'bold');
  
  doc.text(`Left Missing: ${isLeftMissing ? 'YES' : 'NO'} (${leftMissingEvents} events, ${leftMissingSec.toFixed(1)}s)`, 25, 100);
  doc.text(`Right Missing: ${isRightMissing ? 'YES' : 'NO'} (${rightMissingEvents} events, ${rightMissingSec.toFixed(1)}s)`, 25, 115);
  doc.text(`Both Good: ${bothGoodEvents > 0 ? 'YES' : 'NO'} (${bothGoodEvents} events, ${bothGoodSec.toFixed(1)}s)`, 115, 100);
  
  // Graphical Barcode in PDF
  let barY = 135;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Defect Timeline (Red = Missing, Green = Present)', 20, barY);
  
  barY += 5;
  const barMaxWidth = pageWidth - 40;
  
  // Left Barcode
  doc.text('LEFT:', 20, barY + 4);
  if (results && results.timeline) {
    results.timeline.forEach((f, i) => {
      const startX = 20 + 15 + (f.time / duration) * (barMaxWidth - 15);
      const endT = results.timeline[i+1] ? results.timeline[i+1].time : duration;
      const w = ((endT - f.time) / duration) * (barMaxWidth - 15);
      doc.setFillColor(f.left ? 52 : 244, f.left ? 211 : 63, f.left ? 153 : 94); // emerald-400 vs rose-500
      doc.rect(startX, barY, w, 6, 'F');
    });
  }
  
  barY += 10;
  // Right Barcode
  doc.text('RIGHT:', 20, barY + 4);
  if (results && results.timeline) {
    results.timeline.forEach((f, i) => {
      const startX = 20 + 15 + (f.time / duration) * (barMaxWidth - 15);
      const endT = results.timeline[i+1] ? results.timeline[i+1].time : duration;
      const w = ((endT - f.time) / duration) * (barMaxWidth - 15);
      doc.setFillColor(f.right ? 52 : 244, f.right ? 211 : 63, f.right ? 153 : 94); // emerald-400 vs rose-500
      doc.rect(startX, barY, w, 6, 'F');
    });
  }

  let yOffset = barY + 20;
  try {
    const videoObj = document.querySelector('video');
    if (videoObj && !videoObj.paused) {
        videoObj.pause(); // ensure we get a stable frame
    }
    if (videoObj) {
      const canvas = document.createElement('canvas');
      canvas.width = videoObj.videoWidth;
      canvas.height = videoObj.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoObj, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Defect Frame Snapshot:', 20, yOffset);
      
      // Calculate aspect ratio fit
      const maxW = pageWidth - 40;
      const maxH = 90;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      
      doc.addImage(imgData, 'JPEG', (pageWidth - imgW)/2, yOffset + 5, imgW, imgH);
      yOffset += imgH + 20;
    }
  } catch (e) {
    console.warn("Could not capture video frame", e);
  }

  // System Logs
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Processing Logs:', 20, yOffset);
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  yOffset += 10;
  logs.forEach((log) => {
    if (yOffset > 270) {
      doc.addPage();
      yOffset = 20;
    }
    const cleanMsg = log.msg.replace(/[^\x20-\x7E]/g, ''); // strip emoji/weird chars for jspdf
    doc.text(`[${log.time}] ${cleanMsg}`, 20, yOffset);
    yOffset += 7;
  });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  centerText('Generated automatically by the AI Hinge Detection System', 285);

  doc.save(`inspection_report_${new Date().getTime()}.pdf`);
}
