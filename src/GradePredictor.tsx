import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, ChevronDown, ChevronRight } from 'lucide-react';

interface GradeItem {
  score: string;
  weight: string;
}

interface Subject {
  id: number;
  name: string;
  weight: string;
  year: number;
  semester: number;
  tests: GradeItem[];
  assignments: GradeItem[];
  expanded: boolean;
}

export default function GradePredictor() {
  const LOCAL_STORAGE_KEY = 'gradePredictorSubjects_v1_fsmen';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load subjects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log('Loaded from localStorage:', saved);
    if (saved) {
      try {
        setSubjects(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing subjects from localStorage:', err);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subjects));
      console.log('Saved to localStorage:', subjects);
    }
  }, [subjects, loaded]);

  const addSubject = (year: number, semester: number): void => {
    setSubjects([...subjects, {
      id: Date.now(),
      name: '',
      weight: '',
      year,
      semester,
      tests: [],
      assignments: [],
      expanded: true
    }]);
  };

  const removeSubject = (id: number): void => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const toggleSubjectExpansion = (id: number): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  const updateSubjectName = (id: number, name: string): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateSubjectWeight = (id: number, weight: string): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, weight } : s));
  };

  const addTest = (subjectId: number): void => {
    setSubjects(subjects.map(s =>
      s.id === subjectId
        ? { ...s, tests: [...s.tests, { score: '', weight: '' }] }
        : s
    ));
  };

  const addAssignment = (subjectId: number): void => {
    setSubjects(subjects.map(s =>
      s.id === subjectId
        ? { ...s, assignments: [...s.assignments, { score: '', weight: '' }] }
        : s
    ));
  };

  const updateTest = (subjectId: number, testIdx: number, field: keyof GradeItem, value: string): void => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        const newTests = [...s.tests];
        newTests[testIdx][field] = value;
        return { ...s, tests: newTests };
      }
      return s;
    }));
  };

  const updateAssignment = (subjectId: number, assignIdx: number, field: keyof GradeItem, value: string): void => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        const newAssignments = [...s.assignments];
        newAssignments[assignIdx][field] = value;
        return { ...s, assignments: newAssignments };
      }
      return s;
    }));
  };

  const removeTest = (subjectId: number, testIdx: number): void => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, tests: s.tests.filter((_, i) => i !== testIdx) };
      }
      return s;
    }));
  };

  const removeAssignment = (subjectId: number, assignIdx: number): void => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, assignments: s.assignments.filter((_, i) => i !== assignIdx) };
      }
      return s;
    }));
  };

  const calculateSubjectGrade = (subject: Subject): number => {
    const allGrades = [
      ...subject.tests.map(t => ({ score: parseFloat(t.score) || 0, weight: parseFloat(t.weight) || 0 })),
      ...subject.assignments.map(a => ({ score: parseFloat(a.score) || 0, weight: parseFloat(a.weight) || 0 }))
    ];

    if (allGrades.length === 0) return 0;

    const totalWeight = allGrades.reduce((sum, g) => sum + g.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = allGrades.reduce((sum, g) => sum + (g.score * g.weight), 0);
    return weightedSum / totalWeight;
  };

  const calculateSubjectGradeTestsOnly = (subject: Subject): number => {
    const tests = subject.tests.map(t => ({ score: parseFloat(t.score) || 0, weight: parseFloat(t.weight) || 0 }));
    if (tests.length === 0) return 0;
    const totalWeight = tests.reduce((sum, t) => sum + t.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = tests.reduce((sum, t) => sum + (t.score * t.weight), 0);
    return weightedSum / totalWeight;
  };

  const calculateSubjectGradeAssignmentsOnly = (subject: Subject): number => {
    const assignments = subject.assignments.map(a => ({ score: parseFloat(a.score) || 0, weight: parseFloat(a.weight) || 0 }));
    if (assignments.length === 0) return 0;
    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = assignments.reduce((sum, a) => sum + (a.score * a.weight), 0);
    return weightedSum / totalWeight;
  };

  const calculateMeanGrade = (): number => {
    if (subjects.length === 0) return 0;
    const validSubjects = subjects.filter(s => s.tests.length > 0 || s.assignments.length > 0);
    if (validSubjects.length === 0) return 0;

    const totalWeight = validSubjects.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    // Round each subject grade to nearest integer before calculating mean
    const weightedSum = validSubjects.reduce((acc, s) => {
      const roundedGrade = Math.round(calculateSubjectGrade(s));
      return acc + (roundedGrade * (parseFloat(s.weight) || 0));
    }, 0);
    return weightedSum / totalWeight;
  };

  const calculateMeanGradeTestsOnly = (): number => {
    if (subjects.length === 0) return 0;
    const validSubjects = subjects.filter(s => s.tests.length > 0);
    if (validSubjects.length === 0) return 0;

    const totalWeight = validSubjects.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = validSubjects.reduce((acc, s) => acc + (calculateSubjectGradeTestsOnly(s) * (parseFloat(s.weight) || 0)), 0);
    return weightedSum / totalWeight;
  };

  const calculateMeanGradeAssignmentsOnly = (): number => {
    if (subjects.length === 0) return 0;
    const validSubjects = subjects.filter(s => s.assignments.length > 0);
    if (validSubjects.length === 0) return 0;

    const totalWeight = validSubjects.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = validSubjects.reduce((acc, s) => acc + (calculateSubjectGradeAssignmentsOnly(s) * (parseFloat(s.weight) || 0)), 0);
    return weightedSum / totalWeight;
  };

  const meanGrade = calculateMeanGrade();
  const meanGradeTestsOnly = calculateMeanGradeTestsOnly();
  const meanGradeAssignmentsOnly = calculateMeanGradeAssignmentsOnly();

  // Group subjects by year and semester
  const groupedSubjects: Record<number, Record<number, Subject[]>> = { 1: { 1: [], 2: [] }, 2: { 1: [], 2: [] } };
  subjects.forEach(subject => {
    groupedSubjects[subject.year][subject.semester].push(subject);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-blue-900">Grade Predictor</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">{meanGrade.toFixed(2)}</p>
              </div>
              <Calculator className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Grade Breakdown</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-blue-700">Total Grade</span>
                  <span className="text-sm font-bold text-blue-900">{meanGrade.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(meanGrade / 20) * 100}%` }}
                  >
                    {meanGrade > 0 && `${meanGrade.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-blue-700">Tests Only</span>
                  <span className="text-sm font-bold text-blue-900">{meanGradeTestsOnly.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(meanGradeTestsOnly / 20) * 100}%` }}
                  >
                    {meanGradeTestsOnly > 0 && `${meanGradeTestsOnly.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-blue-700">Assignments Only</span>
                  <span className="text-sm font-bold text-blue-900">{meanGradeAssignmentsOnly.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className="bg-blue-400 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(meanGradeAssignmentsOnly / 20) * 100}%` }}
                  >
                    {meanGradeAssignmentsOnly > 0 && `${meanGradeAssignmentsOnly.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[1, 2].map(year => (
            <div key={year} className="bg-blue-50 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Year {year}</h2>
              {[1, 2].map(semester => (
                <div key={semester} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-blue-800">Semester {semester}</h3>
                    <button
                      onClick={() => addSubject(year, semester)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      <Plus size={16} />
                      Add Subject
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(groupedSubjects[year][semester] || []).map(subject => {
                      const subjectGrade = calculateSubjectGrade(subject);
                      return (
                        <div key={subject.id} className="bg-white rounded-lg shadow p-4">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSubjectExpansion(subject.id)}
                          >
                            <div className="flex items-center gap-4 w-full">
                              {subject.expanded ? <ChevronDown size={20} className="text-blue-600" /> : <ChevronRight size={20} className="text-blue-600" />}
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) => { e.stopPropagation(); updateSubjectName(subject.id, e.target.value); }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Subject Name"
                                className="text-lg font-bold text-blue-900 border-b-2 border-transparent focus:border-blue-600 outline-none flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={subject.weight}
                                  onChange={(e) => { e.stopPropagation(); updateSubjectWeight(subject.id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                                  className="w-16 px-2 py-1 border rounded text-center text-sm"
                                />
                                <span className="text-xs text-blue-700">ECTS</span>
                              </div>
                              <span className="text-xs text-blue-700 ml-2">Grade</span>
                              <span className="text-lg font-bold text-blue-600 ml-1">{subjectGrade > 0 ? subjectGrade.toFixed(2) : '-'}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeSubject(subject.id); }}
                                className="text-blue-500 hover:text-blue-700 transition ml-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          {subject.expanded && (
                            <div className="mt-4 pt-4 border-t border-blue-100">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-blue-800">Tests</h4>
                                    <button
                                      onClick={() => addTest(subject.id)}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                                    >
                                      <Plus size={14} />
                                      Add
                                    </button>
                                  </div>
                                  {subject.tests.map((test, idx) => (
                                    <div key={idx} className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded">
                                      <div className="flex-1">
                                        <label className="text-xs text-blue-700">Score (0-20)</label>
                                        <input
                                          type="number"
                                          value={test.score}
                                          onChange={(e) => updateTest(subject.id, idx, 'score', e.target.value)}
                                          min="0"
                                          max="20"
                                          step="0.01"
                                          placeholder=""
                                          className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-xs text-blue-700">Weight (%)</label>
                                        <input
                                          type="number"
                                          value={test.weight}
                                          onChange={(e) => updateTest(subject.id, idx, 'weight', e.target.value)}
                                          min="0"
                                          placeholder=""
                                          className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                      </div>
                                      <button
                                        onClick={() => removeTest(subject.id, idx)}
                                        className="text-blue-700 hover:text-blue-900 mt-4"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-blue-800">Assignments</h4>
                                    <button
                                      onClick={() => addAssignment(subject.id)}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                                    >
                                      <Plus size={14} />
                                      Add
                                    </button>
                                  </div>
                                  {subject.assignments.map((assignment, idx) => (
                                    <div key={idx} className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded">
                                      <div className="flex-1">
                                        <label className="text-xs text-blue-700">Score (0-20)</label>
                                        <input
                                          type="number"
                                          value={assignment.score}
                                          onChange={(e) => updateAssignment(subject.id, idx, 'score', e.target.value)}
                                          min="0"
                                          max="20"
                                          step="0.01"
                                          placeholder=""
                                          className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-xs text-blue-700">Weight (%)</label>
                                        <input
                                          type="number"
                                          value={assignment.weight}
                                          onChange={(e) => updateAssignment(subject.id, idx, 'weight', e.target.value)}
                                          min="0"
                                          placeholder=""
                                          className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                      </div>
                                      <button
                                        onClick={() => removeAssignment(subject.id, idx)}
                                        className="text-blue-700 hover:text-blue-900 mt-4"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
