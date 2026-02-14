import { useState, useMemo } from 'react';
import { useGetAllQuestions, useUpdateQuestionStatus, useAnswerQuestion, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, MessageSquare, CheckCircle } from 'lucide-react';
import type { Principal } from '@dfinity/principal';
import type { Question } from '../../backend';
import { QuestionStatus } from '../../backend';

export default function AllQuestionsPage() {
  const { data: allQuestions = [], isLoading } = useGetAllQuestions();
  const updateStatus = useUpdateQuestionStatus();
  const answerQuestion = useAnswerQuestion();
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<{ user: Principal; question: Question } | null>(null);
  const [replyText, setReplyText] = useState('');

  const users = useMemo(() => {
    return allQuestions.map(([principal]) => principal);
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    let questions = allQuestions.flatMap(([principal, qs]) =>
      qs.map((q) => ({ ...q, owner: principal }))
    );

    if (selectedUser !== 'all') {
      questions = questions.filter((q) => q.owner.toString() === selectedUser);
    }

    if (selectedStatus !== 'all') {
      questions = questions.filter((q) => q.status === selectedStatus);
    }

    return questions;
  }, [allQuestions, selectedUser, selectedStatus]);

  const sortedQuestions = [...filteredQuestions].sort((a, b) => Number(b.timestamp - a.timestamp));

  const handleMarkAnswered = async (user: Principal, questionId: string) => {
    await updateStatus.mutateAsync({ user, questionId, status: QuestionStatus.answered });
  };

  const handleMarkOpen = async (user: Principal, questionId: string) => {
    await updateStatus.mutateAsync({ user, questionId, status: QuestionStatus.open });
  };

  const handleReply = (user: Principal, question: Question) => {
    setReplyingTo({ user, question });
    setReplyText(question.adminReply || '');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyingTo && replyText.trim()) {
      await answerQuestion.mutateAsync({
        user: replyingTo.user,
        questionId: replyingTo.question.id,
        reply: replyText.trim(),
      });
      setReplyingTo(null);
      setReplyText('');
    }
  };

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Questions</h3>
          <p className="text-sm text-muted-foreground">Manage questions from all users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((principal) => (
                <SelectItem key={principal.toString()} value={principal.toString()}>
                  <UserDisplay principal={principal} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground">
              {selectedUser === 'all' && selectedStatus === 'all'
                ? 'No users have submitted questions yet'
                : 'No questions match the selected filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <UserDisplay principal={question.owner} />
                      <Badge variant={question.status === 'open' ? 'default' : 'secondary'}>
                        {question.status === 'open' ? 'Open' : 'Answered'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(Number(question.timestamp) / 1000000).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-base">{question.questionText}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={replyingTo?.question.id === question.id} onOpenChange={(open) => !open && setReplyingTo(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleReply(question.owner, question)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reply to Question</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitReply} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Question</Label>
                            <p className="text-sm bg-muted p-3 rounded">{question.questionText}</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reply">Your Reply *</Label>
                            <Textarea
                              id="reply"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your answer here..."
                              required
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={answerQuestion.isPending || !replyText.trim()}>
                              {answerQuestion.isPending ? 'Sending...' : 'Send Reply'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {question.status === 'open' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAnswered(question.owner, question.id)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Answered
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkOpen(question.owner, question.id)}
                        disabled={updateStatus.isPending}
                      >
                        Reopen
                      </Button>
                    )}
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

function UserDisplay({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {profile?.name || principal.toString().slice(0, 10) + '...'}
    </Badge>
  );
}
