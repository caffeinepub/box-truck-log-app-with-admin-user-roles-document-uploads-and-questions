import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Truck, ClipboardCheck } from 'lucide-react';
import { useSaveChecklistAnonymous } from '../hooks/useQueries';
import { toast } from 'sonner';

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

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    title: 'Documents & Cab',
    emoji: '🗂',
    items: [
      { id: 'drivers_license', label: "Driver's license / CDL (if required)", checked: false },
      { id: 'registration', label: 'Registration & insurance', checked: false },
      { id: 'trip_paperwork', label: 'Trip paperwork / BOL / delivery info', checked: false },
      { id: 'dot_inspection', label: 'DOT inspection report (previous)', checked: false },
      { id: 'emergency_contacts', label: 'Emergency contact numbers', checked: false },
      { id: 'fire_extinguisher', label: 'Fire extinguisher (charged & mounted)', checked: false },
      { id: 'reflective_triangles', label: 'Reflective triangles / flares', checked: false },
      { id: 'first_aid_kit', label: 'First-aid kit (if required)', checked: false },
      { id: 'seatbelt', label: 'Seatbelt functional', checked: false },
      { id: 'horn', label: 'Horn working', checked: false },
      { id: 'windshield', label: 'Windshield clean & no major cracks', checked: false },
      { id: 'wipers', label: 'Wipers & washer fluid working', checked: false },
      { id: 'mirrors', label: 'Mirrors adjusted', checked: false },
      { id: 'dashboard_lights', label: 'Dashboard warning lights off', checked: false },
    ],
  },
  {
    title: 'Engine Compartment',
    emoji: '🔧',
    items: [
      { id: 'engine_oil', label: 'Engine oil level', checked: false },
      { id: 'coolant', label: 'Coolant level', checked: false },
      { id: 'power_steering', label: 'Power steering fluid', checked: false },
      { id: 'brake_fluid', label: 'Brake fluid', checked: false },
      { id: 'washer_fluid', label: 'Windshield washer fluid', checked: false },
      { id: 'belts_hoses', label: 'Belts & hoses secure (no cracks/leaks)', checked: false },
      { id: 'battery', label: 'Battery secure (no corrosion)', checked: false },
      { id: 'fluid_leaks', label: 'No fluid leaks under truck', checked: false },
    ],
  },
  {
    title: 'Tires & Wheels',
    emoji: '🛞',
    items: [
      { id: 'tire_pressure', label: 'Proper tire pressure (all tires)', checked: false },
      { id: 'tread_depth', label: 'Tread depth adequate', checked: false },
      { id: 'tire_damage', label: 'No cuts, bulges, or exposed cords', checked: false },
      { id: 'lug_nuts', label: 'Lug nuts tight', checked: false },
      { id: 'valve_stems', label: 'Valve stems intact', checked: false },
      { id: 'wheel_rims', label: 'Wheel rims not cracked', checked: false },
    ],
  },
  {
    title: 'Brakes & Suspension',
    emoji: '🛑',
    items: [
      { id: 'air_brake', label: 'Air brake pressure builds properly (if equipped)', checked: false },
      { id: 'parking_brake', label: 'Parking brake holds', checked: false },
      { id: 'brake_pedal', label: 'Brake pedal firm (no sinking)', checked: false },
      { id: 'air_lines', label: 'Air lines intact (no leaks)', checked: false },
      { id: 'shock_absorbers', label: 'Shock absorbers secure', checked: false },
      { id: 'leaf_springs', label: 'Leaf springs not cracked or shifted', checked: false },
    ],
  },
  {
    title: 'Lights & Electrical',
    emoji: '💡',
    items: [
      { id: 'headlights', label: 'Headlights (high & low beam)', checked: false },
      { id: 'turn_signals', label: 'Turn signals (front & rear)', checked: false },
      { id: 'brake_lights', label: 'Brake lights', checked: false },
      { id: 'hazard_lights', label: 'Hazard lights', checked: false },
      { id: 'clearance_lights', label: 'Clearance & marker lights', checked: false },
      { id: 'license_plate_light', label: 'License plate light', checked: false },
      { id: 'cargo_light', label: 'Interior cargo light', checked: false },
    ],
  },
  {
    title: 'Box / Cargo Area',
    emoji: '🚪',
    items: [
      { id: 'cargo_secured', label: 'Cargo secured (straps, load bars, etc.)', checked: false },
      { id: 'no_shifting', label: 'No shifting risk', checked: false },
      { id: 'doors_open', label: 'Doors open/close smoothly', checked: false },
      { id: 'door_latches', label: 'Door latches lock securely', checked: false },
      { id: 'door_tracks', label: 'Roll-up door tracks intact', checked: false },
      { id: 'floor_solid', label: 'Floor solid (no holes or soft spots)', checked: false },
      { id: 'roof_dry', label: 'Roof dry (no leaks)', checked: false },
    ],
  },
  {
    title: 'Safety & Emergency',
    emoji: '🧯',
    items: [
      { id: 'fire_extinguisher_accessible', label: 'Fire extinguisher accessible', checked: false },
      { id: 'reflective_triangles_present', label: 'Reflective triangles present', checked: false },
      { id: 'backup_alarm', label: 'Backup alarm working', checked: false },
      { id: 'camera_system', label: 'Camera system working (if equipped)', checked: false },
      { id: 'fuel_level', label: 'Fuel level sufficient for route', checked: false },
    ],
  },
  {
    title: 'Final Walk-Around',
    emoji: '🚦',
    items: [
      { id: 'body_damage', label: 'No body damage affecting safety', checked: false },
      { id: 'hanging_wires', label: 'No hanging wires or hoses', checked: false },
      { id: 'visible_leaks', label: 'No visible leaks', checked: false },
      { id: 'mud_flaps', label: 'Mud flaps secure', checked: false },
      { id: 'exhaust_system', label: 'Exhaust system secure', checked: false },
    ],
  },
  {
    title: 'Driver Acknowledgment',
    emoji: '📝',
    items: [
      { id: 'vehicle_safe', label: 'Vehicle safe to operate', checked: false },
      { id: 'defects_reported', label: 'Defects reported (if any)', checked: false },
    ],
  },
];

