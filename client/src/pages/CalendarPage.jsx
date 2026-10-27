import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import { calendarService } from '../services/calendarService';
import { outfitService } from '../services/outfitService';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CalendarPage = () => {
  const { showSuccess, showError } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduling Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState('');
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [planNotes, setPlanNotes] = useState('');
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Day View Modal (when clicking a date on calendar)
  const [selectedDateDetails, setSelectedDateDetails] = useState(null); // { dateString, plans: [] }
  const [planToDelete, setPlanToDelete] = useState(null);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [plansRes, outfitsRes] = await Promise.all([
        calendarService.getPlans({ month, year }),
        outfitService.getAll(),
      ]);

      if (plansRes.success) setPlans(plansRes.plans);
      if (outfitsRes.success) setOutfits(outfitsRes.outfits);
    } catch (err) {
      console.error('Calendar data error:', err);
      showError('Failed to load style calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenScheduleForDate = (dateStr) => {
    setEditingPlanId(null);
    setPlanDate(dateStr || new Date().toISOString().split('T')[0]);
    setSelectedOutfitId(outfits[0]?._id || '');
    setPlanNotes('');
    setIsScheduleOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlanId(plan._id);
    setSelectedOutfitId(plan.outfitId?._id || plan.outfitId);
    setPlanDate(plan.dateString);
    setPlanNotes(plan.notes || '');
    setSelectedDateDetails(null);
    setIsScheduleOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();

    if (!selectedOutfitId) {
      showError('Please select an outfit to schedule.');
      return;
    }

    if (!planDate) {
      showError('Please choose a date.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPlanId) {
        await calendarService.updatePlan(editingPlanId, {
          outfitId: selectedOutfitId,
          plannedDate: planDate,
          notes: planNotes,
        });
        showSuccess('Outfit plan updated successfully.');
      } else {
        await calendarService.createPlan({
          outfitId: selectedOutfitId,
          plannedDate: planDate,
          notes: planNotes,
        });
        showSuccess('Outfit planned on calendar!');
      }

      setIsScheduleOpen(false);
      fetchCalendarData();
    } catch (err) {
      console.error('Save plan error:', err);
      const msg = err.response?.data?.message || 'Could not schedule outfit.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      setSubmitting(true);
      await calendarService.deletePlan(planToDelete._id);
      showSuccess('Outfit plan removed from calendar.');
      setPlanToDelete(null);
      setSelectedDateDetails(null);
      fetchCalendarData();
    } catch (err) {
      showError('Could not delete plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 to 11
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Build grid cells (42 cells: 6 rows x 7 days)
  const calendarCells = [];

  // Prev month filler
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarCells.push({
      day,
      isOtherMonth: true,
      dateString: '',
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const dateString = `${year}-${paddedMonth}-${paddedDay}`;
    const dayPlans = plans.filter((p) => p.dateString === dateString);

    calendarCells.push({
      day,
      isOtherMonth: false,
      dateString,
      isToday: dateString === todayStr,
      plans: dayPlans,
    });
  }

  // Next month filler
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push({
      day,
      isOtherMonth: true,
      dateString: '',
    });
  }

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
            Schedule & Plan
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
            Style Calendar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Plan outfits ahead of time and curate your daily signature looks without morning stress.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleToday}>
            Today
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenScheduleForDate(todayStr)}
            disabled={outfits.length === 0}
          >
            <Plus size={16} /> Schedule Outfit
          </button>
        </div>
      </div>

      {outfits.length === 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--accent-lavender-light)', borderRadius: 'var(--radius-md)', color: 'var(--accent-lavender-dark)', fontSize: '0.9rem' }}>
          You don't have any saved outfits yet. Build an outfit in the{' '}
          <a href="/builder" style={{ fontWeight: 700, textDecoration: 'underline' }}>
            Outfit Architect
          </a>{' '}
          first so you can schedule it on your calendar.
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="calendar-wrapper">
        {/* Month Selector bar */}
        <div className="calendar-header">
          <h2 className="calendar-month-title">{monthName}</h2>
          <div className="calendar-nav-buttons">
            <button
              className="btn btn-outline btn-icon"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="btn btn-outline btn-icon"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="calendar-weekdays-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-weekday">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        {loading ? (
          <LoadingSpinner message="Syncing calendar plans..." />
        ) : (
          <div className="calendar-days-grid">
            {calendarCells.map((cell, idx) => {
              if (cell.isOtherMonth) {
                return (
                  <div key={idx} className="calendar-day-cell other-month">
                    <span className="day-number">{cell.day}</span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`calendar-day-cell ${cell.isToday ? 'is-today' : ''}`}
                  onClick={() => {
                    if (cell.plans && cell.plans.length > 0) {
                      setSelectedDateDetails({
                        dateString: cell.dateString,
                        plans: cell.plans,
                      });
                    } else {
                      handleOpenScheduleForDate(cell.dateString);
                    }
                  }}
                  title={cell.plans?.length > 0 ? `${cell.plans.length} look(s) planned` : 'Click to schedule outfit'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="day-number">{cell.day}</span>
                    {cell.isToday && (
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-lavender-dark)' }}>
                        Today
                      </span>
                    )}
                  </div>

                  {cell.plans &&
                    cell.plans.slice(0, 2).map((plan) => {
                      const outfit = plan.outfitId;
                      const coverImg = outfit?.clothingItems?.[0]?.imageUrl;
                      return (
                        <div key={plan._id} className="day-plan-tag">
                          {coverImg && (
                            <img
                              src={getFullImageUrl(coverImg)}
                              alt={outfit?.name || 'Look'}
                            />
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {outfit?.name || 'Outfit'}
                          </span>
                        </div>
                      );
                    })}

                  {cell.plans && cell.plans.length > 2 && (
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-lavender-dark)', marginTop: '2px' }}>
                      +{cell.plans.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Outfit Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title={editingPlanId ? 'Edit Outfit Schedule' : 'Schedule Look on Calendar'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsScheduleOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingPlanId ? 'Update Schedule' : 'Confirm Plan'}
            </button>
          </>
        }
      >
        <form id="schedule-form" onSubmit={handleSavePlan}>
          <div className="form-group">
            <label className="form-label">Planned Date *</label>
            <input
              type="date"
              className="form-input"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Curated Outfit *</label>
            <select
              className="form-select"
              value={selectedOutfitId}
              onChange={(e) => setSelectedOutfitId(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Choose an outfit from your wardrobe --
              </option>
              {outfits.map((outfit) => (
                <option key={outfit._id} value={outfit._id}>
                  {outfit.name} ({outfit.occasion} • {outfit.clothingItems?.length || 0} items)
                </option>
              ))}
            </select>
          </div>

          {/* Outfit preview snapshot in modal */}
          {selectedOutfitId && (
            <div style={{ marginBottom: '1.25rem' }}>
              {(() => {
                const sel = outfits.find((o) => o._id === selectedOutfitId);
                if (!sel) return null;
                return (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {sel.clothingItems?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={getFullImageUrl(item.imageUrl)}
                          alt={item.name}
                          style={{ width: '42px', height: '42px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sel.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {sel.occasion} • {sel.season}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Event or Day Notes</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Design review at 11 AM, Soho dinner reservations at 8 PM."
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              rows={2}
            />
          </div>
        </form>
      </Modal>

      {/* Date Inspection Drawer / Modal */}
      <Modal
        isOpen={!!selectedDateDetails}
        onClose={() => setSelectedDateDetails(null)}
        title={`Looks Planned for ${selectedDateDetails?.dateString || ''}`}
        maxWidth="680px"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const dateStr = selectedDateDetails?.dateString;
                setSelectedDateDetails(null);
                handleOpenScheduleForDate(dateStr);
              }}
            >
              <Plus size={15} /> Add Another Look
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedDateDetails(null)}>
              Close
            </button>
          </div>
        }
      >
        {selectedDateDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selectedDateDetails.plans.map((plan) => {
              const outfit = plan.outfitId;
              return (
                <div
                  key={plan._id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600 }}>
                        {outfit?.name || 'Curated Look'}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <span className="badge badge-lavender">{outfit?.occasion}</span>
                        <span className="badge badge-default">{outfit?.season}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleOpenEditPlan(plan)}
                        title="Edit plan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--status-error)' }}
                        onClick={() => setPlanToDelete(plan)}
                        title="Remove plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {plan.notes && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', fontStyle: 'italic' }}>
                      "{plan.notes}"
                    </p>
                  )}

                  {/* Included Pieces Mosaic */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                    {outfit?.clothingItems?.map((piece) => (
                      <div
                        key={piece._id}
                        style={{
                          background: '#fff',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <img
                          src={getFullImageUrl(piece.imageUrl)}
                          alt={piece.name}
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '0.25rem', fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {piece.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Delete Plan Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDeletePlan}
        title="Remove Outfit Plan?"
        message={`Are you sure you want to remove this look from ${planToDelete?.dateString}? Your saved outfit will remain safe in your wardrobe.`}
        confirmText="Remove from Calendar"
        loading={submitting}
      />
    </div>
  );
};

export default CalendarPage;

