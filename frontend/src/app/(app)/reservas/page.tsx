'use client';
import { useState } from 'react';
import { useReservas, useCancelarReserva } from '@/hooks/useReservas';
import { Reserva } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import ModalReserva from '@/components/modals/ModalReserva';
import EmptyState from '@/components/shared/EmptyState';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const areaColors: Record<string, string> = {
  'Churrasqueira':  'var(--amber)',
  'Salão de Festas': 'var(--purple)',
  'Academia':        'var(--blue)',
  'Piscina':         'var(--green)',
  'Quadra':          'var(--red)',
  'Espaço Gourmet':  'var(--gold)',
};

const areaBg: Record<string, string> = {
  'Churrasqueira':  'var(--amber-bg)',
  'Salão de Festas': 'var(--purple-bg)',
  'Academia':        'var(--blue-bg)',
  'Piscina':         'var(--green-bg)',
  'Quadra':          'var(--red-bg)',
  'Espaço Gourmet':  'var(--gold-dim)',
};

function getWeekDays(baseDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

const ptDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function ReservasPage() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const { data: reservas, isLoading } = useReservas();
  const cancelar = useCancelarReserva();

  const weekDays = getWeekDays(baseDate);
  const today = toDateStr(new Date());

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  const reservasForDay = (day: Date) => {
    const str = toDateStr(day);
    return (reservas || []).filter(r => {
      const rd = toDateStr(new Date(r.dataReserva));
      return rd === str && r.status !== 'CANCELADA';
    });
  };

  const selectedDayReservas = reservasForDay(selectedDay);

  const handleCancelar = async (id: number) => {
    if (confirm('Cancelar esta reserva?')) {
      await cancelar.mutateAsync(id);
    }
  };

  const allAreas = Array.from(new Set(Object.keys(areaColors)));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>Reservas</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>Agendamento de áreas comuns</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={15} /> Nova Reserva
        </button>
      </div>

      {/* Area legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {allAreas.map(area => (
          <div key={area} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: areaBg[area] || 'var(--surface-2)', borderRadius: '20px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: areaColors[area] || 'var(--text-2)' }} />
            <span style={{ fontSize: '11px', color: areaColors[area] || 'var(--text-2)', fontWeight: '500' }}>{area}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Calendar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Week nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={prevWeek} style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={15} />
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: '500' }}>
              {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
            </span>
            <button onClick={nextWeek} style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDays.map((day, idx) => {
              const isToday = toDateStr(day) === today;
              const isSelected = toDateStr(day) === toDateStr(selectedDay);
              const dayReservas = reservasForDay(day);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '14px 10px', borderRight: idx < 6 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', minHeight: '120px',
                    background: isSelected ? 'var(--gold-dim)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{ptDays[idx]}</div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isToday ? 'var(--gold)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: isToday ? '700' : '400',
                      color: isToday ? '#0A0A0A' : isSelected ? 'var(--gold)' : 'var(--text)',
                    }}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dayReservas.slice(0, 3).map(r => (
                      <div key={r.id} style={{
                        padding: '2px 6px', borderRadius: '4px',
                        background: areaBg[r.areaComum] || 'var(--surface-3)',
                        fontSize: '10px', color: areaColors[r.areaComum] || 'var(--text-2)',
                        fontWeight: '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}>
                        {r.areaComum}
                      </div>
                    ))}
                    {dayReservas.length > 3 && (
                      <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>+{dayReservas.length - 3} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
            {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px' }}>
            {selectedDayReservas.length} reserva{selectedDayReservas.length !== 1 ? 's' : ''}
          </p>

          {selectedDayReservas.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Sem reservas neste dia" description="Clique em Nova Reserva para agendar." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDayReservas.map(r => (
                <div key={r.id} style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '12px', borderLeft: `3px solid ${areaColors[r.areaComum] || 'var(--gold)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: areaColors[r.areaComum] || 'var(--gold)' }}>{r.areaComum}</div>
                    <button onClick={() => handleCancelar(r.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                      title="Cancelar reserva">
                      <XCircle size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '3px' }}>{r.morador?.nome}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px' }}>{r.horarioInicio} — {r.horarioFim}</div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalReserva open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