const STORAGE_KEY = 'berks_bus_checklist_progress';

export default function PublicChecklistPage() {
  const [sections, setSections] = useState<ChecklistSection[]>(CHECKLIST_SECTIONS);
  const [driverName, setDriverName] = useState('');
  const [signature, setSignature] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const saveChecklistMutation = useSaveChecklistAnonymous();

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.sections && data.driverName && data.signature) {
          setSections(data.sections);
          setDriverName(data.driverName);
          setSignature(data.signature);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sections,
          driverName,
          signature,
        })
      );
    }
  }, [sections, driverName, signature, submitted]);

  const handleCheckboxChange = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].items[itemIndex].checked = !newSections[sectionIndex].items[itemIndex].checked;
      return newSections;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverName.trim() || !signature.trim()) {
      toast.error('Please enter your name and signature');
      return;
    }

    // Collect all checked items
    const checkedItems: [string, boolean][] = [];
    sections.forEach((section) => {
      section.items.forEach((item) => {
        checkedItems.push([item.id, item.checked]);
      });
    });

    try {
      await saveChecklistMutation.mutateAsync({
        driverName: driverName.trim(),
        signature: signature.trim(),
        checked: checkedItems,
      });

      // Clear localStorage and show success
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      toast.success('Checklist submitted successfully!');
    } catch (error) {
      console.error('Failed to submit checklist:', error);
      toast.error('Failed to submit checklist. Please try again.');
    }
  };

  const handleStartNew = () => {
    setSections(CHECKLIST_SECTIONS);
    setDriverName('');
    setSignature('');
    setSubmitted(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const checkedItems = sections.reduce(
    (sum, section) => sum + section.items.filter((item) => item.checked).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Checklist Submitted!</CardTitle>
            <CardDescription>Your pre-trip inspection has been recorded successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Driver: {driverName}</p>
              <p className="text-sm text-muted-foreground">
                Completed: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <Button onClick={handleStartNew} className="w-full">
              Start New Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Truck className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Pre-Trip Checklist</h1>
          </div>
          <p className="text-xl text-muted-foreground">28-ft Box Truck Inspection</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {checkedItems} of {totalItems} items checked
            </p>
          </div>
        </div>

        {/* Checklist Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driver Information */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
              <CardDescription>Enter your details before starting the inspection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name *</Label>
                <Input
                  id="driverName"
                  type="text"
                  placeholder="Enter your full name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Signature *</Label>
                <Input
                  id="signature"
                  type="text"
                  placeholder="Type your name as signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Checklist Sections */}
          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{section.emoji}</span>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`${sectionIndex}-${itemIndex}`}
                        checked={item.checked}
                        onCheckedChange={() => handleCheckboxChange(sectionIndex, itemIndex)}
                        className="mt-1 h-6 w-6"
                      />
                      <label
                        htmlFor={`${sectionIndex}-${itemIndex}`}
                        className="flex-1 text-sm font-medium leading-relaxed cursor-pointer select-none"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg"
                disabled={saveChecklistMutation.isPending || !driverName.trim() || !signature.trim()}
              >
                {saveChecklistMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-5 h-5 mr-2" />
                    Submit Checklist
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Your progress is automatically saved as you work
              </p>
            </CardContent>
          </Card>
        </form>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground space-y-2 pt-8 pb-4">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p>© {new Date().getFullYear()} Berks Bus Service. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
