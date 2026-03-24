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
  MapPin,
  Plus,
  Trash2,
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

export interface StopEntry {
  stopNumber: number;
  address: string;
}

export interface ChecklistSubmissionRecord {
  id: string;
  driverName: string;
  signature: string;
  role: "Driver" | "Helper";
  sections: ChecklistSection[];
  timestamp: number;
  totalItems: number;
  checkedCount: number;
  timeIn?: string;
  timeOut?: string;
  startTime?: string;
  endTime?: string;
  totalHours?: string;
  drivingHours?: string;
  truckNumber?: string;
  location?: string;
  stops?: StopEntry[];
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
        id: "fire_extinguisher",
        label: "Fire extinguisher (charged & mounted)",
        checked: false,
      },
      {
        id: "reflective_triangles",
        label: "Reflective triangles / flares",
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
    ],
  },
  {
    title: "Box / Cargo Area",
    emoji: "🚪",
    items: [
      {
        id: "cargo_secured",
        label: "Cargo secured (straps, load bars, etc.)",
        checked: false,
      },
      { id: "no_shifting", label: "No shifting risk", checked: false },
      { id: "doors_open", label: "Doors open/close smoothly", checked: false },
      {
        id: "door_latches",
        label: "Door latches lock securely",
        checked: false,
      },
      {
        id: "door_tracks",
        label: "Roll-up door tracks intact",
        checked: false,
      },
      {
        id: "floor_solid",
        label: "Floor solid (no holes or soft spots)",
        checked: false,
      },
      { id: "roof_dry", label: "Roof dry (no leaks)", checked: false },
    ],
  },
  {
    title: "Safety & Emergency",
    emoji: "🧯",
    items: [
      {
        id: "fire_extinguisher_accessible",
        label: "Fire extinguisher accessible",
        checked: false,
      },
      {
        id: "reflective_triangles_present",
        label: "Reflective triangles present",
        checked: false,
      },
      { id: "backup_alarm", label: "Backup alarm working", checked: false },
      {
        id: "camera_system",
        label: "Camera system working (if equipped)",
        checked: false,
      },
      {
        id: "fuel_level",
        label: "Fuel level sufficient for route",
        checked: false,
      },
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
  const [signature, setSignature] = useState("");
  const [role, setRole] = useState<"Driver" | "Helper" | "">("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [drivingHours, setDrivingHours] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [stops, setStops] = useState<StopEntry[]>([
    { stopNumber: 1, address: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addStop = () => {
    setStops((prev) => [...prev, { stopNumber: prev.length + 1, address: "" }]);
  };

  const removeStop = (index: number) => {
    setStops((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stopNumber: i + 1 })),
    );
  };

  const updateStopAddress = (index: number, address: string) => {
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, address } : s)),
    );
  };

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.sections) setSections(data.sections);
        if (data.driverName) setDriverName(data.driverName);
        if (data.signature) setSignature(data.signature);
        if (data.role) setRole(data.role);
        if (data.timeIn) setTimeIn(data.timeIn);
        if (data.timeOut) setTimeOut(data.timeOut);
        if (data.startTime) setStartTime(data.startTime);
        if (data.endTime) setEndTime(data.endTime);
        if (data.drivingHours) setDrivingHours(data.drivingHours);
        if (data.truckNumber) setTruckNumber(data.truckNumber);
        if (data.stops && Array.isArray(data.stops) && data.stops.length > 0) {
          setStops(data.stops);
        }
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
          signature,
          role,
          timeIn,
          timeOut,
          startTime,
          endTime,
          drivingHours,
          truckNumber,
          stops,
        }),
      );
    }
  }, [
    sections,
    driverName,
    signature,
    role,
    timeIn,
    timeOut,
    startTime,
    endTime,
    drivingHours,
    truckNumber,
    stops,
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

  const calcTotalHours = (start: string, end: string): string => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs <= 0) return "0h 0m";
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !signature.trim() || !role) {
      toast.error("Please fill in all required fields including your role");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
      const checkedCount = sections.reduce(
        (sum, s) => sum + s.items.filter((it) => it.checked).length,
        0,
      );

      const filledStops = stops.filter((s) => s.address.trim() !== "");

      const record: ChecklistSubmissionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        driverName: driverName.trim(),
        signature: signature.trim(),
        role: role as "Driver" | "Helper",
        sections,
        timestamp: Date.now(),
        totalItems,
        checkedCount,
        timeIn: timeIn || undefined,
        timeOut: timeOut || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        totalHours:
          startTime && endTime ? calcTotalHours(startTime, endTime) : undefined,
        drivingHours: drivingHours || undefined,
        truckNumber: truckNumber || undefined,
        stops: filledStops.length > 0 ? filledStops : undefined,
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
    setSignature("");
    setRole("");
    setTimeIn("");
    setTimeOut("");
    setStartTime("");
    setEndTime("");
    setDrivingHours("");
    setTruckNumber("");
    setStops([{ stopNumber: 1, address: "" }]);
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

  if (submitted) {
    const filledStops = stops.filter((s) => s.address.trim() !== "");
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
              <p className="text-sm text-foreground">
                Role:{" "}
                <span
                  className={`font-bold ${
                    role === "Driver" ? "text-accent" : "text-primary"
                  }`}
                >
                  {role}
                </span>
              </p>
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
              {startTime && (
                <p className="text-sm text-foreground">
                  Start Drive Time:{" "}
                  <span className="font-bold text-chart-3">
                    {formatTimeFromISO(startTime)}
                  </span>
                </p>
              )}
              {endTime && (
                <p className="text-sm text-foreground">
                  End Drive Time:{" "}
                  <span className="font-bold text-chart-4">
                    {formatTimeFromISO(endTime)}
                  </span>
                </p>
              )}
              {startTime && endTime && (
                <p className="text-sm text-foreground">
                  Total Hours:{" "}
                  <span className="font-bold text-accent">
                    {calcTotalHours(startTime, endTime)}
                  </span>
                </p>
              )}
              {drivingHours && (
                <p className="text-sm text-foreground">
                  Driving Hours:{" "}
                  <span className="font-bold text-primary">{drivingHours}</span>
                </p>
              )}
              {truckNumber && (
                <p className="text-sm text-foreground">
                  Truck #:{" "}
                  <span className="font-bold text-primary">
                    Truck {truckNumber}
                  </span>
                </p>
              )}
              {filledStops.length > 0 && (
                <div className="text-sm text-foreground text-left mt-2">
                  <p className="font-semibold text-primary mb-1">
                    Delivery Stops:
                  </p>
                  {filledStops.map((s) => (
                    <p
                      key={s.stopNumber}
                      className="text-xs text-muted-foreground"
                    >
                      Stop {s.stopNumber}: {s.address}
                    </p>
                  ))}
                </div>
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
                28-ft Box Truck Inspection — Berks Bus Service
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
              <div className="space-y-2">
                <Label htmlFor="signature" className="font-semibold">
                  Signature *
                </Label>
                <Input
                  id="signature"
                  type="text"
                  placeholder="Type your name as signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  required
                  className="border-2 focus:border-accent"
                  data-ocid="checklist.textarea"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Role *</Label>
                <fieldset
                  className="flex gap-3 border-none p-0 m-0"
                  aria-label="Select role"
                >
                  <button
                    type="button"
                    onClick={() => setRole("Driver")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      role === "Driver"
                        ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/25"
                        : "border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.radio"
                  >
                    🚛 Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Helper")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      role === "Helper"
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.toggle"
                  >
                    🤝 Helper
                  </button>
                </fieldset>
                {!role && (
                  <p className="text-xs text-muted-foreground">
                    Please select your role before submitting
                  </p>
                )}
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

              {/* Start/End Drive Time, Driving Hours, Truck Number */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStartTime(new Date().toISOString())}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      startTime
                        ? "border-chart-3 bg-chart-3/10 text-chart-3"
                        : "border-border bg-background text-muted-foreground hover:border-chart-3/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.secondary_button"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {startTime
                        ? `Start: ${formatTimeFromISO(startTime)}`
                        : "Start Drive Time"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndTime(new Date().toISOString())}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      endTime
                        ? "border-chart-4 bg-chart-4/10 text-chart-4"
                        : "border-border bg-background text-muted-foreground hover:border-chart-4/50 hover:text-foreground"
                    }`}
                    data-ocid="checklist.toggle"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {endTime
                        ? `End: ${formatTimeFromISO(endTime)}`
                        : "End Drive Time"}
                    </span>
                  </button>
                </div>
                {startTime && endTime && (
                  <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm font-semibold text-accent flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Total Hours: {calcTotalHours(startTime, endTime)}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">
                      Driving Hours
                    </Label>
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
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">
                      Truck Number
                    </Label>
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
                </div>

                {/* Delivery Stops */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Delivery Stops
                  </Label>
                  <div className="space-y-2">
                    {stops.map((stop, index) => (
                      <div
                        key={stop.stopNumber}
                        className="flex items-center gap-2"
                        data-ocid={`checklist.item.${index + 1}`}
                      >
                        <span className="shrink-0 w-16 text-xs font-bold text-primary bg-primary/10 rounded-lg px-2 py-2 text-center">
                          Stop {stop.stopNumber}
                        </span>
                        <input
                          type="text"
                          placeholder="Enter address..."
                          value={stop.address}
                          onChange={(e) =>
                            updateStopAddress(index, e.target.value)
                          }
                          className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                          data-ocid={"checklist.input"}
                        />
                        {stops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="shrink-0 p-2 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                            aria-label={`Remove stop ${stop.stopNumber}`}
                            data-ocid={`checklist.delete_button.${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addStop}
                    className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-accent/50 text-accent font-semibold text-sm hover:border-accent hover:bg-accent/5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    data-ocid="checklist.secondary_button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stop
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Add each delivery stop as you go. Submit everything at end
                    of shift.
                  </p>
                </div>
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
                </CardContent>
              </Card>
            );
          })}

          {/* Submit Button */}
          <Card className="border-2 border-accent/30 bg-gradient-to-br from-secondary/40 to-background shadow-lg">
            <CardContent className="pt-6 pb-6">
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg font-bold bg-gradient-to-r from-accent to-chart-5 text-white hover:opacity-92 shadow-lg shadow-accent/30 py-6"
                disabled={
                  isSubmitting ||
                  !driverName.trim() ||
                  !signature.trim() ||
                  !role
                }
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
