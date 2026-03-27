import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Truck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ChecklistItemData {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistSection {
  title: string;
  emoji: string;
  items: ChecklistItemData[];
}

export interface ChecklistSubmissionRecord {
  id: string;
  driverName: string;
  startMileage?: string;
  endMileage?: string;
  totalMiles?: string;
  fuelLevel?: string;
  repairsNeeded?: string;
  sections: ChecklistSection[];
  timestamp: number;
  totalItems: number;
  checkedCount: number;
  timeIn?: string;
  timeOut?: string;
  drivingHours?: string;
  truckNumber?: string;
  location?: string;
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    title: "Documents & Cab",
    emoji: "🗂",
    items: [
      {
        id: "drivers_license",
        label: "Driver's license / CDL (if required)",
        checked: false,
      },
      { id: "registration", label: "Registration & insurance", checked: false },
      {
        id: "trip_paperwork",
        label: "Trip paperwork / BOL / delivery info",
        checked: false,
      },
      {
        id: "dot_inspection",
        label: "DOT inspection report (previous)",
        checked: false,
      },
      {
        id: "emergency_contacts",
        label: "Emergency contact numbers",
        checked: false,
      },
      {
        id: "first_aid_kit",
        label: "First-aid kit (if required)",
        checked: false,
      },
      { id: "seatbelt", label: "Seatbelt functional", checked: false },
      { id: "horn", label: "Horn working", checked: false },
      {
        id: "windshield",
        label: "Windshield clean & no major cracks",
        checked: false,
      },
      { id: "wipers", label: "Wipers & washer fluid working", checked: false },
      { id: "mirrors", label: "Mirrors adjusted", checked: false },
      {
        id: "dashboard_lights",
        label: "Dashboard warning lights off",
        checked: false,
      },
    ],
  },
  {
    title: "Engine Compartment",
    emoji: "🔧",
    items: [
      { id: "engine_oil", label: "Engine oil level", checked: false },
      { id: "coolant", label: "Coolant level", checked: false },
      { id: "power_steering", label: "Power steering fluid", checked: false },
      { id: "brake_fluid", label: "Brake fluid", checked: false },
      { id: "washer_fluid", label: "Windshield washer fluid", checked: false },
      {
        id: "belts_hoses",
        label: "Belts & hoses secure (no cracks/leaks)",
        checked: false,
      },
      { id: "battery", label: "Battery secure (no corrosion)", checked: false },
      {
        id: "fluid_leaks",
        label: "No fluid leaks under truck",
        checked: false,
      },
    ],
  },
  {
    title: "Tires & Wheels",
    emoji: "🛞",
    items: [
      {
        id: "tire_pressure",
        label: "Proper tire pressure (all tires)",
        checked: false,
      },
      { id: "tread_depth", label: "Tread depth adequate", checked: false },
      {
        id: "tire_damage",
        label: "No cuts, bulges, or exposed cords",
        checked: false,
      },
      { id: "lug_nuts", label: "Lug nuts tight", checked: false },
      { id: "valve_stems", label: "Valve stems intact", checked: false },
      { id: "wheel_rims", label: "Wheel rims not cracked", checked: false },
    ],
  },
  {
    title: "Brakes & Suspension",
    emoji: "🛑",
    items: [
      {
        id: "air_brake",
        label: "Air brake pressure builds properly (if equipped)",
        checked: false,
      },
      { id: "parking_brake", label: "Parking brake holds", checked: false },
      {
        id: "brake_pedal",
        label: "Brake pedal firm (no sinking)",
        checked: false,
      },
      { id: "air_lines", label: "Air lines intact (no leaks)", checked: false },
      {
        id: "shock_absorbers",
        label: "Shock absorbers secure",
        checked: false,
      },
      {
        id: "leaf_springs",
        label: "Leaf springs not cracked or shifted",
        checked: false,
      },
    ],
  },
  {
    title: "Lights & Electrical",
    emoji: "💡",
    items: [
      {
        id: "headlights",
        label: "Headlights (high & low beam)",
        checked: false,
      },
      {
        id: "turn_signals",
        label: "Turn signals (front & rear)",
        checked: false,
      },
      { id: "brake_lights", label: "Brake lights", checked: false },
      { id: "hazard_lights", label: "Hazard lights", checked: false },
      {
        id: "clearance_lights",
        label: "Clearance & marker lights",
        checked: false,
      },
      {
        id: "license_plate_light",
        label: "License plate light",
        checked: false,
      },
      { id: "cargo_light", label: "Interior cargo light", checked: false },
      { id: "backup_alarm", label: "Backup alarm working", checked: false },
    ],
  },
  {
    title: "Final Walk-Around",
    emoji: "🚦",
    items: [
      {
        id: "body_damage",
        label: "No body damage affecting safety",
        checked: false,
      },
      {
        id: "hanging_wires",
        label: "No hanging wires or hoses",
        checked: false,
      },
      { id: "visible_leaks", label: "No visible leaks", checked: false },
      { id: "mud_flaps", label: "Mud flaps secure", checked: false },
      { id: "exhaust_system", label: "Exhaust system secure", checked: false },
      {
        id: "cargo_box_repair",
        label: "Cargo box in good repair",
        checked: false,
      },
    ],
  },
  {
    title: "Driver Acknowledgment",
    emoji: "📝",
    items: [
      { id: "vehicle_safe", label: "Vehicle safe to operate", checked: false },
      {
        id: "defects_reported",
        label: "Defects reported (if any)",
        checked: false,
      },
    ],
  },
];

