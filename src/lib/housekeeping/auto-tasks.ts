/**
 * Auto Housekeeping Task Generator
 * Creates housekeeping tasks automatically based on reservation events
 *
 * Called by:
 * - POST /api/reservations (check-in) → create "prepare room" task
 * - Night audit (checkout) → create "clean room" task
 * - Cron daily → create inspection tasks
 */
import { createAdminClient } from '@/lib/supabase/server';
import { format, addHours } from 'date-fns';

export type HousekeepingTaskType =
  | 'checkout_clean'    // Deep clean after checkout
  | 'turndown'          // Evening turndown service
  | 'inspection'        // Quality inspection
  | 'prepare_room'      // Setup before check-in
  | 'maintenance_clean' // Clean after maintenance
  | 'deep_clean'        // Scheduled deep clean
  | 'lost_found_check'; // Check for lost items

interface CreateTaskOptions {
  hotelId:       string;
  roomId:        string;
  type:          HousekeepingTaskType;
  priority?:     'low' | 'normal' | 'high' | 'urgent';
  reservationId?: string;
  scheduledFor?: string; // ISO datetime
  notes?:        string;
  assigneeId?:   string;
}

export async function createHousekeepingTask(opts: CreateTaskOptions) {
  const admin = createAdminClient();

  const LABELS: Record<HousekeepingTaskType, string> = {
    checkout_clean:    'ทำความสะอาดหลัง Check-out',
    turndown:          'Turndown Service',
    inspection:        'ตรวจสอบคุณภาพห้อง',
    prepare_room:      'เตรียมห้องก่อน Check-in',
    maintenance_clean: 'ทำความสะอาดหลังซ่อม',
    deep_clean:        'ทำความสะอาดลึก',
    lost_found_check:  'ตรวจสอบของหาย',
  };

  const DEFAULT_PRIORITY: Record<HousekeepingTaskType, string> = {
    checkout_clean:    'high',
    turndown:          'normal',
    inspection:        'normal',
    prepare_room:      'high',
    maintenance_clean: 'normal',
    deep_clean:        'low',
    lost_found_check:  'low',
  };

  const { data: task, error } = await admin
    .from('housekeeping_tasks')
    .insert({
      hotel_id:       opts.hotelId,
      room_id:        opts.roomId,
      reservation_id: opts.reservationId || null,
      task_type:      opts.type,
      title:          LABELS[opts.type],
      priority:       opts.priority || DEFAULT_PRIORITY[opts.type],
      status:         'pending',
      scheduled_for:  opts.scheduledFor || new Date().toISOString(),
      assigned_to:    opts.assigneeId || null,
      notes:          opts.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return task;
}

// Called when reservation is checked out (from night audit or manual)
export async function createCheckoutTasks(hotelId: string, reservationId: string) {
  const admin = createAdminClient();

  const { data: res } = await admin
    .from('reservations')
    .select('room_id, check_out, special_requests')
    .eq('id', reservationId).single();

  if (!res?.room_id) return;

  const tasks = [];

  // 1. Checkout clean (high priority)
  tasks.push(createHousekeepingTask({
    hotelId, roomId: res.room_id,
    type: 'checkout_clean', priority: 'high', reservationId,
    scheduledFor: res.check_out + 'T12:30:00',
    notes: res.special_requests ? `คำขอพิเศษ: ${res.special_requests}` : undefined,
  }));

  // 2. Lost & found check
  tasks.push(createHousekeepingTask({
    hotelId, roomId: res.room_id,
    type: 'lost_found_check', reservationId,
    scheduledFor: res.check_out + 'T13:00:00',
  }));

  // 3. Inspection after clean
  tasks.push(createHousekeepingTask({
    hotelId, roomId: res.room_id,
    type: 'inspection',
    scheduledFor: res.check_out + 'T14:00:00',
  }));

  await Promise.all(tasks);

  // Update room status to dirty
  await admin.from('rooms').update({ status: 'dirty' }).eq('id', res.room_id);
}

// Called before check-in
export async function createCheckInPrep(hotelId: string, reservationId: string) {
  const admin = createAdminClient();

  const { data: res } = await admin
    .from('reservations')
    .select('room_id, check_in, special_requests')
    .eq('id', reservationId).single();

  if (!res?.room_id) return;

  await createHousekeepingTask({
    hotelId, roomId: res.room_id,
    type: 'prepare_room', priority: 'high', reservationId,
    scheduledFor: res.check_in + 'T12:00:00',
    notes: res.special_requests || undefined,
  });
}

// Batch: create turndown tasks for all checked-in rooms
export async function createTurndownTasks(hotelId: string) {
  const admin = createAdminClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: checkedIn } = await admin
    .from('reservations')
    .select('id, room_id')
    .eq('hotel_id', hotelId)
    .eq('status', 'checked_in')
    .lte('check_in', today);

  const tasks = (checkedIn || []).map(res =>
    createHousekeepingTask({
      hotelId, roomId: res.room_id,
      type: 'turndown', reservationId: res.id,
      scheduledFor: today + 'T18:00:00',
    })
  );

  await Promise.allSettled(tasks);
  return tasks.length;
}
