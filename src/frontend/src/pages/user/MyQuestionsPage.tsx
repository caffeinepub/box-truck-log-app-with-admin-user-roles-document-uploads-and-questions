import { useState } from 'react';
import { useGetCallerQuestions, useSubmitQuestion } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MyQuestionsPage() {
  const { data: questions = [], isLoading } = useGetCallerQuestions();
  const submitQuestion = useSubmitQuestion();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim()) {
      await submitQuestion.mutateAsync(questionText.trim());
      setQuestionText('');
      setIsCreateOpen(false);
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => Number(b.timestamp - a.timestamp));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">My Questions</h3>
          <p className="text-sm text-muted-foreground">Ask questions and get support from admins</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Your Question *</Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What would you like to know?"
                  required
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitQuestion.isPending || !questionText.trim()}>
                  {submitQuestion.isPending ? 'Submitting...' : 'Submit Question'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-4">Ask your first question to get help from admins</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ask First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={question.status === 'open' ? 'default' : 'secondary'}>
                        {question.status === 'open' ? 'Open' : 'Answered'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(Number(question.timestamp) / 1000000).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-base">{question.questionText}</p>
                  </div>
                </div>
              </CardHeader>
              {question.adminReply && (
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Admin Reply</span>
                    </div>
                    <p className="text-sm">{question.adminReply}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
