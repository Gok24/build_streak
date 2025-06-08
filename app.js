//  Gokul //

// Track expanded views for each streak
const expandedViews = new Set();

function toggleHeatmapView(streakId) {
  if (expandedViews.has(streakId)) {
    expandedViews.delete(streakId);
  } else {
    expandedViews.add(streakId);
  }
  updateStreakLogById(streakId);

setTimeout(() => {
    const heatmap = document.getElementById(`heatmap-${streakId}`);
    const wrapper = heatmap?.closest(".streak-box");

    if (wrapper) {
      const wrapperBottom = wrapper.offsetTop + wrapper.offsetHeight;
      window.scrollTo({
        top: wrapperBottom - window.innerHeight / 2, // center-ish scroll
        behavior: "smooth"
      });
    }
  }, 300);
}

// Format Date & Time nicely with AM/PM
function formatDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const localDate = new Date(year, month - 1, day); // local time base

  if (timeStr && timeStr.includes(":")) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    localDate.setHours(hours);
    localDate.setMinutes(minutes);
    localDate.setSeconds(0);
  }

  const displayDay = String(localDate.getDate()).padStart(2, '0');
  const displayMonth = String(localDate.getMonth() + 1).padStart(2, '0');
  const displayYear = localDate.getFullYear();

  let hoursFormatted = localDate.getHours();
  const minutesFormatted = String(localDate.getMinutes()).padStart(2, '0');
  const ampm = hoursFormatted >= 12 ? 'PM' : 'AM';
  hoursFormatted = hoursFormatted % 12 || 12;

  return `${displayDay}/${displayMonth}/${displayYear} at ${hoursFormatted}:${minutesFormatted} ${ampm}`;
}



// IndexedDB setup
let db;
const request = indexedDB.open("StreakTrackerDB", 1);

request.onerror = () => console.error("Failed to open DB");

request.onsuccess = (event) => {
  db = event.target.result;
  loadStreaks();
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("streaks", { keyPath: "id" });
  const entryStore = db.createObjectStore("entries", { keyPath: "entryId" });
  entryStore.createIndex("streakId", "streakId", { unique: false });
};

function generateId() {
  return crypto.randomUUID();
}

// Create a new streak
function createStreak() {
  const name = document.getElementById("streakName").value.trim();
  const description = document.getElementById("streakDescription").value.trim();
  if (!name) return alert("Streak name is required");

  const streak = {
    id: generateId(),
    name,
    description,
    createdAt: new Date().toISOString(),
    lastUpdated: null,
    isActive: true,
    currentStreakCount: 0,
    longestStreakCount: 0,
  };

  const tx = db.transaction("streaks", "readwrite");
  tx.objectStore("streaks").put(streak);
  tx.oncomplete = () => {
    document.getElementById("streakName").value = "";
    document.getElementById("streakDescription").value = "";
    loadStreaks();
    closecn(); // Assuming this is defined elsewhere
  };
}

