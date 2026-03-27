import type { ChecklistSubmissionRecord } from "../pages/PublicChecklistPage";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeFromISO(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Load jsPDF and jspdf-autotable from CDN
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadPDFLibs(): Promise<{ jsPDF: any; autoTable: any }> {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
  );
  const w = window as any;
  const jsPDF = w.jspdf?.jsPDF ?? w.jsPDF;
  return { jsPDF, autoTable: null };
}

function buildSingleChecklistPDF(
  doc: any,
  submission: ChecklistSubmissionRecord,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(15, 40, 80); // dark navy
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFontSize(16);
  doc.setTextColor(255, 152, 0); // orange accent
  doc.setFont("helvetica", "bold");
  doc.text("Berks Bus Service", 14, 12);

  doc.setFontSize(10);
  doc.setTextColor(200, 210, 230);
  doc.setFont("helvetica", "normal");
  doc.text("Pre-Trip Checklist \u2014 28-ft Box Truck", 14, 21);

  let y = 38;

  // Driver info grid
  const pct =
    submission.totalItems > 0
      ? Math.round((submission.checkedCount / submission.totalItems) * 100)
      : 0;

  doc.autoTable({
    startY: y,
    head: [],
    body: [
      [
        "Driver Name",
        submission.driverName,
        "Truck #",
        submission.truckNumber ? `Truck ${submission.truckNumber}` : "\u2014",
      ],
      [
        "Date",
        formatDate(submission.timestamp),
        "Time",
        formatTime(submission.timestamp),
      ],
      [
        "Start Mileage",
        submission.startMileage ?? "\u2014",
        "End Mileage",
        submission.endMileage ?? "\u2014",
      ],
      [
        "Total Miles",
        submission.totalMiles ? `${submission.totalMiles} mi` : "\u2014",
        "Fuel Level",
        submission.fuelLevel ?? "\u2014",
      ],
      [
        "Completion",
        `${submission.checkedCount} / ${submission.totalItems} (${pct}%)`,
        "Driving Hours",
        submission.drivingHours ?? "\u2014",
      ],
      [
        "Time In",
        submission.timeIn ? formatTimeFromISO(submission.timeIn) : "\u2014",
        "Time Out",
        submission.timeOut ? formatTimeFromISO(submission.timeOut) : "\u2014",
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        fillColor: [240, 244, 255],
        textColor: [30, 40, 80],
        cellWidth: 32,
      },
      1: { cellWidth: 55 },
      2: {
        fontStyle: "bold",
        fillColor: [240, 244, 255],
        textColor: [30, 40, 80],
        cellWidth: 32,
      },
      3: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc.lastAutoTable?.finalY ?? y + 30) + 8;

  // Sections
  for (const section of submission.sections) {
    const rows = section.items.map((item) => [
      item.checked ? "\u2713" : "\u2717",
      item.label,
    ]);

    doc.autoTable({
      startY: y,
      head: [[{ content: `${section.emoji}  ${section.title}`, colSpan: 2 }]],
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [15, 40, 80],
        textColor: [255, 152, 0],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: {
          cellWidth: 12,
          fontStyle: "bold",
          halign: "center",
        },
        1: { cellWidth: "auto" },
      },
      didParseCell: (data: {
        section: string;
        row: { index: number };
        column: { index: number };
        cell: { styles: { textColor: number[] } };
      }) => {
        if (data.section === "body" && data.column.index === 0) {
          const item = section.items[data.row.index];
          if (item?.checked) {
            data.cell.styles.textColor = [34, 139, 34]; // green
          } else {
            data.cell.styles.textColor = [200, 40, 40]; // red
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc.lastAutoTable?.finalY ?? y) + 5;
  }

  // Repairs Needed section
  if (submission.repairsNeeded) {
    doc.autoTable({
      startY: y,
      head: [[{ content: "\ud83d\udd27  Repairs Needed", colSpan: 1 }]],
      body: [[submission.repairsNeeded]],
      theme: "striped",
      headStyles: {
        fillColor: [180, 30, 30],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 5;
  }

  // Footer line
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated by Berks Bus Service Checklist App \u2014 ${new Date().toLocaleString()}`,
    14,
    footerY,
  );
}

export async function generateSingleChecklistPDF(
  submission: ChecklistSubmissionRecord,
): Promise<void> {
  const { jsPDF } = await loadPDFLibs();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  buildSingleChecklistPDF(doc, submission);

  const safeDriverName = submission.driverName
    .replace(/[^a-z0-9]/gi, "_")
    .slice(0, 30);
  const dateStr = formatDate(submission.timestamp).replace(/[,\s]+/g, "-");
  doc.save(`checklist_${safeDriverName}_${dateStr}.pdf`);
}

export async function generateAllChecklistsPDF(
  submissions: ChecklistSubmissionRecord[],
): Promise<void> {
  if (submissions.length === 0) return;

  const { jsPDF } = await loadPDFLibs();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (let i = 0; i < submissions.length; i++) {
    if (i > 0) {
      doc.addPage();
    }
    buildSingleChecklistPDF(doc, submissions[i]);
  }

  const dateStr = new Date().toLocaleDateString("en-US").replace(/\//g, "-");
  doc.save(`berks_bus_service_checklists_${dateStr}.pdf`);
}
