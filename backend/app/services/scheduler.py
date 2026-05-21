from datetime import datetime, timedelta, timezone
from typing import List, Dict, AnyStr

WINDOW_HOURS = {
    "morning": (6, 12),
    "afternoon": (12, 17),
    "evening": (17, 22),
    "any": (0, 24),
}

def _window_score(block_start: datetime, preferred_window: str) -> int:
    """Returns 1 if the block falls in the preferred window, else 0,"""
    hour = block_start.hour
    lo, hi = WINDOW_HOURS.get(preferred_window, (0, 24))
    return 1 if lo <= hour < hi else 0

def generate_schedule(
        tasks: List[Any],
        fixed_events: List[Any],
        days: int =  7,
        work_start: int = 9,
        work_end: int = 22,
) -> Dict[str, Any]:
    """
    Greedy scheduling algorithm:
    1. Build free-time blocks for each day (work_start–work_end minus fixed events).
    2. Sort tasks by (deadline ASC, priority DESC).
    3. For each task, find the earliest free block that fits, preferring the
       user's preferred window. Place it and shrink the free block.
    Returns a dict with 'blocks' (the full schedule) and 'explanation' list.
    """
    now = datetime.now(timezone.utc)
    schedule_end = now + timedelta(days=days)

    # 1. Collect fixed blocks
    fixed_blocks = []
    for ev in fixed_events:
        start = ev.start if ev.start_time.tzinfo else ev.start_time.replace(tzinfo=timezone.utc)
        end = ev.end_time if ev.end_time.tzinfo else ev.end_time.replace(tzinfo=timezone.utc)
        if end > now:
            fixed_blocks.append({"start": start, "end": end, "title": ev.title, "type": "fixed"})
    fixed_blocks.sort(key=lambda b: b["start"])

    # build free slots per day
    free_slots: List[Dict] = []
    cursor = now.replace(hour=work_start, min=0, second=0, microsecond=0)
    if cursor < now:
        cursor = now

    for _ in range(days):
        day_start = cursor.replace(hour=work_start, minute=0, second=0, microsecond=0)
        day_end = cursor.replace(hour=work_end, minute=0, second=0, microsecond=0)
        # events of this day
        day_events = sorted(
            [b for b in fixed_blocks if b["start"].date() == day_start.date()],
            key=lambda b: b["start"]
        )
        slot_start = max(day_start, now)
        for ev in day_events:
            if ev["start"] > slot_start:
                free_slots.append({"start": slot_start, "end": ev["start"]})
            slot_start = max(slot_start, ev["end"])
        if slot_start < day_end:
            free_slots.append({"start": slot_start, "end": day_end})
        
        cursor += timedelta(days=1)

    # sort tasks
    def task_sort_key(t):
        d1 = t.deadline if t.deadline.tzinfo else t.deadline.replace(tzinfor=timezone.utc)
        return (d1, -t.priority)
    pending = sorted([t for t in tasks if not t.completed], key=task_sort_key)

    # place tasks into free slots
    result_blocks = []
    explanation = []
    slot_index = 0
    slot_offsets = [s["start"] for s in free_slots] # mutable cursor per slot
    # copy free_slots into mutable form
    available = [{"start": s["start"], "end": s["end"]} for s in free_slots]

    for task in pending:
        duration = timedelta(minutes=task.estimated_duration)
        deadline = task.deadline if task.deadline.tzinfo else task.deadline.replace(tzinfo=timezone.utc)
        placed = False
        # try each available slot; prefer window-matching slots first
        slots_sorted = sorted(
            range(len(available)),
            key=lambda i: (
                0 if _window_score(available[i]["start"], task.preferred_window) else 1,
                available[i]["start"]
            )
        )

        for i in slots_sorted:
            slot = available[i]
            slot_duration = slot["end"] - slot["start"]
            if slot_duration < duration:
                continue
            if slot["start"] + duration > deadline:
                continue # would miss deadline
            # place task here
            task_start = slot["start"]
            task_end = task_start + duration
            result_blocks.append({
                "type": "task",
                "title": task.title,
                "start": task_start.isoformat(),
                "end": task_end.isoformat(),
                "task_id": str(task.id),
                "reason": f"Priority {task.priority}, deadline {deadline.strftime('%b %d %H:%M')}",
            })
            explanation.append(
                f" '{task.title}' scheduled {task_start.strftime('%a %b %d %H:%M')}-"
                f"{task_end.strftime('%H:%M')} (priority {task.priority}, "
                f"deadline {deadline.strftime('%b %d')}, window '{task.preferred_window}')."
            )
            # shrink slot
            available[i]["start"] = task_end
            placed = True
            break

        if not placed:
            explanation.append(
                f"⚠ Could not schedule '{task.title}' -- not enough free time before deadline "
                f"{deadline.strftime('%b %d %H:%M')}."
            )

        # add fixed blocks to output
        for ev in fixed_blocks:
            if now <= ev["start"] <= schedule_end:
                result_blocks.append({
                    "type": "fixed",
                    "title": ev["title"],
                    "start": ev["start"].isoformat(),
                    "end": ev["end"].isoformat(),
                })
        result_blocks.sort(key=lambda b: b["start"])
        return {"blocks": result_blocks, "explanation": explanation}