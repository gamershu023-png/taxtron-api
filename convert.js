
"use strict";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_PDF_PAGES = 500;
const MAX_IMAGE_PIXELS = 40000000;

const $ = id => document.getElementById(id);

$("year").textContent = new Date().getFullYear();

function setStatus(id, message, type = "") {
  const el = $(id);
  el.textContent = message;
  el.className = "status " + type;
}

function setBusy(id, busy, label) {
  const btn = $(id);
  btn.disabled = busy;
  btn.textContent = busy ? "Processing..." : label;
}

function validateFile(file, allowedTypes, statusId) {
  if (!file) {
    setStatus(statusId, "Please select a file.", "error");
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    setStatus(statusId, "Maximum file size is 50 MB.", "error");
    return false;
  }

  const ext = file.name.split(".").pop().toLowerCase();
  const allowedExtensions = {
    pdf: ["pdf"],
    image: ["png", "jpg", "jpeg", "webp"]
  };

  const validExtension = allowedExtensions[allowedTypes]?.includes(ext);

  if (!validExtension) {
    setStatus(statusId, "Unsupported file format.", "error");
    return false;
  }

  return true;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + " KB";

  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function safeFilename(name) {
  return name.replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]/gi, "_")
    .slice(0, 70) || "taxtron";
}

// File selection information
function showFile(inputId, infoId, multiple = false) {
  $(inputId).addEventListener("change", () => {
    const files = [...$(inputId).files];

    $(infoId).textContent = files.length
      ? files.map(f => f.name + " (" + formatSize(f.size) + ")").join(", ")
      : "";

    if (multiple && files.length > 20) {
      $(infoId).textContent = "Maximum 20 files allowed.";
    }
  });
}

showFile("mergeFiles", "mergeInfo", true);
showFile("splitFile", "splitInfo");
showFile("convertFile", "convertStatus");
showFile("compressFile", "compressStatus");

// PDF MERGER
$("mergeBtn").addEventListener("click", async () => {
  const files = [...$("mergeFiles").files];

  if (files.length < 2) {
    return setStatus("mergeStatus", "Select at least 2 PDFs.", "error");
  }

  if (files.length > 20) {
    return setStatus("mergeStatus", "Maximum 20 PDFs allowed.", "error");
  }

  if (!files.every(f => validateFile(f, "pdf", "mergeStatus"))) return;

  setBusy("mergeBtn", true, "Merge PDFs →");
  setStatus("mergeStatus", "Combining documents...");

  try {
    const merged = await PDFLib.PDFDocument.create();
    let totalPages = 0;

    for (const file of files) {
      const pdf = await PDFLib.PDFDocument.load(
        await file.arrayBuffer()
      );

      const pageCount = pdf.getPageCount();
      totalPages += pageCount;

      if (totalPages > MAX_PDF_PAGES) {
        throw new Error("Combined PDF exceeds 500 pages.");
      }

      const pages = await merged.copyPages(
        pdf,
        pdf.getPageIndices()
      );

      pages.forEach(page => merged.addPage(page));
    }

    const bytes = await merged.save();

    downloadBlob(
      new Blob([bytes], { type: "application/pdf" }),
      "taxtron-merged.pdf"
    );

    setStatus("mergeStatus", "PDF merged successfully!", "success");

  } catch (error) {
    setStatus(
      "mergeStatus",
      error.message || "Unable to merge PDFs. Check whether they are valid and unlocked.",
      "error"
    );
  } finally {
    setBusy("mergeBtn", false, "Merge PDFs →");
  }
});

// PDF PAGE RANGE PARSER
function parsePageRanges(value, total) {
  const ranges = value.split(",").map(s => s.trim());
  const pages = new Set();

  if (!value.trim() || ranges.length > 100) {
    throw new Error("Enter valid page numbers or ranges.");
  }

  for (const range of ranges) {
    const match = range.match(/^(\d+)(?:\s*-\s*(\d+))?$/);

    if (!match) {
      throw new Error("Invalid page range: " + range);
    }

    const start = Number(match[1]);
    const end = Number(match[2] || start);

    if (
      start < 1 ||
      end < start ||
      end > total ||
      end - start > MAX_PDF_PAGES
    ) {
      throw new Error("Page range must be between 1 and " + total + ".");
    }

    for (let i = start; i <= end; i++) {
      pages.add(i - 1);
    }
  }

  if (!pages.size || pages.size > MAX_PDF_PAGES) {
    throw new Error("Invalid number of pages.");
  }

  return [...pages].sort((a, b) => a - b);
}

