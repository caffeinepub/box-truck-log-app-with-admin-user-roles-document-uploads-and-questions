import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ChecklistSubmission } from "../../backend";

interface ChecklistDetailsProps {
  submission: ChecklistSubmission;
}

export default function ChecklistDetails({
  submission,
}: ChecklistDetailsProps) {
  const checkedMap = new Map(submission.checked);
  const stats = {
    completed: submission.checked.filter(([_, checked]) => checked).length,
    total: submission.checked.length,
  };

  // Define all sections with their items based on the backend structure
  const sections = [
    {
      title: "RESTRAINT & CARGO EQUIPMENT",
      items: ["straps", "sliders", "pallet_jack", "tie_downs"],
    },
    {
      title: "STRAP CONDITION",
      items: [
        "fabric_integrity",
        "strain_points",
        "edge_protection",
        "seam_integrity",
      ],
    },
    {
      title: "PALLET JACK",
      items: ["pallet_jack"],
    },
    {
      title: "SHELVES & BIN SYSTEM",
      items: ["secure_fasteners", "bin_organization", "custom_racks"],
    },
    {
      title: "CARGO WALLS & TIE-DOWN POINTS",
      items: ["inspection_ports", "tie_down_points"],
    },
  ];

  const formatItemName = (id: string) => {
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">
            {stats.completed} / {stats.total}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Signature</p>
          <p className="font-medium">{submission.signature}</p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const sectionItems = section.items.map((id) => ({
          id,
          checked: checkedMap.get(id) || false,
        }));
        const sectionCompleted = sectionItems.filter(
          (item) => item.checked,
        ).length;

        return (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <Badge variant="outline">
                {sectionCompleted} / {sectionItems.length}
              </Badge>
            </div>
            <div className="space-y-2 pl-4">
              {sectionItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1">
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={
                      item.checked ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {formatItemName(item.id)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
