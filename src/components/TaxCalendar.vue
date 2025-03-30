<template>
  <div class="calendar-container">
    <div class="settings-panel">
      <select v-model="selectedYear">
        <option v-for="year in years" :key="year">{{ year }}</option>
      </select>
      <select v-model="selectedType">
        <option value="all">Тип</option>
        <option value="paid">Виконані</option>
        <option value="pending">Очікують</option>
      </select>
    </div>

    <div class="quarters">
      <div v-for="quarter in quarters" :key="quarter.name" class="quarter">
        <h3>{{ quarter.name }}</h3>
        <div class="months">
          <div
            v-for="month in quarter.months"
            :key="month.name"
            class="month"
            :class="{ current: isCurrentMonth(month.name) }"
            @click="selectMonth(month)"
          >
            <div
              v-for="event in month.events"
              :key="event.type"
              class="status"
              :class="[event.color, { done: event.done }]"
            >
              <span>{{ event.label }}</span>
              <span v-if="event.done">✔️</span>
            </div>
            <div class="month-name">{{ month.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedMonth" class="details">
      <h4>Деталі: {{ selectedMonth.name }}</h4>
      <ul>
        <li v-for="event in selectedMonth.events" :key="event.type">
          <strong>{{ event.label }}</strong> — {{ event.description }} (до {{ event.dueDate }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedYear = ref(2025);
const selectedType = ref('all');
const selectedMonth = ref(null);

const years = [2024, 2025, 2026];
const months = [
  'СІЧЕНЬ', 'ЛЮТИЙ', 'БЕРЕЗЕНЬ',
  'КВІТЕНЬ', 'ТРАВЕНЬ', 'ЧЕРВЕНЬ',
  'ЛИПЕНЬ', 'СЕРПЕНЬ', 'ВЕРЕСЕНЬ',
  'ЖОВТЕНЬ', 'ЛИСТОПАД', 'ГРУДЕНЬ'
];

const currentMonthIndex = new Date().getMonth();
function isCurrentMonth(monthName) {
  return months[currentMonthIndex] === monthName;
}

function selectMonth(month) {
  selectedMonth.value = month;
}

const quarters = [
  {
    name: 'I квартал',
    months: [
      {
        name: 'СІЧЕНЬ',
        events: [
          { type: 'ЄП', label: 'Сплата ЄП', color: 'blue', done: true, description: 'Єдиний податок за 4 квартал 2024', dueDate: '20 січня 2025' },
          { type: 'ВЗ', label: 'Сплата ВЗ', color: 'olive', done: true, description: 'Військовий збір за 4 квартал 2024', dueDate: '20 січня 2025' },
          { type: 'ЄСВ', label: 'Сплата ЄСВ', color: 'green', done: true, description: 'ЄСВ за 4 квартал 2024', dueDate: '20 січня 2025' },
        ]
      },
      {
        name: 'ЛЮТИЙ',
        events: []
      },
      {
        name: 'БЕРЕЗЕНЬ',
        events: []
      }
    ]
  },
  {
    name: 'II квартал',
    months: [
      {
        name: 'КВІТЕНЬ',
        events: [
          { type: 'DECLARATION', label: 'Податкова декларація', color: 'sky', done: false, description: 'Подача декларації за 1 квартал', dueDate: '10 квітня 2025' },
          { type: 'ЄП', label: 'Сплата ЄП', color: 'blue', done: false, description: 'Єдиний податок за 1 квартал', dueDate: '20 квітня 2025' },
          { type: 'ВЗ', label: 'Сплата ВЗ', color: 'olive', done: false, description: 'Військовий збір за 1 квартал', dueDate: '20 квітня 2025' },
          { type: 'ЄСВ', label: 'Сплата ЄСВ', color: 'green', done: false, description: 'ЄСВ за 1 квартал', dueDate: '20 квітня 2025' },
        ]
      },
      {
        name: 'ТРАВЕНЬ', events: []
      },
      {
        name: 'ЧЕРВЕНЬ', events: []
      }
    ]
  },
  {
    name: 'III квартал',
    months: [
      { name: 'ЛИПЕНЬ', events: [] },
      { name: 'СЕРПЕНЬ', events: [] },
      { name: 'ВЕРЕСЕНЬ', events: [] }
    ]
  },
  {
    name: 'IV квартал',
    months: [
      { name: 'ЖОВТЕНЬ', events: [] },
      { name: 'ЛИСТОПАД', events: [] },
      { name: 'ГРУДЕНЬ', events: [] }
    ]
  }
];
</script>

<style scoped>
.calendar-container {
  padding: 1rem;
  border-radius: 12px;
}

.settings-panel {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #fbb;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.quarters {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.quarter {
  flex: 1 1 22%;
}

.months {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month {
  padding: 0.5rem;
  background: #f3f3f3;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.month.current {
  border: 2px solid #f97316;
  background-color: #fff7ed;
}

.status {
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
}

.status.blue { background: #bae6fd; padding: 0.25rem; border-radius: 4px; }
.status.sky { background: #7dd3fc; padding: 0.25rem; border-radius: 4px; }
.status.olive { background: #a3a380; padding: 0.25rem; border-radius: 4px; }
.status.green { background: #6ee7b7; padding: 0.25rem; border-radius: 4px; }

.status.done {
  text-decoration: line-through;
  opacity: 0.6;
}

.month-name {
  margin-top: 0.25rem;
  font-weight: bold;
}

.details {
  margin-top: 2rem;
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
}
</style>