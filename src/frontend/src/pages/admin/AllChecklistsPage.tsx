import { useState } from 'react';
import { useGetAllSavedChecklists, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, CheckCircle2, XCircle, Calendar, User } from 'lucide-react';
import type { SavedChecklist } from '../../backend';
import { Principal } from '@dfinity/principal';

export default function AllChecklistsPage() {
  const { data: allChecklists, isLoading } = useGetAllSavedChecklists();
  const [selectedChecklist, setSelectedChecklist] = useState<SavedChecklist | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Principal | null>(null);

  // Flatten all checklists with driver info
  const flattenedChecklists = allChecklists?.flatMap(([principal, checklists]) =>
    checklists.map((checklist) => ({
      ...checklist,
      driverPrincipal: principal,
    }))
  ) || [];

  // Sort by timestamp descending (most recent first)
  const sortedChecklists = [...flattenedChecklists].sort((a, b) => {
    const timeA = Number(a.timestamp);
    const timeB = Number(b.timestamp);
    return timeB - timeA;
  });

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getCompletionStats = (checklist: SavedChecklist) => {
    const total = checklist.checked.length;
    const completed = checklist.checked.filter(([_, checked]) => checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading checklists...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedChecklists.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>All Submitted Checklists</CardTitle>
          <CardDescription>View and monitor all driver pre-trip inspections</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No checklists submitted yet</p>
              <p className="text-sm text-muted-foreground">Checklists will appear here once drivers submit them</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <CardTitle>All Submitted Checklists</CardTitle>
          <CardDescription>
            {sortedChecklists.length} inspection{sortedChecklists.length !== 1 ? 's' : ''} submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedChecklists.map((checklist, index) => {
                  const stats = getCompletionStats(checklist);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{formatDate(checklist.timestamp)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(checklist.timestamp)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{checklist.driverName}</div>
                            <DriverPrincipalDisplay principal={checklist.driverPrincipal} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {stats.completed} / {stats.total}
                          </div>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {stats.percentage === 100 ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Partial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedChecklist(checklist);
                            setSelectedDriver(checklist.driverPrincipal);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Checklist Details Dialog */}
      <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checklist Details</DialogTitle>
            <DialogDescription>
              Submitted by {selectedChecklist?.driverName} on{' '}
              {selectedChecklist && formatDate(selectedChecklist.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedChecklist && <ChecklistDetailsView checklist={selectedChecklist} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DriverPrincipalDisplay({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  
  return (
    <div className="text-xs text-muted-foreground font-mono">
      {profile?.name || principal.toString().slice(0, 8) + '...'}
    </div>
  );
}

function ChecklistDetailsView({ checklist }: { checklist: SavedChecklist }) {
  const checkedMap = new Map(checklist.checked);
  const stats = {
    completed: checklist.checked.filter(([_, checked]) => checked).length,
    total: checklist.checked.length,
  };

  // Group items by section (based on the original structure)
  const sections = [
    { title: 'Documents & Cab', emoji: '🗂', ids: ['drivers_license', 'registration', 'trip_paperwork', 'dot_inspection', 'emergency_contacts', 'fire_extinguisher', 'reflective_triangles', 'first_aid_kit', 'seatbelt', 'horn', 'windshield', 'wipers', 'mirrors', 'dashboard_lights'] },
    { title: 'Engine Compartment', emoji: '🔧', ids: ['engine_oil', 'coolant', 'power_steering', 'brake_fluid', 'washer_fluid', 'belts_hoses', 'battery', 'fluid_leaks'] },
    { title: 'Tires & Wheels', emoji: '🛞', ids: ['tire_pressure', 'tread_depth', 'tire_damage', 'lug_nuts', 'valve_stems', 'wheel_rims'] },
    { title: 'Brakes & Suspension', emoji: '🛑', ids: ['air_brake', 'parking_brake', 'brake_pedal', 'air_lines', 'shock_absorbers', 'leaf_springs'] },
    { title: 'Lights & Electrical', emoji: '💡', ids: ['headlights', 'turn_signals', 'brake_lights', 'hazard_lights', 'clearance_lights', 'license_plate_light', 'cargo_light'] },
    { title: 'Box / Cargo Area', emoji: '🚪', ids: ['cargo_secured', 'no_shifting', 'doors_open', 'door_latches', 'door_tracks', 'floor_solid', 'roof_dry'] },
    { title: 'Safety & Emergency', emoji: '🧯', ids: ['fire_extinguisher_accessible', 'reflective_triangles_present', 'backup_alarm', 'camera_system', 'fuel_level'] },
    { title: 'Final Walk-Around', emoji: '🚦', ids: ['body_damage', 'hanging_wires', 'visible_leaks', 'mud_flaps', 'exhaust_system'] },
    { title: 'Driver Acknowledgment', emoji: '📝', ids: ['vehicle_safe', 'defects_reported'] },
  ];

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
          <p className="font-medium">{checklist.signature}</p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => {
        const sectionItems = section.ids.map(id => ({
          id,
          checked: checkedMap.get(id) || false,
        }));
        const sectionCompleted = sectionItems.filter(item => item.checked).length;

        return (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                {section.title}
              </h3>
              <Badge variant="outline">
                {sectionCompleted} / {sectionItems.length}
              </Badge>
            </div>
            <div className="space-y-2 pl-8">
              {sectionItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.checked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={item.checked ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.id.replace(/_/g, ' ')}
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
