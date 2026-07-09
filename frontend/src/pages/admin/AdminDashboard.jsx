import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { 
  Users, Calendar, LogOut, Search, Plus, UserPlus, Trash2, Edit2, 
  ToggleLeft, ToggleRight, KeyRound, ShieldAlert, CheckCircle2, Clipboard, X
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'timetable'
  
  // Alert states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // One-time modal displays
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCode, setModalCode] = useState('');
  const [showModal, setShowModal] = useState(false);

  // STUDENT STATES
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Add Student form states
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  // TIMETABLE STATES
  const [timetable, setTimetable] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // entry being edited (null for Add mode)
  
  // Timetable form states
  const [ttDept, setTtDept] = useState('');
  const [ttSem, setTtSem] = useState('');
  const [ttBatch, setTtBatch] = useState('');
  const [ttSubject, setTtSubject] = useState('');
  const [ttFaculty, setTtFaculty] = useState('');
  const [ttDay, setTtDay] = useState('Monday');
  const [ttStart, setTtStart] = useState('09:00');
  const [ttEnd, setTtEnd] = useState('10:00');
  const [ttRoom, setTtRoom] = useState('');
  const [submittingTimetable, setSubmittingTimetable] = useState(false);

  // FETCH STUDENTS
  const fetchStudents = async (query = '') => {
    setLoadingStudents(true);
    try {
      const url = query 
        ? `${API_BASE_URL}/api/admin/students/search?q=${encodeURIComponent(query)}` 
        : `${API_BASE_URL}/api/admin/students`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch student records.');
      }
    } catch (err) {
      setError('Connection error. Failed to load students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // FETCH TIMETABLES
  const fetchTimetable = async () => {
    setLoadingTimetable(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/timetable`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      } else {
        setError('Failed to fetch timetable entries.');
      }
    } catch (err) {
      setError('Connection error. Failed to load timetable.');
    } finally {
      setLoadingTimetable(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents(studentSearch);
    } else {
      fetchTimetable();
    }
  }, [activeTab]);

  // HANDLE STUDENT SEARCH
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(studentSearch);
  };

  // ADD STUDENT
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rollNo || !studentName || !phone || !department || !semester || !batch) {
      setError('Please fill in all student details.');
      return;
    }

    setAddingStudent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: rollNo.toUpperCase().trim(),
          name: studentName.trim(),
          phone: phone.trim(),
          department: department.trim(),
          semester: semester.trim(),
          batch: batch.trim()
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add student.');
      }

      // Display activation code modal
      setModalTitle('Student Record Enrolled');
      setModalMessage(`Student ${data.name} was successfully created. Copy and deliver the following activation code to the student. It will not be shown again.`);
      setModalCode(data.activationCode);
      setShowModal(true);

      // Reset form
      setRollNo('');
      setStudentName('');
      setPhone('');
      setDepartment('');
      setSemester('');
      setBatch('');

      fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingStudent(false);
    }
  };

  // TOGGLE ENABLE/DISABLE STUDENT
  const handleToggleStudent = async (studentRoll) => {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentRoll}/toggle-status`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Action failed.');
      }
      setSuccess(`Status of student ${studentRoll} updated.`);
      fetchStudents(studentSearch);
    } catch (err) {
      setError(err.message);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (studentRoll) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentRoll}/reset-password`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      // Display temporary password modal
      setModalTitle('Password Reset Successful');
      setModalMessage(`Temporary password for Roll ${studentRoll} has been generated. Provide it to the student. They will be forced to change it upon login.`);
      setModalCode(data.temporaryPassword);
      setShowModal(true);
      fetchStudents(studentSearch);
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE STUDENT
  const handleDeleteStudent = async (studentRoll) => {
    if (!window.confirm(`Are you sure you want to permanently delete student ${studentRoll}? This will cascade delete all their attendance records and task entries.`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentRoll}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Deletion failed.');
      }
      setSuccess(`Student ${studentRoll} and all associated data deleted.`);
      fetchStudents(studentSearch);
    } catch (err) {
      setError(err.message);
    }
  };

  // ADD OR UPDATE TIMETABLE ENTRY
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ttDept || !ttSem || !ttBatch || !ttSubject || !ttFaculty || !ttDay || !ttStart || !ttEnd || !ttRoom) {
      setError('Please fill in all timetable fields.');
      return;
    }

    setSubmittingTimetable(true);
    try {
      const isEdit = !!editingEntry;
      const url = isEdit ? `${API_BASE_URL}/api/admin/timetable/${editingEntry.id}` : `${API_BASE_URL}/api/admin/timetable`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          department: ttDept.trim(),
          semester: ttSem.trim(),
          batch: ttBatch.trim(),
          subject: ttSubject.trim(),
          faculty: ttFaculty.trim(),
          day: ttDay.trim(),
          startTime: ttStart,
          endTime: ttEnd,
          room: ttRoom.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Operation failed.');
      }

      setSuccess(`Timetable entry successfully ${isEdit ? 'updated' : 'added'}.`);
      
      // Reset form
      setEditingEntry(null);
      setTtDept('');
      setTtSem('');
      setTtBatch('');
      setTtSubject('');
      setTtFaculty('');
      setTtDay('Monday');
      setTtStart('09:00');
      setTtEnd('10:00');
      setTtRoom('');

      fetchTimetable();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingTimetable(false);
    }
  };

  // EDIT TIMETABLE CLICK
  const startEditTimetable = (entry) => {
    setEditingEntry(entry);
    setTtDept(entry.department);
    setTtSem(entry.semester);
    setTtBatch(entry.batch);
    setTtSubject(entry.subject);
    setTtFaculty(entry.faculty);
    setTtDay(entry.day);
    // Format LocalTime string (HH:mm:ss) into HTML time input format (HH:mm)
    setTtStart(entry.startTime.substring(0, 5));
    setTtEnd(entry.endTime.substring(0, 5));
    setTtRoom(entry.room);
  };

  // CANCEL EDIT TIMETABLE
  const cancelEditTimetable = () => {
    setEditingEntry(null);
    setTtDept('');
    setTtSem('');
    setTtBatch('');
    setTtSubject('');
    setTtFaculty('');
    setTtDay('Monday');
    setTtStart('09:00');
    setTtEnd('10:00');
    setTtRoom('');
  };

  // DELETE TIMETABLE
  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/timetable/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Delete failed.');
      }
      setSuccess('Timetable entry deleted.');
      fetchTimetable();
    } catch (err) {
      setError(err.message);
    }
  };

  // COPY CODE HELPER
  const copyToClipboard = () => {
    navigator.clipboard.writeText(modalCode);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      
      {/* Admin Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-gray-100">Campus Pocket</h1>
            <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">Administrative Control Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold">LOGGED IN AS</p>
            <p className="text-sm font-mono font-bold text-gray-200">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 font-semibold rounded-xl border border-red-900/30 text-sm flex items-center space-x-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 flex">
        <button
          onClick={() => { setActiveTab('students'); setError(''); setSuccess(''); }}
          className={`py-4 px-6 font-display font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'students'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Management</span>
        </button>
        <button
          onClick={() => { setActiveTab('timetable'); setError(''); setSuccess(''); }}
          className={`py-4 px-6 font-display font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'timetable'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timetable Management</span>
        </button>
      </div>

      {/* Main Work Area */}
      <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
        
        {/* Banner Alert Logs */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-sm text-red-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-start space-x-3 text-sm text-green-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'students' ? (
          /* ==============================================================
             STUDENT TAB 
             ============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List & Search (Col span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-3xl border border-gray-700/50 p-6 space-y-4">
                
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex space-x-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students by Roll Number or Name..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 font-semibold rounded-2xl text-sm transition-all shadow-md"
                  >
                    Search
                  </button>
                </form>

                {/* Table list */}
                <div className="overflow-x-auto">
                  {loadingStudents ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      No student records found. Add one on the right to start.
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400 font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Roll Number</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Dept / Sem / Batch</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.rollNo} className="border-b border-gray-800 hover:bg-gray-800/30 transition-all">
                            <td className="py-3.5 px-4 font-mono font-bold text-gray-200">{student.rollNo}</td>
                            <td className="py-3.5 px-4 font-medium">{student.name}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                              {student.department} / S{student.semester} / B{student.batch}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                student.activated 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {student.activated ? 'Activated' : 'Pre-approved'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              {/* Toggle Status (Enable/Disable) */}
                              <button
                                onClick={() => handleToggleStudent(student.rollNo)}
                                title={student.enabled ? "Disable Account" : "Enable Account"}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  student.enabled
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                }`}
                              >
                                {student.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              
                              {/* Password Reset */}
                              <button
                                onClick={() => handleResetPassword(student.rollNo)}
                                title="Reset Student Password"
                                className="p-1.5 bg-gray-900/50 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-all"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Delete Student */}
                              <button
                                onClick={() => handleDeleteStudent(student.rollNo)}
                                title="Delete Student"
                                className="p-1.5 bg-gray-900/50 hover:bg-red-950/30 hover:text-red-400 border border-gray-700 hover:border-red-900/30 text-gray-400 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Enroll Student Form */}
            <div className="bg-gray-800 rounded-3xl border border-gray-700/50 p-6 h-fit space-y-4">
              <div className="flex items-center space-x-2 text-purple-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-gray-100">Enroll Student</h3>
              </div>
              <p className="text-xs text-gray-400">Enrolling creates a pre-approved roll entry. The generated activation code must be given to the student.</p>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. CS202601"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={addingStudent}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alice Cooper"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={addingStudent}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={addingStudent}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dept</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={addingStudent}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. S3"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={addingStudent}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Batch</label>
                    <input
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={addingStudent}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingStudent}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                >
                  {addingStudent ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Enroll Student</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* ==============================================================
             TIMETABLE TAB
             ============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List entries (Col span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-3xl border border-gray-700/50 p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-gray-100">Timetable Slots</h3>
                
                <div className="overflow-x-auto">
                  {loadingTimetable ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : timetable.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      No timetable slots configured yet. Create one on the right.
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400 font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Subject & Faculty</th>
                          <th className="py-3 px-4">Dept / Sem / Batch</th>
                          <th className="py-3 px-4">Day & Time</th>
                          <th className="py-3 px-4">Room</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.map((slot) => (
                          <tr key={slot.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-all">
                            <td className="py-3 px-4">
                              <p className="font-bold text-gray-200">{slot.subject}</p>
                              <p className="text-xs text-gray-400">{slot.faculty}</p>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {slot.department} / S{slot.semester} / B{slot.batch}
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-semibold">{slot.day}</p>
                              <p className="text-xs font-mono text-gray-400">
                                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                              </p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-purple-400">{slot.room}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => startEditTimetable(slot)}
                                className="p-1.5 bg-gray-900 hover:bg-gray-700 text-purple-400 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTimetable(slot.id)}
                                className="p-1.5 bg-gray-900 hover:bg-red-950/30 text-red-400 border border-gray-700 hover:border-red-900/30 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Timetable Add/Edit Form */}
            <div className="bg-gray-800 rounded-3xl border border-gray-700/50 p-6 h-fit space-y-4">
              <div className="flex items-center space-x-2 text-purple-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-gray-100">
                  {editingEntry ? 'Edit Entry' : 'Add Timetable Entry'}
                </h3>
              </div>

              <form onSubmit={handleTimetableSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dept</label>
                    <input
                      type="text"
                      value={ttDept}
                      onChange={(e) => setTtDept(e.target.value)}
                      placeholder="e.g. CSE"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={submittingTimetable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sem</label>
                    <input
                      type="text"
                      value={ttSem}
                      onChange={(e) => setTtSem(e.target.value)}
                      placeholder="e.g. S3"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={submittingTimetable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Batch</label>
                    <input
                      type="text"
                      value={ttBatch}
                      onChange={(e) => setTtBatch(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-center uppercase"
                      disabled={submittingTimetable}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={ttSubject}
                    onChange={(e) => setTtSubject(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={submittingTimetable}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Faculty</label>
                  <input
                    type="text"
                    value={ttFaculty}
                    onChange={(e) => setTtFaculty(e.target.value)}
                    placeholder="e.g. Prof. Alan Smith"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={submittingTimetable}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Day</label>
                  <select
                    value={ttDay}
                    onChange={(e) => setTtDay(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-200"
                    disabled={submittingTimetable}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Time</label>
                    <input
                      type="time"
                      value={ttStart}
                      onChange={(e) => setTtStart(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-center font-mono text-gray-200"
                      disabled={submittingTimetable}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Time</label>
                    <input
                      type="time"
                      value={ttEnd}
                      onChange={(e) => setTtEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-center font-mono text-gray-200"
                      disabled={submittingTimetable}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Class Room</label>
                  <input
                    type="text"
                    value={ttRoom}
                    onChange={(e) => setTtRoom(e.target.value)}
                    placeholder="e.g. Room 302"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={submittingTimetable}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={submittingTimetable}
                    className="flex-grow py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center"
                  >
                    {submittingTimetable ? 'Saving...' : editingEntry ? 'Update' : 'Add Slot'}
                  </button>
                  {editingEntry && (
                    <button
                      type="button"
                      onClick={cancelEditTimetable}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
        )}
      </main>

      {/* ONE-TIME ALERT DIALOG OVERLAY (MODAL) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-800 rounded-3xl border border-gray-700 p-6 shadow-2xl relative space-y-4 animate-scaleUp">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-gray-100">{modalTitle}</h3>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-400 leading-relaxed">{modalMessage}</p>

            {/* Code Highlight Box */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-700 p-4 rounded-2xl font-mono text-lg font-bold text-purple-400">
              <span>{modalCode}</span>
              <button 
                onClick={copyToClipboard}
                title="Copy to clipboard"
                className="p-2 hover:bg-gray-800 text-gray-400 hover:text-purple-400 rounded-xl transition-all"
              >
                <Clipboard className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl text-sm transition-all"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
