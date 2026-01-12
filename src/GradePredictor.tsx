import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  targetGrade: string;
  extraPoints: string;
  extraPointsExpanded: boolean;
}

export default function GradePredictor() {
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = 'gradePredictorSubjects_v1_fsmen';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({ 1: true, 2: true });

  const getGradeColor = (grade: number): string => {
    if (grade >= 14.5) return 'text-green-600';
    if (grade >= 11.5) return 'text-yellow-400';
    if (grade >= 9.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (grade: number): string => {
    if (grade >= 14.5) return 'bg-green-500';
    if (grade >= 11.5) return 'bg-yellow-400';
    if (grade >= 9.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

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
      expanded: true,
      targetGrade: '',
      extraPoints: '',
      extraPointsExpanded: false
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

  const updateSubjectTargetGrade = (id: number, targetGrade: string): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, targetGrade } : s));
  };

  const updateSubjectExtraPoints = (id: number, extraPoints: string): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, extraPoints } : s));
  };

  const addExtraPointsSection = (id: number): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, extraPointsExpanded: true } : s));
  };

  const deleteExtraPointsSection = (id: number): void => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, extraPointsExpanded: false, extraPoints: '' } : s));
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
      ...subject.tests.map(t => ({ score: parseFloat(t.score) || 0, weight: parseFloat(t.weight) || 0, hasScore: t.score !== '' })),
      ...subject.assignments.map(a => ({ score: parseFloat(a.score) || 0, weight: parseFloat(a.weight) || 0, hasScore: a.score !== '' }))
    ].filter(g => g.hasScore && g.weight > 0);

    if (allGrades.length === 0) return 0;

    const totalWeight = allGrades.reduce((sum, g) => sum + g.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = allGrades.reduce((sum, g) => sum + (g.score * g.weight), 0);
    const baseGrade = weightedSum / totalWeight;
    const extraPoints = parseFloat(subject.extraPoints) || 0;
    return baseGrade + extraPoints;
  };

  const calculateSubjectGradeTestsOnly = (subject: Subject): number => {
    const tests = subject.tests
      .map(t => ({ score: parseFloat(t.score) || 0, weight: parseFloat(t.weight) || 0, hasScore: t.score !== '' }))
      .filter(t => t.hasScore && t.weight > 0);
    if (tests.length === 0) return 0;
    const totalWeight = tests.reduce((sum, t) => sum + t.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = tests.reduce((sum, t) => sum + (t.score * t.weight), 0);
    return weightedSum / totalWeight;
  };

  const calculateSubjectGradeAssignmentsOnly = (subject: Subject): number => {
    const assignments = subject.assignments
      .map(a => ({ score: parseFloat(a.score) || 0, weight: parseFloat(a.weight) || 0, hasScore: a.score !== '' }))
      .filter(a => a.hasScore && a.weight > 0);
    if (assignments.length === 0) return 0;
    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = assignments.reduce((sum, a) => sum + (a.score * a.weight), 0);
    return weightedSum / totalWeight;
  };

  const calculateMeanGrade = (): number => {
    if (subjects.length === 0) return 0;
    const validSubjects = subjects.filter(s => {
      const hasValidTests = s.tests.some(t => t.score !== '' && t.weight !== '');
      const hasValidAssignments = s.assignments.some(a => a.score !== '' && a.weight !== '');
      // Exclude if any test has weight but no score
      const allTestsWithWeightHaveScores = s.tests.filter(t => t.weight !== '').every(t => t.score !== '');
      // Exclude if any assignment has weight but no score
      const allAssignmentsWithWeightHaveScores = s.assignments.filter(a => a.weight !== '').every(a => a.score !== '');
      return (hasValidTests || hasValidAssignments) && allTestsWithWeightHaveScores && allAssignmentsWithWeightHaveScores;
    });
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
    const validSubjects = subjects.filter(s => {
      // Must have at least one test with score and weight
      const hasValidTests = s.tests.some(t => t.score !== '' && t.weight !== '');
      // All tests with weight must have scores
      const allTestsWithWeightHaveScores = s.tests.filter(t => t.weight !== '').every(t => t.score !== '');
      return hasValidTests && allTestsWithWeightHaveScores;
    });
    if (validSubjects.length === 0) return 0;

    const totalWeight = validSubjects.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = validSubjects.reduce((acc, s) => acc + (calculateSubjectGradeTestsOnly(s) * (parseFloat(s.weight) || 0)), 0);
    return weightedSum / totalWeight;
  };

  const calculateMeanGradeAssignmentsOnly = (): number => {
    if (subjects.length === 0) return 0;
    const validSubjects = subjects.filter(s => {
      const hasValidAssignments = s.assignments.some(a => a.score !== '' && a.weight !== '');
      const allAssignmentsWithWeightHaveScores = s.assignments.filter(a => a.weight !== '').every(a => a.score !== '');
      return hasValidAssignments && allAssignmentsWithWeightHaveScores;
    });
    if (validSubjects.length === 0) return 0;

    const totalWeight = validSubjects.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = validSubjects.reduce((acc, s) => acc + (calculateSubjectGradeAssignmentsOnly(s) * (parseFloat(s.weight) || 0)), 0);
    return weightedSum / totalWeight;
  };

  const calculateRequiredGrade = (subject: Subject): string => {
    const targetGrade = parseFloat(subject.targetGrade);
    if (!targetGrade || isNaN(targetGrade)) return '-';

    const extraPoints = parseFloat(subject.extraPoints) || 0;
    const adjustedTargetGrade = targetGrade - extraPoints;

    const allGrades = [
      ...subject.tests.map(t => ({ score: parseFloat(t.score) || 0, weight: parseFloat(t.weight) || 0, hasScore: t.score !== '' })),
      ...subject.assignments.map(a => ({ score: parseFloat(a.score) || 0, weight: parseFloat(a.weight) || 0, hasScore: a.score !== '' }))
    ];

    const completedItems = allGrades.filter(g => g.hasScore && g.weight > 0);
    const itemsWithWeight = allGrades.filter(g => g.weight > 0);
    const totalWeight = itemsWithWeight.reduce((sum, g) => sum + g.weight, 0);
    const completedWeight = completedItems.reduce((sum, g) => sum + g.weight, 0);
    const remainingWeight = totalWeight - completedWeight;

    if (remainingWeight <= 0) {
      const currentGrade = calculateSubjectGrade(subject);
      return currentGrade >= targetGrade ? 'Target Achieved!' : 'Target Not Achieved';
    }

    const currentWeightedSum = completedItems.reduce((sum, g) => sum + (g.score * g.weight), 0);
    const requiredWeightedSum = (adjustedTargetGrade * totalWeight) - currentWeightedSum;
    const requiredGrade = requiredWeightedSum / remainingWeight;

    if (requiredGrade > 20) return 'Not achievable';
    if (requiredGrade < 0) return 'Already achieved!';
    return requiredGrade.toFixed(2);
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
            <div className="text-right">
              <p className={`text-4xl font-bold ${getGradeColor(meanGrade)}`}>{meanGrade.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Grade Breakdown</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-700">Total Grade</span>
                  <span className="text-sm font-bold text-blue-900">{meanGrade.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className={`${getGradeBgColor(meanGrade)} h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold`}
                    style={{ width: `${(meanGrade / 20) * 100}%` }}
                  >
                    {meanGrade > 0 && `${meanGrade.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-700">Tests Only</span>
                  <span className="text-sm font-bold text-blue-900">{meanGradeTestsOnly.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className={`${getGradeBgColor(meanGradeTestsOnly)} h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold`}
                    style={{ width: `${(meanGradeTestsOnly / 20) * 100}%` }}
                  >
                    {meanGradeTestsOnly > 0 && `${meanGradeTestsOnly.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-700">Assignments Only</span>
                  <span className="text-sm font-bold text-blue-900">{meanGradeAssignmentsOnly.toFixed(2)} / 20</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-6">
                  <div
                    className={`${getGradeBgColor(meanGradeAssignmentsOnly)} h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold`}
                    style={{ width: `${(meanGradeAssignmentsOnly / 20) * 100}%` }}
                  >
                    {meanGradeAssignmentsOnly > 0 && `${meanGradeAssignmentsOnly.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-right">
            <button
              onClick={() => navigate('/chart')}
              className="flex items-center gap-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-semibold"
            >
              Check Test Grade
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {[1, 2].map(year => (
            <div key={year} className="bg-blue-50 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setExpandedYears({ ...expandedYears, [year]: !expandedYears[year] })}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full"
              >
                {expandedYears[year] ? <ChevronDown size={24} className="text-blue-600" /> : <ChevronRight size={24} className="text-blue-600" />}
                <h2 className="text-2xl font-bold text-blue-900">Year {year}</h2>
              </button>
              {expandedYears[year] && (
                <>
                  {[1, 2].map((semester: number) => (
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
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-700">Grade</span>
                                <span className={`text-lg font-bold ${subjectGrade > 0 ? getGradeColor(subjectGrade) : 'text-blue-700'} ml-1`}>{subjectGrade > 0 ? Math.round(subjectGrade) : '-'}</span>
                              </div>
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
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-4 mb-2">
                                  <label className="text-sm font-semibold text-blue-800">Target Grade:</label>
                                  <input
                                    type="number"
                                    value={subject.targetGrade}
                                    onChange={(e) => updateSubjectTargetGrade(subject.id, e.target.value)}
                                    min="0"
                                    max="20"
                                    step="0.1"
                                    placeholder="-"
                                    className="w-20 px-2 py-1 border rounded text-center"
                                  />
                                  {subject.targetGrade && (
                                    <>
                                      <span className="text-sm text-blue-700">Required grade on remaining:</span>
                                      <span className="text-sm font-bold text-blue-900">{calculateRequiredGrade(subject)}</span>
                                      <div className="ml-auto">
                                        <button
                                          onClick={() => subject.extraPointsExpanded ? deleteExtraPointsSection(subject.id) : addExtraPointsSection(subject.id)}
                                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                                        >
                                          {subject.extraPointsExpanded ? 'Delete Extra Points' : 'Add Extra Points'}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {subject.extraPointsExpanded && (
                                  <div className="flex items-center gap-4 mb-2">
                                    <label className="text-sm font-semibold text-blue-800">Extra Points:</label>
                                    <input
                                      type="number"
                                      value={subject.extraPoints}
                                      onChange={(e) => updateSubjectExtraPoints(subject.id, e.target.value)}
                                      min="0"
                                      step="0.1"
                                      placeholder="-"
                                      className="w-20 px-2 py-1 border rounded text-center"
                                    />
                                  </div>
                                )}
                                {subjectGrade > 0 && (
                                  <div className="mt-2">
                                    <div className="flex justify-between mb-1">
                                      <span className="text-xs text-blue-700">Current Progress</span>
                                      <span className="text-xs font-bold text-blue-900">{subjectGrade.toFixed(2)} / 20</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-4">
                                      <div
                                        className={`${getGradeBgColor(subjectGrade)} h-4 rounded-full transition-all duration-300`}
                                        style={{ width: `${(subjectGrade / 20) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
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
                                  {subject.tests.map((test, idx) => {
                                    const testScore = parseFloat(test.score) || 0;
                                    return (
                                      <div key={idx} className="mb-2">
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
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
                                        {testScore > 0 && (
                                          <div className="mt-1 px-2">
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                              <div
                                                className={`${getGradeBgColor(testScore)} h-2 rounded-full transition-all duration-300`}
                                                style={{ width: `${(testScore / 20) * 100}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
                                  {subject.assignments.map((assignment, idx) => {
                                    const assignmentScore = parseFloat(assignment.score) || 0;
                                    return (
                                      <div key={idx} className="mb-2">
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
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
                                        {assignmentScore > 0 && (
                                          <div className="mt-1 px-2">
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                              <div
                                                className={`${getGradeBgColor(assignmentScore)} h-2 rounded-full transition-all duration-300`}
                                                style={{ width: `${(assignmentScore / 20) * 100}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
