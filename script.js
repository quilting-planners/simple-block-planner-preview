
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

  document.querySelectorAll('input[name="unit"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const selected = document.querySelector('input[name="unit"]:checked').value;
      const unitLabels = document.querySelectorAll(".unit");

      unitLabels.forEach((label) => {
        label.textContent = selected === "cm" ? "centimeters" : "inches";
      });

      document.getElementById("output").innerHTML = "";
    });
  });

  document.getElementById("generate-button").addEventListener("click", generatePlan);
});

// Converts inches to display string in "cm" or "in"
function valueInInches.toFixed(1) + \'"\' {
  const unit = document.querySelector('input[name="unit"]:checked')?.value;
  return unit === "cm"
    ? (valueInInches * 2.54).toFixed(1) + ' in' cm"
    : valueInInches.toFixed(1) + ' in' in";
}

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

    // Continues...

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

    // [CALCULATIONS OMITTED HERE FOR BREVITY]

    // Add Copy & Feedback buttons
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

    // Copy Button Logic
    document.getElementById("copy-plan-button").addEventListener("click", () => {
      const out = document.getElementById("output");
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
            if (child.tagName === "BR") text += "\n";
            else if (child.tagName === "P") text += getTextWithLineBreaks(child).trim() + "\n\n";
            else if (child.tagName === "H2") text += "\n" + getTextWithLineBreaks(child).trim().toUpperCase() + "\n\n";
            else text += getTextWithLineBreaks(child);
          }
        });
        return text;
      }
      const plainText = getTextWithLineBreaks(clone).trim();
      navigator.clipboard.writeText(plainText).then(() => alert("Plan copied to clipboard!")).catch((err) => {
        console.error("Copy failed:", err);
        alert("Failed to copy plan. Try using a different browser.");
      });
    });

    // Feedback Button
    document.getElementById("feedback-button").addEventListener("click", () => {
      window.open(
        "https://docs.google.com/forms/d/e/1FAIpQLScRJtzvGLaC22oTmgbU4Us7MTRIaOFjNdx3cU4_3HRNKp1hUg/viewform?usp=preview",
        "_blank"
      );
    });

  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}
