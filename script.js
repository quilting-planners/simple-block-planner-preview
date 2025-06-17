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
    const blockSize = parseFloat(document.getElementById("block-size").value) || 0;
    const sashing = parseFloat(document.getElementById("sashing").value) || 0;
    const border = parseFloat(document.getElementById("border").value) || 0;
    const overhangInput = parseFloat(document.getElementById("overhang").value) || 0;

    let error = "";
    if (blockSize > maxInput) {
      error = `Block size (${blockSize}") is too large for the quilt.`;
    } else if (sashing > maxInput / 2) {
      error = `Sashing (${sashing}") is too wide for this quilt.`;
    } else if (border > maxInput / 2) {
      error = `Border (${border}") is too wide for this quilt.`;
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

    // Block layout
    const finishedBlock = blockSize + sashing;
    const blocksAcross = Math.round(totalWidth / finishedBlock);
    const blocksDown = Math.round(totalLength / finishedBlock);
    const totalBlocks = blocksAcross * blocksDown;

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

    // Block fabric
    const blockArea = blockSize * blockSize * totalBlocks;
    const blockFabricYards = (blockArea / 1296).toFixed(2);

   // Sashing
let sashingStrips = null, sashingYards = null;
if (sashing > 0) {
  const sashingLenIn = (blocksAcross - 1) * quiltLength + (blocksDown - 1) * quiltWidth;
  sashingStrips = Math.ceil(sashingLenIn / WOF);
  sashingYards = ((sashingStrips * sashing) / 36).toFixed(2);
}

// Border
let borderStrips = null, borderYards = null;
if (border > 0) {
  const borderLenIn = 2 * (topWidth + topLength);
  borderStrips = Math.ceil(borderLenIn / WOF);
  borderYards = ((borderStrips * border) / 36).toFixed(2);
}

// Binding
const bindingWidth = 2.5;
const bindingLenIn = 2 * (quiltWidth + quiltLength) + 10;
const bindingStrips = Math.ceil(bindingLenIn / WOF);
const bindingYards = ((bindingStrips * bindingWidth) / 36).toFixed(2);


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

    const planTitle =
      use === "Throw for couch"
        ? `${throwSize.charAt(0).toUpperCase() + throwSize.slice(1)} throw blanket`
        : `${bedName.charAt(0).toUpperCase() + bedName.slice(1)} bed cover`;

    let html = `<h2>${planTitle}</h2><span class="hint">${summary}</span>`;
    html += `<p><strong>Finished quilt</strong><br>${quiltWidth.toFixed(1)}" x ${quiltLength.toFixed(1)}"</p>`;
    html += `<p><strong>Blocks</strong><br>${totalBlocks} total blocks (${blocksAcross} across by ${blocksDown} down).<br>Cut blocks to ${cutBlockSize}" x ${cutBlockSize}".<br>You’ll need at least ${blockFabricYards} yards of 42” fabric.</p>`;

  if (cutSashing) {
  html += `<p><strong>Sashing</strong><br>Cut sashing strips to ${cutSashing}" wide.<br>You’ll need ${sashingStrips} strips from 42" wide fabric (${sashingYards} yards).</p>`;
}

if (cutBorder) {
  html += `<p><strong>Border</strong><br>Cut border strips to ${cutBorder}" wide.<br>You’ll need ${borderStrips} strips from 42" wide fabric (${borderYards} yards).</p>`;
}

html += `<p><strong>Binding</strong><br>Cut binding strips to 2.5" wide.<br>You’ll need ${bindingStrips} strips from 42" wide fabric (${bindingYards} yards).</p>`;

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

    
    html += `
      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button id="copy-plan-button" type="button" class="copy-button">
          <i class="fa-solid fa-copy" style="margin-right: 0.5em;"></i>Copy plan
        </button>
        <button id="feedback-button" type="button" class="outline-button">
          Give feedback <i class="fa-solid fa-up-right-from-square" style="margin-left: 0.5em;"></i>
        </button>
      </div>`;

    const out = document.getElementById("output");
    out.innerHTML = html;

    document.getElementById("copy-plan-button").addEventListener("click", () => {
      const clone = out.cloneNode(true);
      clone.querySelector("#copy-plan-button")?.remove();
      clone.querySelector("#feedback-button")?.remove();
      clone.querySelectorAll("hr").forEach((hr) => {
        hr.replaceWith(document.createTextNode("\n\n---\n\n"));
      });

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

      navigator.clipboard.writeText(plainText)
        .then(() => alert("Plan copied to clipboard!"))
        .catch((err) => {
          console.error("Copy failed:", err);
          alert("Failed to copy plan. Try using a different browser.");
        });
    });

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
