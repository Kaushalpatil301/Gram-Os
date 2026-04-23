import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPDF(el, filename = "report.pdf") {
  if (!el) return;

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll("*").forEach((node) => {
        // 1. Fix inline styles containing oklch/oklab
        const style = node.getAttribute("style");
        if (style && (style.includes("oklch") || style.includes("oklab"))) {
          node.setAttribute(
            "style",
            style
              .replace(/oklch\([^\)]+\)/g, "#000000")
              .replace(/oklab\([^\)]+\)/g, "#000000")
          );
        }

        // 2. Fix computed styles (background, text, border colors)
        const computed = clonedDoc.defaultView.getComputedStyle(node);

        const replaceIfBad = (prop, fallback) => {
          if (
            computed[prop] &&
            (computed[prop].includes("oklch") ||
              computed[prop].includes("oklab"))
          ) {
            node.style[prop] = fallback;
          }
        };

        replaceIfBad("backgroundColor", "#ffffff");
        replaceIfBad("color", "#000000");
        replaceIfBad("borderColor", "#000000");
      });
    },
  });

  // Convert canvas to image
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 48; // margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const y = 24;

  if (imgHeight < pageHeight) {
    // Single page
    pdf.addImage(imgData, "PNG", 24, y, imgWidth, imgHeight);
  } else {
    // Multi-page handling
    let position = 0;
    const pageCanvas = document.createElement("canvas");
    const pageCtx = pageCanvas.getContext("2d");
    const ratio = imgWidth / canvas.width;
    const pageHeightPx = pageHeight / ratio;

    while (position < canvas.height) {
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(pageHeightPx, canvas.height - position);

      pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0,
        position,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImg = pageCanvas.toDataURL("image/png");
      if (position > 0) pdf.addPage();
      pdf.addImage(pageImg, "PNG", 24, y, imgWidth, pageCanvas.height * ratio);

      position += pageHeightPx;
    }
  }

  // Save PDF
  pdf.save(filename);
}