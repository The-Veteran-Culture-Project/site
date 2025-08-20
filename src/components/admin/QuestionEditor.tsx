import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  text: string;
  category: string;
  axis: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  fileSlug: string;
  active: boolean;
  isEditing?: boolean;
  isNew?: boolean;
}

const CATEGORIES = [
  "Mental Health & Addiction",
  "Before & After Service",
  "Civilian Transition",
  "Military Identity",
  "Political Views",
  "Social Connections",
  "Uncategorized"
];

const AXIS_OPTIONS = ["X", "Y"];

interface QuestionEditorProps {
  adminId: string;
}

export function QuestionEditor({ adminId }: QuestionEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [savingChanges, setSavingChanges] = useState<boolean>(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${uuidv4()}`,
      text: "",
      category: "Uncategorized",
      axis: "Y",
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
      fileSlug: "",
      active: true,
      isEditing: true,
      isNew: true
    };

    setQuestions([newQuestion, ...questions]);
  };

  const handleEditQuestion = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isEditing: true } : q
    ));
  };

  const handleCancelEdit = (id: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (q.isNew) {
          return null;
        }
        return { ...q, isEditing: false };
      }
      return q;
    }).filter(Boolean) as Question[]);
  };

  const handleSaveQuestion = async (id: string) => {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    // Basic validation
    if (!question.text.trim()) {
      toast({
        title: "Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpoint = question.isNew ? '/api/admin/questions' : `/api/admin/questions/${id}`;
      const method = question.isNew ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(question)
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      const savedQuestion = await response.json();

      // Update questions state
      setQuestions(questions.map(q => 
        q.id === id ? { ...savedQuestion, isEditing: false, isNew: false } : q
      ));

      toast({
        title: "Success",
        description: question.isNew ? "Question created successfully" : "Question updated successfully",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save question',
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const question = questions.find(q => q.id === id);
      if (!question || question.isNew) {
        // If it's a new question that hasn't been saved yet, just remove from state
        setQuestions(questions.filter(q => q.id !== id));
        return;
      }

      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      // Remove from state
      setQuestions(questions.filter(q => q.id !== id));

      toast({
        title: "Success",
        description: "Question deleted successfully",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete question',
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        // If we're changing text or category, increment version number
        if ((field === 'text' || field === 'category' || field === 'axis') && !q.isNew) {
          return { 
            ...q, 
            [field]: value,
            version: q.version + 1,
            updatedAt: new Date().toISOString(),
            updatedBy: adminId
          };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleSaveAllChanges = async () => {
    try {
      setSavingChanges(true);

      // Find all questions that are being edited
      const editedQuestions = questions.filter(q => q.isEditing);
      if (editedQuestions.length === 0) {
        toast({
          title: "Info",
          description: "No changes to save",
          variant: "default",
        });
        return;
      }

      // Save each edited question
      for (const question of editedQuestions) {
        await handleSaveQuestion(question.id);
      }

      // Refresh the question list
      await fetchQuestions();

      toast({
        title: "Success",
        description: "All changes saved successfully",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save changes',
        variant: "destructive",
      });
    } finally {
      setSavingChanges(false);
    }
  };

  const handlePreviewQuestion = (question: Question) => {
    setPreviewQuestion(question);
  };

  const filteredQuestions = activeCategory === "All" 
    ? questions 
    : questions.filter(q => q.category === activeCategory);

  const categories = ["All", ...CATEGORIES];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Survey Question Editor</h2>
          <div>
            <select 
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleAddQuestion}
            className="bg-primary hover:bg-primary-600"
          >
            Add New Question
          </Button>
          <Button 
            onClick={handleSaveAllChanges}
            disabled={savingChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            {savingChanges ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-md">
          <p className="text-red-400">Error: {error}</p>
          <Button className="mt-2" onClick={fetchQuestions}>Retry</Button>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-zinc-800 p-6 rounded-md text-center">
          <p className="text-zinc-400">
            {activeCategory === "All" 
              ? "No questions found. Add a new question to get started." 
              : `No questions in the '${activeCategory}' category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map(question => (
            <Card 
              key={question.id} 
              className={`bg-zinc-800 border-zinc-700 ${question.isEditing ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {question.isEditing ? (
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-zinc-400">Question Text</label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleUpdateQuestion(question.id, 'text', e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-700"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>{question.text}</div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {question.isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Category</label>
                      <select 
                        value={question.category} 
                        onChange={(e) => handleUpdateQuestion(question.id, 'category', e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-700"
                      >
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Axis (X = Civilian, Y = Military)</label>
                      <select 
                        value={question.axis} 
                        onChange={(e) => handleUpdateQuestion(question.id, 'axis', e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-700"
                      >
                        {AXIS_OPTIONS.map(axis => (
                          <option key={axis} value={axis}>{axis}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`active-${question.id}`}
                        checked={question.active}
                        onCheckedChange={(checked) => handleUpdateQuestion(question.id, 'active', !!checked)}
                      />
                      <label 
                        htmlFor={`active-${question.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Active (shown in survey)
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-zinc-400">Category:</span> {question.category}
                    </p>
                    <p className="text-sm">
                      <span className="text-zinc-400">Axis:</span> {question.axis} ({question.axis === 'X' ? 'Civilian' : 'Military'})
                    </p>
                    <p className="text-sm">
                      <span className="text-zinc-400">Version:</span> {question.version}
                    </p>
                    <p className="text-sm">
                      <span className="text-zinc-400">Last Updated:</span> {new Date(question.updatedAt).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="text-zinc-400">Status:</span>{' '}
                      <span className={question.active ? "text-green-500" : "text-red-500"}>
                        {question.active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div>
                  {!question.isEditing ? (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditQuestion(question.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePreviewQuestion(question)}
                      >
                        Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCancelEdit(question.id)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSaveQuestion(question.id)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Save All Changes button at the bottom */}
      {questions.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleSaveAllChanges}
            disabled={savingChanges}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {savingChanges ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Question Preview</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPreviewQuestion(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 border border-zinc-700 rounded-md mb-4">
              <h4 className="text-lg mb-4">{previewQuestion.text}</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="sd" name="preview" className="mr-2" />
                  <label htmlFor="sd">Strongly Disagree</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="d" name="preview" className="mr-2" />
                  <label htmlFor="d">Disagree</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="n" name="preview" className="mr-2" />
                  <label htmlFor="n">Neither Agree nor Disagree</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="a" name="preview" className="mr-2" />
                  <label htmlFor="a">Agree</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="sa" name="preview" className="mr-2" />
                  <label htmlFor="sa">Strongly Agree</label>
                </div>
              </div>
            </div>
            <div className="text-sm text-zinc-400">
              <p>This is how the question will appear in the survey.</p>
              <p className="mt-2">Category: {previewQuestion.category}</p>
              <p>Axis: {previewQuestion.axis} ({previewQuestion.axis === 'X' ? 'Civilian' : 'Military'})</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPreviewQuestion(null)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