// Rotating colored left-border per section
const SECTION_BORDER_COLORS = [
  "border-l-accent",
  "border-l-primary",
  "border-l-chart-3",
  "border-l-chart-4",
  "border-l-chart-5",
  "border-l-accent",
  "border-l-primary",
  "border-l-chart-3",
  "border-l-chart-4",
];

const PROGRESS_KEY = "berks_bus_checklist_progress";
export const SUBMISSIONS_KEY = "berks_bus_checklist_submissions";

function formatTimeFromISO(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStoredSubmissions(): ChecklistSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChecklistSubmissionRecord[];
  } catch {
    return [];
  }
}

function saveSubmission(record: ChecklistSubmissionRecord): void {
  const existing = getStoredSubmissions();
  existing.unshift(record);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));
}

export default function PublicChecklistPage() {
  const [sections, setSections] =
    useState<ChecklistSection[]>(CHECKLIST_SECTIONS);
  const [driverName, setDriverName] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [startMileage, setStartMileage] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [drivingHours, setDrivingHours] = useState("");
  const [repairsNeeded, setRepairsNeeded] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.sections) setSections(data.sections);
        if (data.driverName) setDriverName(data.driverName);
        if (data.truckNumber) setTruckNumber(data.truckNumber);
        if (data.startMileage) setStartMileage(data.startMileage);
        if (data.endMileage) setEndMileage(data.endMileage);
        if (data.fuelLevel) setFuelLevel(data.fuelLevel);
        if (data.timeIn) setTimeIn(data.timeIn);
        if (data.timeOut) setTimeOut(data.timeOut);
        if (data.drivingHours) setDrivingHours(data.drivingHours);
        if (data.repairsNeeded) setRepairsNeeded(data.repairsNeeded);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({
          sections,
          driverName,
          truckNumber,
          startMileage,
          endMileage,
          fuelLevel,
          timeIn,
          timeOut,
          drivingHours,
          repairsNeeded,
        }),
      );
    }
  }, [
    sections,
    driverName,
    truckNumber,
    startMileage,
    endMileage,
    fuelLevel,
    timeIn,
    timeOut,
    drivingHours,
    repairsNeeded,
    submitted,
  ]);

  const handleCheckboxChange = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              items: s.items.map((it, ii) =>
                ii === itemIndex ? { ...it, checked: !it.checked } : it,
              ),
            }
          : s,
      ),
    );
  };

  const handleCheckAll = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex
          ? { ...s, items: s.items.map((it) => ({ ...it, checked: true })) }
          : s,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) {
      toast.error("Please enter your driver name");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
      const checkedCount = sections.reduce(
        (sum, s) => sum + s.items.filter((it) => it.checked).length,
        0,
      );

      const record: ChecklistSubmissionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        driverName: driverName.trim(),
        startMileage: startMileage || undefined,
        endMileage: endMileage || undefined,
        totalMiles:
          startMileage &&
          endMileage &&
          !Number.isNaN(
            Number.parseInt(endMileage) - Number.parseInt(startMileage),
          )
            ? String(
                Number.parseInt(endMileage) - Number.parseInt(startMileage),
              )
            : undefined,
        fuelLevel: fuelLevel || undefined,
        repairsNeeded: repairsNeeded || undefined,
        sections,
        timestamp: Date.now(),
        totalItems,
        checkedCount,
        timeIn: timeIn || undefined,
        timeOut: timeOut || undefined,
        drivingHours: drivingHours || undefined,
        truckNumber: truckNumber || undefined,
      };

      saveSubmission(record);
      localStorage.removeItem(PROGRESS_KEY);
      setSubmitted(true);
      toast.success("Checklist submitted successfully!");
    } catch {
      toast.error("Failed to submit checklist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setSections(CHECKLIST_SECTIONS);
    setDriverName("");
    setTruckNumber("");
    setStartMileage("");
    setEndMileage("");
    setFuelLevel("");
    setTimeIn("");
    setTimeOut("");
    setDrivingHours("");
    setRepairsNeeded("");
    setSubmitted(false);
    localStorage.removeItem(PROGRESS_KEY);
  };

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = sections.reduce(
    (sum, s) => sum + s.items.filter((it) => it.checked).length,
    0,
  );
  const progress =
    totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Index of the Driver Acknowledgment section (last section)
  const acknowledgmentIndex = sections.findIndex(
    (s) => s.title === "Driver Acknowledgment",
  );

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <Card className="max-w-md w-full border-2 border-accent/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-accent to-chart-3 flex items-center justify-center shadow-lg shadow-accent/30">
              <CheckCircle2 className="w-11 h-11 text-white" />
            </div>
            <CardTitle className="font-display text-2xl font-bold">
              Checklist Submitted!
            </CardTitle>
            <CardDescription className="text-base">
              Your pre-trip inspection has been recorded successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-center">
              <p className="text-sm font-semibold text-foreground">
                Driver:{" "}
                <span className="text-accent font-bold">{driverName}</span>
              </p>
              {truckNumber && (
                <p className="text-sm text-foreground">
                  Truck #:{" "}
                  <span className="font-bold text-primary">
                    Truck {truckNumber}
                  </span>
                </p>
              )}
              {timeIn && (
                <p className="text-sm text-foreground">
                  Shift Start:{" "}
                  <span className="font-bold text-chart-3">
                    {formatTimeFromISO(timeIn)}
                  </span>
                </p>
              )}
              {timeOut && (
                <p className="text-sm text-foreground">
                  Shift End:{" "}
                  <span className="font-bold text-chart-4">
                    {formatTimeFromISO(timeOut)}
                  </span>
                </p>
              )}
              {drivingHours && (
                <p className="text-sm text-foreground">
                  Driving Hours:{" "}
                  <span className="font-bold text-primary">{drivingHours}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Completed: {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <Button
              onClick={handleStartNew}
              className="w-full bg-gradient-to-r from-accent to-chart-3 text-accent-foreground font-bold hover:opacity-90 shadow-md shadow-accent/25"
              data-ocid="checklist.primary_button"
            >
              Start New Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
              <Truck className="w-9 h-9 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Pre-Trip Checklist
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
                26-ft Box Truck Inspection — Berks Bus Service
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-lg mx-auto space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-accent font-bold">
                {progress}% Complete
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-accent to-chart-5 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {checkedCount} of {totalItems} items checked
            </p>
          </div>
        </div>

        {/* Checklist Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Information */}
          <Card className="border-2 border-primary/20 border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="font-display font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Driver Information
              </CardTitle>
              <CardDescription>
                Enter your details before starting the inspection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Driver Name */}
              <div className="space-y-2">
                <Label htmlFor="driverName" className="font-semibold">
                  Driver Name *
                </Label>
                <Input
                  id="driverName"
                  type="text"
                  placeholder="Enter your full name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  className="border-2 focus:border-accent"
                  data-ocid="checklist.input"
                />
              </div>

              {/* Truck Number — directly under Driver Name */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Truck Number</Label>
                <select
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                  data-ocid="checklist.select"
                >
                  <option value="">Select truck...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={String(n)}>
                      Truck {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mileage Tracker */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  🛣️ Mileage Tracker
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="startMileage"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Start Mileage
                    </Label>
                    <Input
                      id="startMileage"
                      type="number"
                      min="0"
                      placeholder="e.g. 45000"
                      value={startMileage}
                      onChange={(e) => setStartMileage(e.target.value)}
                      className="border-2 focus:border-accent"
                      data-ocid="checklist.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="endMileage"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      End Mileage
                    </Label>
                    <Input
                      id="endMileage"
                      type="number"
                      min="0"
                      placeholder="e.g. 45200"
                      value={endMileage}
                      onChange={(e) => setEndMileage(e.target.value)}
                      className="border-2 focus:border-accent"
                      data-ocid="checklist.input"
                    />
                  </div>
                </div>
                {startMileage &&
                  endMileage &&
                  !Number.isNaN(
                    Number.parseInt(endMileage) - Number.parseInt(startMileage),
                  ) && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-sm font-bold text-accent">
                        Total Miles:{" "}
                        {Number.parseInt(endMileage) -
                          Number.parseInt(startMileage)}
                      </span>
                    </div>
                  )}
              </div>

              {/* Fuel Level */}
              <div className="space-y-1.5">
                <Label className="font-semibold flex items-center gap-2">
                  ⛽ Fuel Level
                </Label>
                <select
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                  data-ocid="checklist.select"
                >
                  <option value="">Select fuel level...</option>
                  <option value="E">E — Empty</option>
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="3/4">3/4</option>
                  <option value="F">F — Full</option>
                </select>
              </div>

              {/* Shift Times */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Shift Times
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTimeIn(new Date().toISOString())}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      timeIn
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.secondary_button"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {timeIn
                        ? `Clocked in at ${formatTimeFromISO(timeIn)}`
                        : "Clock In (Start of Shift)"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeOut(new Date().toISOString())}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      timeOut
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.toggle"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {timeOut
                        ? `Clocked out at ${formatTimeFromISO(timeOut)}`
                        : "Clock Out (End of Shift)"}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tap to record current time. Tap again to update.
                </p>
              </div>

              {/* Driving Hours */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Driving Hours</Label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 5.5"
                  value={drivingHours}
                  onChange={(e) => setDrivingHours(e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                  data-ocid="checklist.input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Checklist Sections */}
          {sections.map((section, sectionIndex) => {
            const borderColor =
              SECTION_BORDER_COLORS[
                sectionIndex % SECTION_BORDER_COLORS.length
              ];
            const sectionCheckedCount = section.items.filter(
              (it) => it.checked,
            ).length;
            const sectionTotal = section.items.length;
            const allChecked = sectionCheckedCount === sectionTotal;
            const isAcknowledgment = sectionIndex === acknowledgmentIndex;

            return (
              <Card
                key={section.title}
                className={`border-2 border-l-4 ${borderColor} shadow-md transition-all duration-200 ${allChecked ? "bg-secondary/30" : ""}`}
                data-ocid={`checklist.panel.${sectionIndex + 1}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{section.emoji}</span>
                      <div>
                        <CardTitle className="font-display font-bold text-base sm:text-lg leading-tight">
                          {section.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sectionCheckedCount}/{sectionTotal} checked
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCheckAll(sectionIndex)}
                      className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm font-semibold"
                      data-ocid={`checklist.secondary_button.${sectionIndex + 1}`}
                    >
                      <CheckCheck className="w-4 h-4 mr-1.5" />
                      Check All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-150 ${
                          item.checked ? "bg-accent/8" : "hover:bg-muted/60"
                        }`}
                      >
                        <Checkbox
                          id={`${sectionIndex}-${itemIndex}`}
                          checked={item.checked}
                          onCheckedChange={() =>
                            handleCheckboxChange(sectionIndex, itemIndex)
                          }
                          className="mt-0.5 h-5 w-5 shrink-0 border-2 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                          data-ocid={`checklist.checkbox.${sectionIndex + 1}`}
                        />
                        <label
                          htmlFor={`${sectionIndex}-${itemIndex}`}
                          className={`flex-1 text-sm font-medium leading-relaxed cursor-pointer select-none transition-colors ${
                            item.checked
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </label>
                        {item.checked && (
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Repairs Needed textarea — only in Driver Acknowledgment section */}
                  {isAcknowledgment && (
                    <div className="mt-4 space-y-2">
                      <Label
                        htmlFor="repairsNeeded"
                        className="font-semibold text-sm flex items-center gap-2"
                      >
                        🔧 Repairs Needed
                      </Label>
                      <textarea
                        id="repairsNeeded"
                        rows={4}
                        placeholder="Describe any repairs or issues that need attention..."
                        value={repairsNeeded}
                        onChange={(e) => setRepairsNeeded(e.target.value)}
                        className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:border-accent transition-colors resize-y"
                        data-ocid="checklist.textarea"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* QR Code Share Section */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="font-display font-bold text-base flex items-center gap-2">
                <span className="text-xl">📱</span>
                Share App — Scan QR Code
              </CardTitle>
              <CardDescription className="text-xs">
                Share this QR code with your team to access the checklist
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-4">
              <div className="bg-white p-3 rounded-xl shadow-inner border border-border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + window.location.pathname)}&color=0f2850&bgcolor=ffffff`}
                  alt="QR code to access the checklist"
                  width={160}
                  height={160}
                  className="rounded"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all max-w-xs font-mono bg-secondary/50 px-3 py-1.5 rounded-lg">
                {window.location.origin + window.location.pathname}
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="border-2 border-accent/30 bg-gradient-to-br from-secondary/40 to-background shadow-lg">
            <CardContent className="pt-6 pb-6">
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg font-bold bg-gradient-to-r from-accent to-chart-5 text-white hover:opacity-92 shadow-lg shadow-accent/30 py-6"
                disabled={isSubmitting || !driverName.trim()}
                data-ocid="checklist.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-6 h-6 mr-2" />
                    Submit Pre-Trip Checklist
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-3 font-medium">
                Your progress is automatically saved as you work
              </p>
            </CardContent>
          </Card>
        </form>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground space-y-1 pt-4 pb-4">
          <p>
            © {new Date().getFullYear()} Berks Bus Service. All rights reserved.
          </p>
          <p>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
