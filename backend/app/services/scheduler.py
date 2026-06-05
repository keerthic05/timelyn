from datetime import datetime, timedelta
from typing import List, Dict, Any

WINDOW_HOURS = {
    "morning":   (6, 12),
    "afternoon": (12, 17),
    "evening":   (17, 22),
    "any":       (0, 24),
}

def _window_score(block_start: datetime, preferred_window: str) -> int:
    hour = block_start.hour
    lo, hi = WINDOW_HOURS.get(preferred_window, (0, 24))
    return 1 if lo <= hour < hi else 0

def generate_schedule(
    tasks: List[Any],
    fixed_events: List[Any],
    days: int = 7,
    work_start: int = 9,
    work_end: int = 22,
) -> Dict[str, Any]:

    # Use naive local time throughout — no UTC conversion
    now = datetime.now()
    schedule_end = now + timedelta(days=days)

    # ── 1. Collect fixed blocks ──────────────────────────────────────────
    fixed_blocks = []
    for ev in fixed_events:
        # Strip timezone info if present so all comparisons are naive
        start = ev.start_time.replace(tzinfo=None) if ev.start_time else None
        end   = ev.end_time.replace(tzinfo=None)   if ev.end_time   else None
        if start and end and end > now:
            fixed_blocks.append({
                "start": start,
                "end":   end,
                "title": ev.title,
                "block_type": "fixed"
            })
    fixed_blocks.sort(key=lambda b: b["start"])

    # ── 2. Build free slots per day ──────────────────────────────────────
    free_slots: List[Dict] = []

    for day_offset in range(days):
        # Build this day's start and end boundaries
        base = now + timedelta(days=day_offset)
        day_start = base.replace(hour=work_start, minute=0, second=0, microsecond=0)
        day_end   = base.replace(hour=work_end,   minute=0, second=0, microsecond=0)

        # Don't schedule in the past
        slot_start = max(day_start, now)

        # Skip this day entirely if we're already past the work window
        if slot_start >= day_end:
            continue

        # Get fixed events that fall on this calendar date
        day_events = sorted(
            [b for b in fixed_blocks if b["start"].date() == base.date()],
            key=lambda b: b["start"]
        )

        # Carve out free slots around the fixed events
        for ev in day_events:
            if ev["start"] > slot_start:
                free_slots.append({"start": slot_start, "end": ev["start"]})
            slot_start = max(slot_start, ev["end"])

        # Add remaining time after last event to end of work day
        if slot_start < day_end:
            free_slots.append({"start": slot_start, "end": day_end})

    # ── 3. Sort tasks by deadline then priority ──────────────────────────
    def task_sort_key(t):
        dl = t.deadline.replace(tzinfo=None) if t.deadline else datetime.max
        return (dl, -t.priority)

    pending = sorted([t for t in tasks if not t.completed], key=task_sort_key)

    # ── 4. Greedily place tasks into free slots ──────────────────────────
    result_blocks = []
    explanation   = []
    available = [{"start": s["start"], "end": s["end"]} for s in free_slots]

    for task in pending:
        duration = timedelta(minutes=task.estimated_duration)
        deadline = task.deadline.replace(tzinfo=None) if task.deadline else datetime.max
        placed = False

        def make_sort_key(slots):
            def sort_key(i):
                slot = slots[i]
                window_match = 0 if _window_score(slot["start"], task.preferred_window) else 1
                return (window_match, slot["start"])
            return sort_key

        slots_sorted = sorted(range(len(available)), key=make_sort_key(available))

        for i in slots_sorted:
            slot = available[i]
            if slot["end"] - slot["start"] < duration:
                continue
            if slot["start"] + duration > deadline:
                continue

            task_start = slot["start"]
            task_end   = task_start + duration
            result_blocks.append({
                "block_type": "task",
                "title":      task.title,
                "start":      task_start.isoformat(),
                "end":        task_end.isoformat(),
                "task_id":    str(task.id),
                "reason":     f"Priority {task.priority}, deadline {deadline.strftime('%b %d %H:%M')}",
            })
            explanation.append(
                f"'{task.title}' scheduled {task_start.strftime('%a %b %d %H:%M')}–"
                f"{task_end.strftime('%H:%M')} (priority {task.priority}, "
                f"deadline {deadline.strftime('%b %d')}, window '{task.preferred_window}')."
            )
            available[i]["start"] = task_end
            placed = True
            break

        if not placed:
            explanation.append(
                f"⚠ Could not schedule '{task.title}' — not enough free time before "
                f"deadline {deadline.strftime('%b %d %H:%M')}."
            )

    # ── 5. Add fixed blocks to output ────────────────────────────────────
    for ev in fixed_blocks:
        if now <= ev["start"] <= schedule_end:
            result_blocks.append({
                "block_type": "fixed",
                "title":      ev["title"],
                "start":      ev["start"].isoformat(),
                "end":        ev["end"].isoformat(),
            })

    result_blocks.sort(key=lambda b: b["start"])
    return {"blocks": result_blocks, "explanation": explanation}