document.addEventListener("DOMContentLoaded", function () {
  const useRadios = document.querySelectorAll('input[name="use"]');
  const bedSizeGroup = document.getElementById("bed-size-group");
  const overhangGroup = document.getElementById("overhang-group");
  const throwSizeGroup = document.getElementById("throw-size-group");

  useRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const useValue = document.querySelector('input[name="use"]:checked').value;

      if (useValue === "Throw for couch") {
        bedSizeGroup.style.display = "none";
        overhangGroup.style.display = "none";
        throwSizeGroup.style.display = "block";
      } else {
        bedSizeGroup.style.display = "block";
        overhangGroup.style.display = "block";
        throwSizeGroup.style.display = "none";
      }

      document.getElementById("output").innerHTML = ""; // Clear output on change
    });
  });

  document.getElementById("generate-button").addEventListener("click", generatePlan);
});

function generatePlan() {
  try {
    const use = document.querySelector('input[name="use"]:checked')?.value || "";
    let totalWidth = 0;
    let totalLength = 0;
    let bedWidth = 0,
      bedLength = 0,
      overhang = 0;
    let throwSize = "";
    let bedName = "";

    // Determine total quilt size
    if (use === "Throw for couch") {
      const tsInput = document.querySelector('input[name="throw-size"]:checked');
      throwSize = tsInput?.value;
      const throwSizes = {
        small: [50, 40],
        standard: [60, 50],
        large: [70, 60],
        oversized: [80, 70],
      };

      if (!throwSizes[throwSize]) {
        document.getElementById("output").innerHTML =
          "<p>Please select a throw blanket size.</p>";
        return;
      }
      [totalWidth, totalLength] = throwSizes[throwSize];
    } else {
      const bedSizeInput = document.querySelector('input[name="bed-size"]:checked');
      if (!bedSizeInput) {
        document.getElementById("output").innerHTML = "<p>Please select a bed size.</p>";
        return;
      }
      [bedWidth, bedLength] = bedSizeInput.value.split("x").map(Number);

      const bedSizeMap = {
        "28x52": "crib",
        "38x75": "twin",
        "38x80": "twin XL",
        "54x75": "full",
        "60x80": "queen",
        "76x80": "king",
        "72x84": "california king",
      };
      const bedKey = `${bedWidth}x${bedLength}`;
      bedName = bedSizeMap[bedKey] || `${bedWidth} x ${bedLength}"`;

      overhang = parseFloat(document.getElementById("overhang").value) || 0;
      totalWidth = bedWidth + overhang * 2;
      totalLength = bedLength + overhang * 2;
    }

    // Validate input sizes
const maxInput = Math.min(totalWidth, totalLength);
const blockSizeInput = parseFloat(document.getElementById("block-size").value) || 0;
const sashingInput = parseFloat(document.getElementById("sashing").value) || 0;
const borderInput = parseFloat(document.getElementById("border").value) || 0;
const overhangInput = parseFloat(document.getElementById("overhang").value) || 0;

let error = "";

if (blockSizeInput > maxInput) {
  error = `Block size (${blockSizeInput}") is too large for the quilt.`;
} else if (sashingInput > maxInput / 2) {
  error = `Sashing (${sashingInput}") is too wide for this quilt.`;
} else if (borderInput > maxInput / 2) {
  error = `Border (${borderInput}") is too wide for this quilt.`;
} else if (use !== "Throw for couch" && overhangInput > Math.min(bedWidth, bedLength) / 2) {
  error = `Overhang (${overhangInput}") is too large for the selected bed size.`;
}

if (error) {
  const out = document.getElementById("output");
  out.innerHTML = `<p style="color: #b50909; font-weight: bold;">Error: ${error}</p>`;
  out.style.display = "block";
  out.scrollIntoView({ behavior: "smooth" });
  return;
}



    // User Inputs
    const blockSize = parseFloat(document.getElementById("block-size").value) || 0;
    const sashing = parseFloat(document.getElementById("sashing").value) || 0;
    const border = parseFloat(document.getElementById("border").value) || 0;

    // Block layout
    const finishedBlock = blockSize + sashing;
    const blocksAcross = Math.round(totalWidth / finishedBlock);
    const blocksDown = Math.round(totalLength / finishedBlock);

    // Quilt top size (before borders)
    const topWidth = blocksAcross * finishedBlock - sashing;
    const topLength = blocksDown * finishedBlock - sashing;

    // Final quilt size (including borders)
    const quiltWidth = topWidth + border * 2;
    const quiltLength = topLength + border * 2;

    // Cutting sizes
    const cutBlockSize = (blockSize + 0.5).toFixed(1);
    const cutSashing = sashing > 0 ? (sashing + 0.5).toFixed(1) : null;
    const cutBorder = border > 0 ? (border + 0.5).toFixed(1) : null;

    // Yardage + strips (42" wide fabric)
    const WOF = 42;

    // Sashing
    const sashingLenIn =
      sashing > 0 ? (blocksAcross - 1) * quiltLength + (blocksDown - 1) * quiltWidth : null;
    const sashingLenYd = sashingLenIn != null ? (sashingLenIn / 36).toFixed(2) : null;
    const sashingStrips = sashingLenIn != null ? Math.ceil(sashingLenIn / WOF) : null;

    // Border
    const borderLenIn = border > 0 ? 2 * (topWidth + topLength) : null;
    const borderLenYd = borderLenIn != null ? (borderLenIn / 36).toFixed(2) : null;
    const borderStrips = borderLenIn != null ? Math.ceil(borderLenIn / WOF) : null;

    // Binding
    const bindingLenIn = 2 * (quiltWidth + quiltLength) + 10;
    const bindingLenYd = (bindingLenIn / 36).toFixed(2);
    const bindingStrips = Math.ceil(bindingLenIn / WOF);

   // Summary
const summary = `You’re making a ${
  use === "Throw for couch"
    ? `${throwSize} throw blanket`
    : `cover for a ${bedName} (${bedWidth}" x ${bedLength}") bed`
} with ${blockSize}" square blocks${
  sashing > 0 ? `, ${sashing}" sashing` : ""
}${border > 0 ? `, and a ${border}" border` : ""}.${
  use !== "Throw for couch" && overhang > 0
    ? ` You want it to overhang the bed by ${overhang}."`
    : ""
}`;

// Output
const planTitle =
  use === "Throw for couch"
    ? `${throwSize.charAt(0).toUpperCase() + throwSize.slice(1)} throw blanket`
    : `${bedName.charAt(0).toUpperCase() + bedName.slice(1)} bed cover`;

let html = `<h2>${planTitle}</h2><span class="hint">${summary}</span>`;


html += `<p><strong>Finished quilt</strong><br>${quiltWidth.toFixed(1)}" x ${quiltLength.toFixed(1)}"</p>`;

html += `<p><strong>Blocks</strong><br>${blocksAcross * blocksDown} total blocks (${blocksAcross} across by ${blocksDown} down).<br>Cut blocks to ${cutBlockSize}" x ${cutBlockSize}".</p>`;

if (cutSashing) {
  html += `<p><strong>Sashing</strong><br>Cut sashing strips to ${cutSashing}" wide.<br>You’ll need ${sashingStrips} strips from 42" wide fabric.</p>`;
}

if (cutBorder) {
  html += `<p><strong>Border</strong><br>Cut border strips to ${cutBorder}" wide.<br>You’ll need ${borderStrips} strips from 42" wide fabric.</p>`;
}

html += `<p><strong>Binding</strong><br>Cut binding strips to 2.5" wide.<br>You’ll need ${bindingStrips} strips from 42" wide fabric.</p>`;

// Backing Fabric Calculations
function getBackingPlan(fabricWidth) {
  let panels, totalLength;
  if (fabricWidth >= quiltWidth) {
    panels = 1;
    totalLength = quiltLength;
  } else {
    panels = Math.ceil(quiltWidth / fabricWidth);
    totalLength = panels * quiltLength;
  }
  return {
    width: fabricWidth,
    panels,
    yards: (totalLength / 36).toFixed(2),
  };
}

const standardBacking = getBackingPlan(42);
const wideBacking = getBackingPlan(108);

html += `<p><strong>Backing</strong><br>
You'll need ${standardBacking.yards} yards of 42" fabric. Cut in ${standardBacking.panels} panels.<br>
Or ${wideBacking.yards} yards of extra wide fabric. Cut in ${wideBacking.panels} panels.</p>`;

    // Batting Size Recommendation
const battingSizes = [
  { name: "Crib", width: 45, length: 60 },
  { name: "Twin", width: 72, length: 90 },
  { name: "Full", width: 81, length: 96 },
  { name: "Queen", width: 90, length: 108 },
  { name: "King", width: 120, length: 120 },
  { name: "California King", width: 120, length: 122 },
];

// Find smallest size that fits
const batting = battingSizes.find(b => b.width >= quiltWidth && b.length >= quiltLength);

if (batting) {
  html += `<p><strong>Batting</strong><br>
  You'll need ${batting.name} size batting (${batting.width}" x ${batting.length}").</p>`;
} else {
  html += `<p><strong>Batting</strong><br>
  Your quilt is larger than standard batting sizes. You’ll need to piece batting or buy extra-wide rolls.</p>`;
}

    // Set max attributes based on total quilt size