// Load all streaks from DB
function loadStreaks() {
  const tx = db.transaction("streaks", "readonly");
  const store = tx.objectStore("streaks");
  const request = store.getAll();

  request.onsuccess = () => {
    const streaks = request.result;
    const container = document.getElementById("streakList");
    container.innerHTML = "";

    if (streaks.length === 0) {
      const sp = document.querySelector(".safepadding");
      sp.classList.remove("show");
    
      // 🐾 Catty phrase bank
      const phrases = [
        {
          title: "No habits? No hustle?",
          sub: "Sweetie, you’re practically a house cat already."
        },
        {
          title: "You didn’t start a habit, but you did open the app.",
          sub: "In cat terms: you sniffed the food, then walked away. Classic."
        },
        {
          title: "No goals, just vibes.",
          sub: "You’re basically a house plant with Wi-Fi."
        },
        {
          title: "You opened a habit tracker...",
          sub: "For what? ✨Emotional support?✨"
        },
        {
          title: "Not even one?",
          sub: "At this point, I think the couch has better habits than you."
        },
        {
          title: "This tracker is empty.",
          sub: "Just like my food bowl. And that’s rude."
        },
        {
          title: "No habits?",
          sub: "Wow. Even my litter box has more structure."
        },
        {
          title: "You haven't started yet?",
          sub: "That’s a bold strategy, Cotton Ball."
        },
        {
          title: "Empty tracker?",
          sub: "Congrats. You’re a purr-fessional procrastinator."
        },
        {
          title: "You’ve got big lion energy.",
          sub: "Stuck in a house cat’s schedule."
        }
      ];
    
      // 🐱 Pick a random phrase
      const pick = phrases[Math.floor(Math.random() * phrases.length)];
    
      // 🧱 Build the placeholder element
      const placeholder = document.createElement("div");
      placeholder.className = "no-streaks-placeholder";
      placeholder.innerHTML = `
        <div style="text-align: center; padding: 32px; color: #999; font-size: 1.1rem;">
          <span class="ptxt">
            <span class="bgx">${pick.title}</span><br>
            <span class="sml">${pick.sub}</span>
          </span>
          <div class="dot">
            <dotlottie-player
              class="danx"
              direction="1"
              id="animation_plant-office-desk_432b38a2-1151-11ee-81de-4b080921097c"
              speed="1"
              mode="normal"
              src="res/cutecat.lottie"
              loop="true"
              autoplay
            ></dotlottie-player>
          </div>
        </div>
      `;
    
      container.appendChild(placeholder);
      return;
    }
    
    sp = document.querySelector(".safepadding")
    sp.classList.add(".show")
//<span class="ptxt">No habits, no worries. <br> <span class="sml">Even lions rest 20 hours a day.</span></span>
//https://assets-v2.lottiefiles.com/a/83627cee-1153-11ee-b832-fb1242dd7de9/sSzsHHquis.lottie
    streaks.forEach(streak => {
      const div = document.createElement("div");
      div.className = "streak-box";
      div.innerHTML = `

  <div class="ton">
    <div class="title">
    <div class="m"
        <h3>${streak.name}</h3>
      </div>
      <div class="x">
            <button class="exvb" data-streak-id="${streak.id}" onclick="toggleHeatmapView('${streak.id}')">
<i class="fa-regular fa-expand" style="color: #999999;"></i>
</button>

      </div>
    </div>
    <div class="desc">
        <p>${streak.description || ""}</p>
    </div>
  </div>


<div class="hmapwrap">
    <div class="hexagrid">

        <div class="slogx">
            <div class="streak-log" id="log-${streak.id}">Loading...</div>
        </div>

        <div class="hmapx">
            <div class="heatmap" id="heatmap-${streak.id}"></div>
        </div>
        <div class="actx">
            <div class="actions"><button onclick="markToday('${streak.id}')">Done</button></div>
        </div>

    </div>
</div>
      `;
      container.appendChild(div);
      updateStreakLog(streak);
    });
  };
}

// Mark today's entry for a streak
function markToday(streakId) {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // FORCE local midnight
  const today = formatDateKey(now); 
  const entryStore = db.transaction("entries", "readonly").objectStore("entries");
  const index = entryStore.index("streakId");

  const request = index.getAll(streakId);
  request.onsuccess = () => {
    const entries = request.result;
    if (entries.some(entry => entry.date === today)) {
      alert("You've already marked today for this streak!");
      return;
    }

    const entry = {
      entryId: generateId(),
      streakId,
      date: today,
      time: new Date().toLocaleTimeString(),
      description: "",
      createdAt: new Date().toISOString()
    };

    const tx = db.transaction("entries", "readwrite");
    tx.objectStore("entries").put(entry);
    tx.oncomplete = () => {
      updateStreakLogById(streakId);
      disableMarkButton(streakId);
      
      // Delay and show animation
      setTimeout(() => {
        const greetx = document.querySelector(".greetx");
        const player = greetx?.querySelector("dotlottie-player");
      
        if (greetx && player) {
          greetx.classList.add("show");
          player.stop(); // Optional: reset before play
          player.play();
      
          // Auto-hide after 3 seconds
          setTimeout(() => {
            greetx.classList.remove("show");
          }, 3000);
        }
      }, 500); // delay before showing
       // 500ms delay before showing animation
    };
    
    
  };
}

function disableMarkButton(streakId) {
  const container = document.getElementById("heatmap-" + streakId)?.closest(".hmapwrap");
  if (!container) return;

  const btn = container.querySelector(".actions button");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Marked";
    btn.classList.add("marked-button");
  }
}


// Utility to format a Date object to YYYY-MM-DD
function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Fetch streak from DB and update UI
function updateStreakLogById(streakId) {
  const tx = db.transaction("streaks", "readonly");
  tx.objectStore("streaks").get(streakId).onsuccess = (e) => {
    const streak = e.target.result;
    updateStreakLog(streak);
  };
}

// Tooltip helpers
function showTooltip(content, x, y) {
  const tooltip = document.getElementById("tooltip");
  tooltip.textContent = content;
  tooltip.style.opacity = "1";
  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  tooltip.style.opacity = "0";
}

