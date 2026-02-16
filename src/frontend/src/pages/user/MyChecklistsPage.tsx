import { useState } from 'react';
import { useGetChecklistConfig, useGetCompletedChecklists, useSaveChecklist, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useLocalAuth } from '../../hooks/useLocalAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ClipboardCheck, Eye, CheckSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ChecklistDetails from '../../components/checklists/ChecklistDetails';
import type { PreTripChecklist, SavedChecklist } from '../../backend';

export default function MyChecklistsPage() {
  const { data: config, isLoading: configLoading } = useGetChecklistConfig();
  const { data: completedChecklists = [], isLoading: checklistsLoading } = useGetCompletedChecklists();
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity } = useLocalAuth();
  const saveChecklist = useSaveChecklist();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingChecklist, setViewingChecklist] = useState<SavedChecklist | null>(null);
  const [checkedItems, setCheckedItems] = useState<Map<string, boolean>>(new Map());
  const [driverName, setDriverName] = useState('');
  const [signature, setSignature] = useState('');

  const handleCheckItem = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, checked);
      return newMap;
    });
  };

  const handleSelectAllCategory = (categoryId: string) => {
    if (!config) return;
    
    const categoryItems = config.items.filter((item) => item.categoryId === categoryId);
    setCheckedItems((prev) => {
      const newMap = new Map(prev);
      categoryItems.forEach((item) => {
        newMap.set(item.id, true);
      });
      return newMap;
    });
  };

  const handleStartNewChecklist = () => {
    setCheckedItems(new Map());
    setDriverName(userProfile?.name || '');
    setSignature('');
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !config) return;

    const checklist: PreTripChecklist = {
      driverId: identity.getPrincipal(),
      driverName,
      signature,
      timestamp: BigInt(Date.now() * 1000000),
      checked: Array.from(checkedItems.entries()),
    };

    await saveChecklist.mutateAsync(checklist);
    setIsCreateOpen(false);
    setCheckedItems(new Map());
    setDriverName('');
    setSignature('');
  };

  const sortedChecklists = [...completedChecklists].sort(
    (a, b) => Number(b.timestamp - a.timestamp)
  );

  const groupedItems = config?.categories.map((category) => ({
    category,
    items: config.items.filter((item) => item.categoryId === category.id),
  })) || [];

  const totalItems = config?.items.length || 0;
  const checkedCount = Array.from(checkedItems.values()).filter(v => v === true).length;

  if (configLoading || checklistsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading checklists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Pre-Trip Checklists</h3>
          <p className="text-sm text-muted-foreground">Complete and review your vehicle inspections</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleStartNewChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pre-Trip Checklist – Vehicle Inspection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Progress: {checkedCount} / {totalItems} items</p>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <Accordion type="multiple" className="w-full">
                {groupedItems.map(({ category, items }) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{category.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-end mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAllCategory(category.id)}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Select All
                          </Button>
                        </div>
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleCheckItem(item.id, !checkedItems.get(item.id))}
                          >
                            <Checkbox
                              id={item.id}
                              checked={checkedItems.get(item.id) === true}
                              onCheckedChange={(checked) => {
                                handleCheckItem(item.id, checked as boolean);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <Label htmlFor={item.id} className="font-medium cursor-pointer">
                                {item.name}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{item.prompt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Acknowledgment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input
                      id="driverName"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature">Acknowledgment *</Label>
                    <Input
                      id="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="I acknowledge that the vehicle is safe to operate"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      By signing, you confirm the vehicle is safe to operate and any defects have been reported.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveChecklist.isPending || !driverName.trim() || !signature.trim()}>
                  {saveChecklist.isPending ? 'Saving...' : 'Save Checklist'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedChecklists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No checklists completed yet</h3>
            <p className="text-muted-foreground mb-4">Complete your first pre-trip inspection checklist</p>
            <Button onClick={handleStartNewChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              Start First Checklist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Completed Checklists ({sortedChecklists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Items Checked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedChecklists.map((checklist, index) => {
                    const checkedCount = checklist.checked.filter(([_, checked]) => checked).length;
                    return (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(Number(checklist.timestamp) / 1000000).toLocaleString()}
                        </TableCell>
                        <TableCell>{checklist.driverName}</TableCell>
                        <TableCell>
                          {checkedCount} / {checklist.items.length}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog open={viewingChecklist === checklist} onOpenChange={(open) => !open && setViewingChecklist(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setViewingChecklist(checklist)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Checklist Details</DialogTitle>
                              </DialogHeader>
                              {config && <ChecklistDetails checklist={checklist} categories={config.categories} />}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
