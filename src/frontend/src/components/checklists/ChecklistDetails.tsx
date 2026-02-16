import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { SavedChecklist, Category } from '../../backend';

interface ChecklistDetailsProps {
  checklist: SavedChecklist;
  categories: Category[];
}

export default function ChecklistDetails({ checklist, categories }: ChecklistDetailsProps) {
  const checkedMap = new Map(checklist.checked);

  const groupedItems = categories.map((category) => ({
    category,
    items: checklist.items.filter((item) => item.categoryId === category.id),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Checklist Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Driver Name</p>
              <p className="font-medium">{checklist.driverName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="font-medium">
                {new Date(Number(checklist.timestamp) / 1000000).toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Driver Acknowledgment</p>
            <p className="font-medium">{checklist.signature}</p>
          </div>
        </CardContent>
      </Card>

      {groupedItems.map(({ category, items }) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => {
                const isChecked = checkedMap.get(item.id) || false;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        <Badge variant={isChecked ? 'default' : 'outline'}>
                          {isChecked ? 'Checked' : 'Not Checked'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.prompt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
