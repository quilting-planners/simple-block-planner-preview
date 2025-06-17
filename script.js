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

      document.getElementById("output").innerHTML = "";
    });
  });

  document.getElementById("generate-button").addEventListener("click", generatePlan);
});

function generatePlan() {
  try {
    const use = document.querySelector('input[name="use"]:checked')?.value || "";
    let totalWidth = 0, totalLength = 0, bedWidth = 0, bedLength = 0, overhang = 0;
    let throwSize = "", bedName = "";

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
        document.getElementById("output").innerHTML = "<p>Please select a throw blanket size.</p>";
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
      bedName = bedSizeMap[bedKey] || `${bedWidth} x ${bedLength}`;
      overhang = parseFloat(document.getElementById("overhang").value) || 0;
      totalWidth = bedWidth + overhang * 2;
      totalLength = bedLength + overhang * 2;
    }

    const blockSize = parseFloat(document.getElementById("block-size").value) || 0;
    const sashing = parseFloat(document.getElementById("sashing").value) || 0;
    const border = parseFloat(document.getElementById("border").value) || 0;

    const finishedBlock = blockSize + sashing;
    const blocksAcross = Math.round(totalWidth / finishedBlock);
    const blocksDown = Math.round(totalLength / finishedBlock);
    const topWidth = blocksAcross * finishedBlock - sashing;
    const topLength = blocksDown * finishedBlock - sashing;
    const quiltWidth = topWidth + border * 2;
    const quiltLength = topLength + border * 2;

    const cutBlockSize = (blockSize + 0.5).toFixed(1);
    const cutSashing = sashing > 0 ? (sashing + 0.5).toFixed(1) : null;
    const cutBorder = border > 0 ? (border + 0.5).toFixed(1) : null;

    const WOF = 42;

    const sashingLenIn = sashing > 0 ? (blocksAcross - 1) * quiltLength + (blocksDown - 1) * quiltWidth : null;
    const sashingStrips = sashingLenIn ? Math.ceil(sashingLenIn / WOF) : null;
    const sashingYards = sashingLenIn ? (sashingLenIn / 36).toFixed(2) : null;

    const borderLenIn = border > 0 ? 2 * (topWidth + topLength) : null;
    const borderStrips = borderLenIn ? Math.ceil(borderLenIn / WOF) : null;
    const borderYards = borderLenIn ? (borderLenIn / 36).toFixed(2) : null;

    const bindingLenIn = 2 * (quiltWidth + quiltLength) + 10;
    const bindingStrips = Math.ceil(bindingLenIn / WOF);
    const bindingYards = (bindingLenIn / 36).toFixed(2);

    const summary = `You’re making a ${
      use === "Throw for couch"
        ? `${throwSize} throw blanket`
        : `cover for a ${bedName} bed (${bedWidth} in x ${bedLength} in)`
    } with ${blockSize} in blocks${
      sashing > 0 ? `, ${sashing} in sashing` : ""
    }${border > 0 ? `, and a ${border} in border` : ""}${
      use !== "Throw for couch" && overhang > 0 ? ` and ${overhang} in overhang` : ""
    }.`

    const planTitle = use === "Throw for couch"
      ? `${throwSize.charAt(0).toUpperCase() + throwSize.slice(1)} throw blanket`
      : `${bedName.charAt(0).toUpperCase() + bedName.slice(1)} bed cover`;

    let html = `<h2>${planTitle}</h2><span class="hint">${summary}</span>`;
    html += `<p><strong>Finished quilt</strong><br>${quiltWidth.toFixed(1)} in x ${quiltLength.toFixed(1)} in</p>`;
    html += `<p><strong>Blocks</strong><br>${blocksAcross * blocksDown} total blocks (${blocksAcross} x ${blocksDown})<br>Cut to ${cutBlockSize} in x ${cutBlockSize} in</p>`;

    if (cutSashing) {
      html += `<p><strong>Sashing</strong><br>Cut sashing strips to ${cutSashing} in wide.<br>You’ll need ${sashingStrips} strips from 42" fabric (${sashingYards} yards).</p>`;
    }

    if (cutBorder) {
      html += `<p><strong>Border</strong><br>Cut border strips to ${cutBorder} in wide.<br>You’ll need ${borderStrips} strips from 42" fabric (${borderYards} yards).</p>`;
    }

    html += `<p><strong>Binding</strong><br>Cut binding strips to 2.5 in wide.<br>You’ll need ${bindingStrips} strips from 42" fabric (${bindingYards} yards).</p>`;

    // Backing Fabric
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
      Or ${wideBacking.yards} yards of extra-wide fabric. Cut in ${wideBacking.panels} panels.</p>`;

    // Batting Recommendations
    const battingSizes = [
      { name: "Crib", width: 46, length: 60, url: "https://www.missouriquiltco.com/products/crib-size-quilters-dream-cotton-batting-select-loft" },
      { name: "Throw", width: 60, length: 60, url: "https://www.missouriquiltco.com/products/throw-size-quilters-dream-cotton-batting-select-loft" },
      { name: "Twin", width: 72, length: 93, url: "https://www.missouriquiltco.com/products/twin-size-quilters-dream-cotton-batting-select-loft" },
      { name: "Double", width: 93, length: 96, url: "https://www.missouriquiltco.com/products/double-size-quilters-dream-cotton-batting-select-loft" },
      { name: "Queen", width: 108, length: 93, url: "https://www.missouriquiltco.com/products/queen-size-quilters-dream-cotton-batting-select-loft" },
      { name: "King", width: 122, length: 120, url: "https://www.missouriquiltco.com/products/king-size-quilters-dream-cotton-batting-select-loft" },
    ];

    const batting = battingSizes.find(b => b.width >= quiltWidth && b.length >= quiltLength);

    if (batting) {
      html += `<p><strong>Batting</strong><br>
        You'll need <a href="${batting.url}" target="_blank">${batting.name} size Quilter’s Dream Select Loft batting</a> (${batting.width}" x ${batting.length}").</p>`;
    } else {
      html += `<p><strong>Batting</strong><br>Your quilt is larger than standard batting sizes. You may need to piece batting or buy it by the roll.</p>`;
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
    out.style.display = "block";
    out.scrollIntoView({ behavior: "smooth" });

    document.getElementById("copy-plan-button").addEventListener("click", () => {
      const clone = out.cloneNode(true);
      clone.querySelector("#copy-plan-button")?.remove();
      clone.querySelector("#feedback-button")?.remove();
      navigator.clipboard.writeText(clone.textContent.trim()).then(() => alert("Plan copied to clipboard!"));
    });

    document.getElementById("feedback-button").addEventListener("click", () => {
      window.open("https://docs.google.com/forms/d/e/1FAIpQLScRJtzvGLaC22oTmgbU4Us7MTRIaOFjNdx3cU4_3HRNKp1hUg/viewform?usp=preview", "_blank");
    });

  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}