// PDF SPLITTER
$("splitBtn").addEventListener("click", async () => {
  const file = $("splitFile").files[0];

  if (!validateFile(file, "pdf", "splitStatus")) return;

  setBusy("splitBtn", true, "Extract Pages →");
  setStatus("splitStatus", "Reading PDF...");

  try {
    const source = await PDFLib.PDFDocument.load(
      await file.arrayBuffer()
    );

    if (source.getPageCount() > MAX_PDF_PAGES) {
      throw new Error("Maximum 500 pages supported.");
    }

    const selectedPages = parsePageRanges(
      $("pageRange").value,
      source.getPageCount()
    );

    const output = await PDFLib.PDFDocument.create();

    const pages = await output.copyPages(source, selectedPages);
    pages.forEach(page => output.addPage(page));

    const bytes = await output.save();

    downloadBlob(
      new Blob([bytes], { type: "application/pdf" }),
      safeFilename(file.name) + "-extracted.pdf"
    );

    setStatus(
      "splitStatus",
      selectedPages.length + " pages extracted successfully!",
      "success"
    );

  } catch (error) {
    setStatus(
      "splitStatus",
      error.message || "Unable to split PDF.",
      "error"
    );
  } finally {
    setBusy("splitBtn", false, "Extract Pages →");
  }
});

// IMAGE LOADING
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.width * img.height > MAX_IMAGE_PIXELS) {
        URL.revokeObjectURL(url);
        reject(new Error("Image dimensions are too large."));
        return;
      }

      resolve({
        img,
        url
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };

    img.src = url;
  });
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error("Image conversion failed."));
        return;
      }

      // Some browsers fall back to PNG for unsupported formats.
      if (blob.type !== type) {
        reject(new Error("This image format is not supported by your browser."));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

async function processImage(file, format, quality) {
  const { img, url } = await loadImage(file);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const context = canvas.getContext("2d");

    if (!context) throw new Error("Canvas is unavailable.");

    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(img, 0, 0);

    return await canvasBlob(canvas, format, quality);

  } finally {
    URL.revokeObjectURL(url);
  }
}

// IMAGE CONVERTER
$("convertBtn").addEventListener("click", async () => {
  const file = $("convertFile").files[0];

  if (!validateFile(file, "image", "convertStatus")) return;

  const format = $("convertFormat").value;
  const extension = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp"
  }[format];

  setBusy("convertBtn", true, "Convert Image →");
  setStatus("convertStatus", "Converting image...");

  try {
    const blob = await processImage(file, format, 0.92);

    downloadBlob(
      blob,
      safeFilename(file.name) + "-converted." + extension
    );

    setStatus(
      "convertStatus",
      "Converted successfully · " + formatSize(blob.size),
      "success"
    );

  } catch (error) {
    setStatus("convertStatus", error.message, "error");
  } finally {
    setBusy("convertBtn", false, "Convert Image →");
  }
});

// IMAGE COMPRESSOR
$("quality").addEventListener("input", () => {
  $("qualityValue").textContent = $("quality").value + "%";
});

$("compressBtn").addEventListener("click", async () => {
  const file = $("compressFile").files[0];

  if (!validateFile(file, "image", "compressStatus")) return;

  const quality = Number($("quality").value) / 100;

  setBusy("compressBtn", true, "Compress Image →");
  setStatus("compressStatus", "Optimizing image...");

  try {
    const blob = await processImage(file, "image/webp", quality);

    downloadBlob(
      blob,
      safeFilename(file.name) + "-compressed.webp"
    );

    const difference = file.size
      ? ((file.size - blob.size) / file.size * 100).toFixed(1)
      : 0;

    const result = blob.size < file.size
      ? difference + "% smaller"
      : "Output is larger; original may already be optimized.";

    setStatus(
      "compressStatus",
      formatSize(file.size) + " → " + formatSize(blob.size) + " · " + result,
      "success"
    );

  } catch (error) {
    setStatus("compressStatus", error.message, "error");
  } finally {
    setBusy("compressBtn", false, "Compress Image →");
  }
});

// QR GENERATOR
let currentQR = null;

$("qrBtn").addEventListener("click", () => {
  const value = $("qrText").value.trim();
  const size = Number($("qrSize").value);

  if (!value) {
    return setStatus("qrStatus", "Enter text or a URL first.", "error");
  }

  if (value.length > 2000) {
    return setStatus("qrStatus", "Maximum 2,000 characters allowed.", "error");
  }

  if (!window.QRCode) {
    return setStatus("qrStatus", "QR library unavailable. Reload the page.", "error");
  }

  $("qrOutput").replaceChildren();
  $("qrDownload").classList.add("hidden");

  try {
    currentQR = new QRCode($("qrOutput"), {
      text: value,
      width: size,
      height: size,
      colorDark: "#020617",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    setStatus("qrStatus", "QR code generated successfully!", "success");
    $("qrDownload").classList.remove("hidden");

  } catch (error) {
    setStatus("qrStatus", "Unable to generate QR code.", "error");
  }
});

// QR DOWNLOAD
$("qrDownload").addEventListener("click", () => {
  const canvas = $("qrOutput").querySelector("canvas");

  if (canvas) {
    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, "taxtron-qr.png");
      else setStatus("qrStatus", "Unable to download QR code.", "error");
    }, "image/png");

    return;
  }

  const image = $("qrOutput").querySelector("img");

  if (image?.complete && image.naturalWidth) {
    fetch(image.src)
      .then(response => response.blob())
      .then(blob => downloadBlob(blob, "taxtron-qr.png"))
      .catch(() => setStatus("qrStatus", "Unable to download QR code.", "error"));
  }
});