// Render heatmap cell with tooltip if applicable
function renderHeatmapCell(dateStr, todayStr, entry = null) {
  const cell = document.createElement("div");
  cell.className = "heatmap-cell";

  if (entry) {
    cell.classList.add("heat-filled");
    cell.addEventListener("mouseenter", e => showTooltip(formatDateTime(entry.date, entry.time), e.pageX, e.pageY));
    cell.addEventListener("mousemove", e => showTooltip(formatDateTime(entry.date, entry.time), e.pageX, e.pageY));
    cell.addEventListener("mouseleave", hideTooltip);
  }

  if (dateStr === todayStr) {
    cell.classList.add("today-cell");
  }

  return cell;
}

// Update streak log and heatmap
function updateStreakLog(streak) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);  // uses local time now
  
  const tx = db.transaction("entries", "readonly");
  const store = tx.objectStore("entries").index("streakId");
  const request = store.getAll(streak.id);

  request.onsuccess = () => {
    const entries = request.result.sort((a, b) => new Date(a.date) - new Date(b.date));
    const logEl = document.getElementById("log-" + streak.id);
    const heatmapContainer = document.getElementById("heatmap-" + streak.id);
    const isExpanded = expandedViews.has(streak.id);

    heatmapContainer.innerHTML = "";
    heatmapContainer.className = "heatmap" + (isExpanded ? " monthly" : "");

    // Calculate current and longest streaks
    let currentStreak = 0, longestStreak = 0, tempStreak = entries.length > 0 ? 1 : 0;

    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].date);
      const curr = new Date(entries[i].date);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const lastEntryDate = new Date(entries.at(-1)?.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastEntryDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
    currentStreak = (diffDays === 0 || diffDays === 1) ? tempStreak : 0;

    // Update DB
    const updatedStreak = {
      ...streak,
      currentStreakCount: currentStreak,
      longestStreakCount: Math.max(longestStreak, streak.longestStreakCount || 0),
      lastUpdated: new Date().toISOString()
    };
    const tx2 = db.transaction("streaks", "readwrite");
    tx2.objectStore("streaks").put(updatedStreak);
    const flameClass = currentStreak === 0 ? "inactive-flame" : "";

    logEl.innerHTML = `
    <div class="sblock">
    <div class="cs">
    <div class="icx">
    <i class="fa-duotone fa-solid fa-fire fa-shake ${flameClass}"></i>
    </div>
    <div class="txt">
       ${currentStreak} days
       </div>
      </div>
      <div class="ls">
       LS:${updatedStreak.longestStreakCount} days

      </div>
      </div>
    `;

    renderHeatmap(streak, entries, isExpanded, todayStr);
    const todayMarked = entries.some(entry => entry.date === todayStr);
if (todayMarked) disableMarkButton(streak.id);

  };
}


function getRecentPerformance(entries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const past7 = new Set();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7.add(formatDateKey(d));
  }

  return entries.filter(e => past7.has(e.date)).length;
}

function getCompletionRate(startDateStr, entries) {
  const start = new Date(startDateStr);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const uniqueDays = new Set(entries.map(e => e.date));
  const rate = (uniqueDays.size / totalDays) * 100;
  return rate.toFixed(1);
}


function computeStreaks(entries, todayStr) {
  const sorted = [...entries]
    .map(e => e.date)
    .sort(); // ascending dates

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  const dateSet = new Set(sorted);
  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i]);
    const prev = new Date(d);
    prev.setDate(d.getDate() - 1);

    if (i === sorted.length - 1 && formatDateKey(d) === todayStr) {
      streak = 1;
    } else if (dateSet.has(formatDateKey(prev))) {
      streak++;
    } else {
      break;
    }
  }

  currentStreak = streak;

  // Compute longest streak
  let maxStreak = 0;
  let current = 0;
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    if (i === 0) {
      current = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const diff = (d - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
      } else {
        current = 1;
      }
    }
    maxStreak = Math.max(maxStreak, current);
  }

  longestStreak = maxStreak;

  return { currentStreak, longestStreak };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