document.getElementById("block-size").max = Math.min(totalWidth, totalLength);
document.getElementById("sashing").max = Math.min(totalWidth, totalLength) / 2;
document.getElementById("border").max = Math.min(totalWidth, totalLength) / 2;
if (use !== "Throw for couch") {
  document.getElementById("overhang").max = Math.min(bedWidth, bedLength) / 2;
}

    
    const out = document.getElementById("output");

    
    html += `
  <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
    <button id="copy-plan-button" type="button" class="copy-button">
      <i class="fa-solid fa-copy" style="margin-right: 0.5em;"></i>Copy plan
    </button>
    <button id="feedback-button" type="button" class="outline-button">
      Give feedback <i class="fa-solid fa-up-right-from-square" style="margin-left: 0.5em;"></i>
    </button>
  </div>`;

    
    out.innerHTML = html;

document.getElementById("copy-plan-button").addEventListener("click", () => {
  const out = document.getElementById("output");
  const clone = out.cloneNode(true);

  // Remove UI buttons
  const copyBtn = clone.querySelector("#copy-plan-button");
  if (copyBtn) copyBtn.remove();
  const feedbackBtn = clone.querySelector("#feedback-button");
  if (feedbackBtn) feedbackBtn.remove();

  // Replace <hr> with plain text divider
  clone.querySelectorAll("hr").forEach((hr) => {
    hr.replaceWith(document.createTextNode("\n\n---\n\n"));
  });

  // Convert HTML to plain text with spacing preserved
  function getTextWithLineBreaks(node) {
    let text = "";

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === "BR") {
          text += "\n";
        } else if (child.tagName === "P") {
          text += getTextWithLineBreaks(child).trim() + "\n\n";
        } else if (child.tagName === "H2") {
          text += "\n" + getTextWithLineBreaks(child).trim().toUpperCase() + "\n\n";
        } else {
          text += getTextWithLineBreaks(child);
        }
      }
    });

    return text;
  }

  const plainText = getTextWithLineBreaks(clone).trim();

  navigator.clipboard.writeText(plainText).then(() => {
    alert("Plan copied to clipboard!");
  }).catch((err) => {
    console.error("Copy failed:", err);
    alert("Failed to copy plan. Try using a different browser.");
  });
});


// Still keep this if you want the feedback button on the live page to open the form
document.getElementById("feedback-button").addEventListener("click", () => {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLScRJtzvGLaC22oTmgbU4Us7MTRIaOFjNdx3cU4_3HRNKp1hUg/viewform?usp=preview",
    "_blank"
  );
});



    out.style.display = "block";
    out.scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}