function getCurrentStreak(dateSet, todayStr) {
  let streak = 0;
  let currentDate = new Date(todayStr);
  while (true) {
    const dateStr = formatDateKey(currentDate);
    if (dateSet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLongestStreak(dates) {
  let maxStreak = 0, currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  return Math.max(maxStreak, currentStreak);
}

function getStreakGaps(dates) {
  let gapCount = 0;
  let longestGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const gap = (curr - prev) / (1000 * 60 * 60 * 24) - 1;
    if (gap > 0) {
      gapCount++;
      if (gap > longestGap) longestGap = gap;
    }
  }
  return { gapCount, longestGap };
}
function formatDateDDMMYYYY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
function getRecent7DayCount(dateSet) {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    if (dateSet.has(key)) count++;
  }
  return count;
}
function calculateMissedDays(dateSet, startDate, today) {
  let missed = 0;
  const current = new Date(startDate);
  while (current <= today) {
    const key = formatDateKey(current);
    if (!dateSet.has(key)) missed++;
    current.setDate(current.getDate() + 1);
  }
  return missed;
}



// Render heatmap: weekly or monthly view
function renderHeatmap(streak, entries, isExpanded, todayStr) {
  const heatmapContainer = document.getElementById("heatmap-" + streak.id);
  heatmapContainer.innerHTML = ""; // Clear previous

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const entryMap = new Map(entries.map(e => [e.date, e]));
  const sortedDates = entries.map(e => e.date).sort();
  const dateSet = new Set(sortedDates);
  
  const currentStreak = getCurrentStreak(dateSet, todayStr);
  const longestStreak = getLongestStreak(sortedDates);
  
  const { gapCount, longestGap } = getStreakGaps(sortedDates);
  
  
  // Optional:
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayLocal = new Date(ty, tm - 1, td);
  todayLocal.setHours(0, 0, 0, 0);
  
  const streakStart = new Date(streak.createdAt);
  streakStart.setHours(0, 0, 0, 0);
  
  const totalDays = Math.max(1, Math.floor((todayLocal - streakStart) / (1000 * 60 * 60 * 24)) + 1);
  const uniqueDays = new Set(entries.map(e => e.date));
  const completionRate = Math.round((uniqueDays.size / totalDays) * 100);
  
  // Now pass these values into your stats UI rendering logic
  
  if (!isExpanded) {
    // --- Weekly View ---
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const dayStr = formatDateKey(day);

      const wrapper = document.createElement("div");
      wrapper.className = "heatmap-cell";

      const label = document.createElement("div");
      label.className = "lbl";
      label.textContent = dayLabels[i];
      label.style.fontSize = "0.85em";

      const cell = document.createElement("div");
      cell.className = "heat-cell";

      if (entryMap.has(dayStr)) {
        const entry = entryMap.get(dayStr);
        cell.classList.add("heat-filled");
        cell.addEventListener("mouseenter", e => showTooltip(formatDateTime(entry.date, entry.time), e.pageX, e.pageY));
        cell.addEventListener("mousemove", e => showTooltip(formatDateTime(entry.date, entry.time), e.pageX, e.pageY));
        cell.addEventListener("mouseleave", hideTooltip);
      }

      if (dayStr === todayStr) {
        cell.classList.add("today-cell");
      }

      wrapper.appendChild(label);
      wrapper.appendChild(cell);
      heatmapContainer.appendChild(wrapper);
    }

    return; // Stop here if not expanded
  }

  // --- Monthly View Inside Floating Drawer ---

  // Remove any existing .flox if already open
  const existingFlox = document.querySelector(".flox");
  if (existingFlox) existingFlox.remove();

  // Build modal structure
  const flox = document.createElement("div");
  flox.className = "flox";
  flox.style.display = "block";

  const floater = document.createElement("div");
  floater.className = "floater";

  const floatwrap = document.createElement("div");
  floatwrap.className = "floatwrap";

  const sldwrap = document.createElement("div");
  sldwrap.className = "sldwrap";

  const slider = document.createElement("div");
  slider.className = "slider";
  slider.id = "closeBtn";

  sldwrap.appendChild(slider);
  floatwrap.appendChild(sldwrap);
  floater.appendChild(floatwrap);

  const hw = document.createElement("div");
  hw.className = "hw";

  const titleBar = document.createElement("div");
titleBar.className = "heatmap-title";
titleBar.textContent = streak.name;
hw.appendChild(titleBar);

  // Now render the actual monthly heatmap inside .hw
  const heatmapWrapper = document.createElement("div");
  heatmapWrapper.className = "heatmap-wrapper";

  const monthlyGrid = document.createElement("div");
  monthlyGrid.className = "heatmap monthly";

  // Add weekday labels
  // dayLabels.forEach(label => {
  //   const el = document.createElement("div");
  //   el.className = "heatmap-day-label";
  //   el.textContent = label;
  //   monthlyGrid.appendChild(el);
  // });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(streak.createdAt);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(1); // Start from the 1st of the month


let currentDate = new Date(streak.createdAt);
currentDate.setHours(0, 0, 0, 0);
currentDate.setDate(1);

let lastMonth = "";

while (currentDate <= today) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const thisMonth = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (thisMonth !== lastMonth) {
    // Month label
    const monthLabel = document.createElement("div");
    monthLabel.className = "heatmap-month-label";
    monthLabel.textContent = thisMonth;
    monthLabel.style.gridColumn = "span 7";
    monthlyGrid.appendChild(monthLabel);

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateKey(date);

      const cell = renderHeatmapCell(dateStr, todayStr, entryMap.get(dateStr));
      if (dateStr === todayStr) {
        cell.classList.add("selected");
      }

      monthlyGrid.appendChild(cell);
    }

    lastMonth = thisMonth;
  }

  // 🔧 Move to 1st of next month
  currentDate.setMonth(currentDate.getMonth() + 1);
  currentDate.setDate(1);
}

  


  heatmapWrapper.appendChild(monthlyGrid);

  hw.appendChild(heatmapWrapper);

  const statsDiv = document.createElement("div");
// --- Add Stats Box ---
const statsContainer = document.createElement("div");
statsContainer.className = "stats";
// const { currentStreak, longestStreak } = computeStreaks(entries, todayStr);

const statsHTML = `
  <div class="scontainer" style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center;">
    <div class="grid" style="display: grid; height: 100%; width: 100%; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(5, 1fr); gap: 16px; background-color: #eee; padding: 8px; border-radius: 8px;">

      <div style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 3; background-color: rgba(255, 182, 193, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p> <span class="bib"> <i class="fa-duotone fa-solid fa-fire statfire "></i> ${currentStreak}</span> <br> <span class="subr"> Streak </span></p>
      </div>

      <div style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 3; background-color: rgba(173, 255, 47, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">

        <p> <span class="bib"> <i class="fa-duotone fa-solid fa-fire statfire "></i> ${longestStreak}</span> <br> <span class="subr"> Longest </span></p>
      </div>

      <div class="revbox" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 6; background-color: rgba(255, 255, 224, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p>Total Entries <span class="bib"> ${entries.length}</span></p>
      </div>

      <div class="revbox revbox2" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 3; background-color: rgba(210, 180, 140, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p>Started On <span class="bib"> ${formatDateDDMMYYYY(new Date(streak.createdAt))} </span></p>
      </div>

      <div class="revbox revbox2 rb3" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 3; background-color: rgba(144, 238, 144, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p> Streak Gaps <span class="bib"> ${gapCount} </span></p>
      </div>

      <div class="revbox revbox2" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 2; background-color: rgba(255, 160, 122, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p>Longest Gap <span class="bib"> ${longestGap} days</span></p>
      </div>

      <div class="revbox revbox2" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 2; background-color: rgba(245, 245, 245, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p>Past week  <span class="bib"> ${getRecent7DayCount(dateSet)} <span class="mild"> / 7 days</span> </span></p>
      </div>

      <div class="revbox revbox2 rb3" style="font-family: 'M PLUS 2 Variable', sans-serif; grid-column: span 2; background-color: rgba(255, 248, 220, 0.5); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
        <p>Performance <span class="bib"> ${completionRate}% </span></p>
      </div>

    </div>
  </div>
`;

statsContainer.innerHTML = statsHTML;
hw.appendChild(statsContainer);


  // Final assembly
  floater.appendChild(floatwrap); // for slider
  floater.appendChild(hw);        // for heatmap
  flox.appendChild(floater);      // all inside modal
  document.body.appendChild(flox);
   // Append to body instead of heatmap container

  // --- Pull-down to close functionality ---
  let startY = 0;
  let isDragging = false;
  let dragOffset = 0;

  flox.addEventListener("touchstart", function (e) {
    startY = e.touches[0].clientY;
    isDragging = false;
    dragOffset = 0;
    floater.style.transition = "none";
  });

  flox.addEventListener("touchmove", function (e) {
    const moveY = e.touches[0].clientY;
    dragOffset = moveY - startY;

    if (dragOffset > 0) {
      isDragging = true;
      floater.style.transform = `translateY(${dragOffset}px)`;
    }
  });

  flox.addEventListener("touchend", function () {
    if (isDragging) {
      if (dragOffset > 150) {
        flox.style.transition = "all 0.3s ease";
        flox.style.display = "none";
        const btn = document.querySelector(`.exvb[data-streak-id="${streak.id}"]`);
        if (btn) btn.click();
      } else {
        floater.style.transition = "transform 0.3s ease";
        floater.style.transform = "translateY(0)";
      }
    }
  });

  slider.onclick = function () {
    flox.style.transition = "all 0.3s ease";
    flox.style.display = "none";
    const btn = document.querySelector(`.exvb[data-streak-id="${streak.id}"]`);
    if (btn) btn.click();
  };
}


